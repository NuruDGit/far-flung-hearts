import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];
    let alertsQueued = 0;

    // Get all active pairs
    const { data: activePairs, error: pairsError } = await supabase
      .from('pairs')
      .select('id, user_a, user_b')
      .eq('status', 'active');

    if (pairsError) {
      throw pairsError;
    }

    console.log(`Checking ${activePairs?.length || 0} active pairs for mood logging`);

    for (const pair of activePairs || []) {
      for (const userId of [pair.user_a, pair.user_b]) {
        // Check if user has logged mood today
        const { data: todayLog } = await supabase
          .from('mood_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

        if (todayLog) continue; // Already logged today

        // Check notification preferences
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!prefs?.mood_alerts) continue;

        const deliveryMethods = [];
        if (prefs.email_notifications) deliveryMethods.push('email');
        if (prefs.push_notifications) deliveryMethods.push('push');

        if (deliveryMethods.length === 0) continue;

        // Check if we've already sent a reminder today
        const { data: existing } = await supabase
          .from('notification_queue')
          .select('id')
          .eq('user_id', userId)
          .eq('notification_type', 'mood_reminder')
          .gte('created_at', new Date(today).toISOString())
          .maybeSingle();

        if (existing) continue;

        // Schedule reminder for evening (7 PM in user's timezone)
        const scheduledTime = new Date();
        scheduledTime.setHours(19, 0, 0, 0);

        // Only queue if scheduled time is in the future
        if (scheduledTime > new Date()) {
          await supabase
            .from('notification_queue')
            .insert({
              user_id: userId,
              pair_id: pair.id,
              notification_type: 'mood_reminder',
              title: 'Mood Check-in',
              message: "Don't forget to log how you're feeling today! 💭",
              delivery_method: deliveryMethods,
              scheduled_for: scheduledTime.toISOString(),
              data: {
                date: today
              }
            });

          alertsQueued++;
        }
      }
    }

    console.log(`Queued ${alertsQueued} mood alerts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pairs_checked: activePairs?.length || 0,
        alerts_queued: alertsQueued
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing mood alerts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
