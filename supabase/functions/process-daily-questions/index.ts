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
    let notificationsQueued = 0;

    // Get all active pairs
    const { data: activePairs, error: pairsError } = await supabase
      .from('pairs')
      .select('id, user_a, user_b')
      .eq('status', 'active');

    if (pairsError) {
      throw pairsError;
    }

    console.log(`Processing daily questions for ${activePairs?.length || 0} active pairs`);

    for (const pair of activePairs || []) {
      // Get or create today's question
      const { data: questionData } = await supabase
        .rpc('get_or_create_daily_question', { target_pair_id: pair.id })
        .single();

      const question = questionData as { id: string; question_text: string; question_date: string } | null;
      if (!question) continue;

      // Check if question has been answered
      const { data: answers } = await supabase
        .from('daily_question_answers')
        .select('user_id')
        .eq('daily_question_id', question.id);

      const answeredUserIds = new Set(answers?.map(a => a.user_id) || []);

      for (const userId of [pair.user_a, pair.user_b]) {
        if (answeredUserIds.has(userId)) continue; // Already answered

        // Check notification preferences
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!prefs?.daily_questions) continue;

        const deliveryMethods = [];
        if (prefs.email_notifications) deliveryMethods.push('email');
        if (prefs.push_notifications) deliveryMethods.push('push');

        if (deliveryMethods.length === 0) continue;

        // Check if we've already sent notification today
        const { data: existing } = await supabase
          .from('notification_queue')
          .select('id')
          .eq('user_id', userId)
          .eq('notification_type', 'daily_question')
          .gte('created_at', new Date(today).toISOString())
          .maybeSingle();

        if (existing) continue;

        // Schedule for morning (9 AM in user's timezone)
        const scheduledTime = new Date();
        scheduledTime.setHours(9, 0, 0, 0);

        // If it's already past 9 AM, send immediately
        const sendTime = scheduledTime < new Date() ? new Date() : scheduledTime;

        await supabase
          .from('notification_queue')
          .insert({
            user_id: userId,
            pair_id: pair.id,
            notification_type: 'daily_question',
            title: 'Daily Question',
            message: `Today's question: ${question.question_text}`,
            delivery_method: deliveryMethods,
            scheduled_for: sendTime.toISOString(),
            data: {
              question_id: question.id,
              question_text: question.question_text,
              question_date: question.question_date
            }
          });

        notificationsQueued++;
      }
    }

    console.log(`Queued ${notificationsQueued} daily question notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pairs_processed: activePairs?.length || 0,
        notifications_queued: notificationsQueued
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing daily questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
