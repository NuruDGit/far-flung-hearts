import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueuedNotification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  delivery_method: string[];
  scheduled_for: string;
  pair_id: string | null;
  data: any;
  attempts: number;
  max_attempts: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting notification delivery processing...');

    // Get notifications ready to be sent
    const now = new Date();
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString())
      .lt('attempts', 3) // Don't retry more than 3 times
      .order('scheduled_for', { ascending: true });

    if (fetchError) {
      console.error('Error fetching pending notifications:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingNotifications?.length || 0} notifications to process`);

    let sentCount = 0;
    let failedCount = 0;

    for (const notification of pendingNotifications || []) {
      try {
        // Get user profile for email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, display_name')
          .eq('id', notification.user_id)
          .single();

        if (!profile?.email) {
          console.log(`Skipping notification ${notification.id}: no email found for user`);
          await markNotificationFailed(supabase, notification.id, 'No email address found');
          failedCount++;
          continue;
        }

        let deliverySuccess = false;
        const deliveryResults = [];

        const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
        
        // Process each delivery method
        for (const method of notification.delivery_method) {
          try {
            if (method === 'email') {
              console.log(`📧 Sending email to ${profile.email}: ${notification.title}`);
              
              if (!profile.email) {
                throw new Error('User email not found');
              }
              
              const emailResponse = await resend.emails.send({
                from: 'Lovable Calendar <notifications@resend.dev>',
                to: [profile.email],
                subject: notification.title,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">${notification.title}</h2>
                    <p style="color: #666; line-height: 1.6;">${notification.message}</p>
                    ${notification.data?.event_url ? `<p><a href="${notification.data.event_url}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Event</a></p>` : ''}
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">This is an automated reminder from your Lovable Calendar.</p>
                  </div>
                `,
              });
              
              if (emailResponse.error) {
                throw new Error(`Email sending failed: ${emailResponse.error.message}`);
              }
              
              console.log('Email sent successfully:', emailResponse.data?.id);
              deliveryResults.push({ method: 'email', success: true });
              deliverySuccess = true;
            } else if (method === 'push') {
              // Send actual push notification
              const pushResponse = await fetch(
                `${supabaseUrl}/functions/v1/send-push-notification`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                  },
                  body: JSON.stringify({
                    userId: notification.user_id,
                    title: notification.title,
                    message: notification.message,
                    data: notification.data,
                    url: notification.data?.url || '/app',
                  }),
                }
              );

              if (!pushResponse.ok) {
                throw new Error(`Push notification failed with status ${pushResponse.status}`);
              }

              const pushResult = await pushResponse.json();
              console.log(`📱 Push sent to ${pushResult.sent} device(s)`);
              
              if (pushResult.sent > 0) {
                deliveryResults.push({ method: 'push', success: true });
                deliverySuccess = true;
              } else {
                deliveryResults.push({ 
                  method: 'push', 
                  success: false, 
                  error: 'No active push subscriptions' 
                });
              }
            }
          } catch (methodError) {
            console.error(`Error sending ${method} notification:`, methodError);
            deliveryResults.push({ 
              method, 
              success: false, 
              error: methodError instanceof Error ? methodError.message : String(methodError)
            });
          }
        }

        if (deliverySuccess) {
          // Mark as sent and record in history
          await Promise.all([
            supabase
              .from('notification_queue')
              .update({
                status: 'sent',
                sent_at: now.toISOString(),
                attempts: notification.attempts + 1
              })
              .eq('id', notification.id),
            
            supabase
              .from('notification_history')
              .insert({
                user_id: notification.user_id,
                notification_type: notification.notification_type,
                title: notification.title,
                message: notification.message,
                delivery_method: deliveryResults.filter(r => r.success).map(r => r.method).join(','),
                status: 'delivered',
                pair_id: notification.pair_id,
                data: {
                  ...notification.data,
                  delivery_results: deliveryResults
                }
              })
          ]);

          sentCount++;
          console.log(`✅ Successfully sent notification ${notification.id}`);
        } else {
          await markNotificationFailed(
            supabase, 
            notification.id, 
            `All delivery methods failed: ${deliveryResults.map(r => `${r.method}: ${r.error || 'unknown error'}`).join('; ')}`
          );
          failedCount++;
        }

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        await markNotificationFailed(supabase, notification.id, error instanceof Error ? error.message : String(error));
        failedCount++;
      }
    }

    console.log(`Notification processing complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedNotifications: pendingNotifications?.length || 0,
        sentCount,
        failedCount
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function markNotificationFailed(supabase: any, notificationId: string, errorMessage: string) {
  await supabase
    .from('notification_queue')
    .update({
      status: 'failed',
      error_message: errorMessage,
      attempts: supabase.sql`attempts + 1`
    })
    .eq('id', notificationId);
}

serve(handler);