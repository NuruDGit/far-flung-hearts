import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXPORT-USER-DATA] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      logStep("Authentication failed", { error: userError?.message });
      throw new Error('Unauthorized');
    }

    logStep("User authenticated", { userId: user.id });

    // Fetch user's pair information first
    const { data: pairData } = await supabase
      .from('pairs')
      .select('id')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'active')
      .maybeSingle();

    const pairId = pairData?.id;

    logStep("Fetching user data");

    // Fetch all user data in parallel
    const [
      profile,
      messages,
      moods,
      moodAnalytics,
      goals,
      tasks,
      events,
      wishlist,
      gameScores,
      gameSessions,
      dailyAnswers,
      notificationPrefs,
      callHistory
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('messages').select('*').eq('sender_id', user.id),
      supabase.from('mood_logs').select('*').eq('user_id', user.id),
      supabase.from('mood_analytics').select('*').eq('user_id', user.id),
      pairId ? supabase.from('goalboard').select('*').eq('pair_id', pairId) : { data: [] },
      pairId ? supabase.from('goal_tasks').select('*').eq('pair_id', pairId) : { data: [] },
      pairId ? supabase.from('events').select('*').eq('pair_id', pairId) : { data: [] },
      supabase.from('gift_wishlist').select('*').eq('user_id', user.id),
      supabase.from('game_scores').select('*').eq('user_id', user.id),
      pairId ? supabase.from('game_sessions').select('*').eq('pair_id', pairId) : { data: [] },
      supabase.from('daily_question_answers').select('*').eq('user_id', user.id),
      supabase.from('notification_preferences').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('call_history').select('*').or(`caller_id.eq.${user.id},receiver_id.eq.${user.id}`)
    ]);

    logStep("Data fetched successfully");

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      metadata: {
        export_version: '1.0',
        gdpr_compliant: true,
        ccpa_compliant: true
      },
      profile: profile.data,
      messages: messages.data || [],
      mood_logs: moods.data || [],
      mood_analytics: moodAnalytics.data || [],
      goals: goals.data || [],
      tasks: tasks.data || [],
      events: events.data || [],
      wishlist: wishlist.data || [],
      game_scores: gameScores.data || [],
      game_sessions: gameSessions.data || [],
      daily_question_answers: dailyAnswers.data || [],
      notification_preferences: notificationPrefs.data,
      call_history: callHistory.data || [],
      data_retention_info: {
        active_account: "Data retained indefinitely while account is active",
        deleted_account: "30 days grace period, then permanent deletion",
        messages: "90 days after account deletion",
        analytics: "2 years retention"
      }
    };

    // Generate JSON file
    const json = JSON.stringify(exportData, null, 2);
    
    logStep("Export completed", { dataSize: json.length });

    return new Response(json, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="love-beyond-borders-export-${user.id}-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
