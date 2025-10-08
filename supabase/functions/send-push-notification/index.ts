import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID keys for Web Push - In production, these should be environment variables
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = 'UUxK4O2NLNW3vWrCwpfN9-Qr4PNuVhONb5CqXJuVr5Y';

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, title, message, data, url } = await req.json();

    if (!userId) {
      throw new Error('userId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (subError) {
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    let failedCount = 0;

    // Send push notification to each subscription
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        const payload = JSON.stringify({
          title: title || 'Lobebo',
          message: message || 'You have a new notification',
          url: url || '/',
          data: data || {},
        });

        // Use Web Push API
        await sendWebPush(pushSubscription, payload, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
        sentCount++;
        console.log(`Push notification sent to subscription ${subscription.id}`);

      } catch (error) {
        console.error(`Failed to send push to subscription ${subscription.id}:`, error);
        failedCount++;

        // If subscription is invalid, remove it
        if (error instanceof Error && error.message.includes('410')) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', subscription.id);
          console.log(`Removed invalid subscription ${subscription.id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount,
        failed: failedCount,
        total: subscriptions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

// Simple Web Push implementation using Deno's built-in fetch
async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<void> {
  const endpoint = subscription.endpoint;
  
  // For now, use a simple POST request
  // In production, you should use proper Web Push protocol with VAPID
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TTL': '86400',
    },
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`Push failed with status ${response.status}`);
  }
}

serve(handler);
