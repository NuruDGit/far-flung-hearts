import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  kind: string;
  pair_id: string;
  meta: any;
}

interface NotificationPreferences {
  user_id: string;
  event_reminders: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting calendar reminder processing...');

    // Get all events starting in the next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const now = new Date();

    const { data: upcomingEvents, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('starts_at', now.toISOString())
      .lte('starts_at', tomorrow.toISOString());

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    console.log(`Found ${upcomingEvents?.length || 0} upcoming events`);

    let processedCount = 0;

    for (const event of upcomingEvents || []) {
      try {
        // Get pair members
        const { data: pair, error: pairError } = await supabase
          .from('pairs')
          .select('user_a, user_b')
          .eq('id', event.pair_id)
          .eq('status', 'active')
          .single();

        if (pairError || !pair) {
          console.log(`Skipping event ${event.id}: pair not found or inactive`);
          continue;
        }

        const userIds = [pair.user_a, pair.user_b].filter(Boolean);

        for (const userId of userIds) {
          // Get user notification preferences
          const { data: preferences } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (!preferences?.event_reminders) {
            console.log(`Skipping notifications for user ${userId}: event reminders disabled`);
            continue;
          }

          // Calculate reminder times (1 hour and 15 minutes before)
          const eventTime = new Date(event.starts_at);
          const oneHourBefore = new Date(eventTime.getTime() - 60 * 60 * 1000);
          const fifteenMinsBefore = new Date(eventTime.getTime() - 15 * 60 * 1000);

          const reminderTimes = [
            { time: oneHourBefore, type: '1_hour' },
            { time: fifteenMinsBefore, type: '15_minutes' }
          ];

          for (const reminder of reminderTimes) {
            // Check if we should send this reminder (within next hour)
            const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
            
            if (reminder.time >= now && reminder.time <= hourFromNow) {
              // Check if notification already exists
              const { data: existingNotification } = await supabase
                .from('notification_queue')
                .select('id')
                .eq('user_id', userId)
                .eq('notification_type', 'event_reminder')
                .contains('data', { event_id: event.id, reminder_type: reminder.type })
                .single();

              if (!existingNotification) {
                const deliveryMethods = [];
                if (preferences.email_notifications) deliveryMethods.push('email');
                if (preferences.push_notifications) deliveryMethods.push('push');

                // Queue the notification
                const { error: queueError } = await supabase
                  .from('notification_queue')
                  .insert({
                    user_id: userId,
                    notification_type: 'event_reminder',
                    title: `Upcoming Event: ${event.title}`,
                    message: generateReminderMessage(event, reminder.type),
                    delivery_method: deliveryMethods,
                    scheduled_for: reminder.time.toISOString(),
                    pair_id: event.pair_id,
                    data: {
                      event_id: event.id,
                      reminder_type: reminder.type,
                      event_title: event.title,
                      event_starts_at: event.starts_at,
                      event_kind: event.kind
                    }
                  });

                if (!queueError) {
                  processedCount++;
                  console.log(`Queued ${reminder.type} reminder for event "${event.title}" for user ${userId}`);
                } else {
                  console.error('Error queuing notification:', queueError);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
      }
    }

    console.log(`Successfully processed ${processedCount} reminder notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedEvents: upcomingEvents?.length || 0,
        queuedNotifications: processedCount 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in process-calendar-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

function generateReminderMessage(event: CalendarEvent, reminderType: string): string {
  const eventTime = new Date(event.starts_at);
  const timeString = event.all_day 
    ? 'All day' 
    : eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const timeUntil = reminderType === '1_hour' ? 'in 1 hour' : 'in 15 minutes';
  
  return `"${event.title}" starts ${timeUntil} at ${timeString}. Don't forget! 💕`;
}

serve(handler);