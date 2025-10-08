import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Task {
  id: string;
  title: string;
  due_at: string;
  pair_id: string;
  assigned_to: string | null;
}

interface NotificationPreferences {
  user_id: string;
  task_reminders: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch tasks due within the next 24 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: upcomingTasks, error: tasksError } = await supabase
      .from('goal_tasks')
      .select('id, title, due_at, pair_id, assigned_to')
      .gte('due_at', now.toISOString())
      .lte('due_at', tomorrow.toISOString())
      .eq('status_column', 'todo')
      .eq('is_archived', false);

    if (tasksError) {
      throw tasksError;
    }

    console.log(`Found ${upcomingTasks?.length || 0} upcoming tasks`);

    let remindersQueued = 0;

    for (const task of upcomingTasks || []) {
      // Get pair members
      const { data: pair } = await supabase
        .from('pairs')
        .select('user_a, user_b')
        .eq('id', task.pair_id)
        .eq('status', 'active')
        .single();

      if (!pair) continue;

      // Determine who to notify
      const usersToNotify = task.assigned_to 
        ? [task.assigned_to]
        : [pair.user_a, pair.user_b];

      for (const userId of usersToNotify) {
        // Check notification preferences
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!prefs?.task_reminders) continue;

        const deliveryMethods = [];
        if (prefs.email_notifications) deliveryMethods.push('email');
        if (prefs.push_notifications) deliveryMethods.push('push');

        if (deliveryMethods.length === 0) continue;

        // Calculate reminder times (1 hour and 15 minutes before)
        const taskDue = new Date(task.due_at);
        const oneHourBefore = new Date(taskDue.getTime() - 60 * 60 * 1000);
        const fifteenMinBefore = new Date(taskDue.getTime() - 15 * 60 * 1000);

        for (const reminderTime of [oneHourBefore, fifteenMinBefore]) {
          // Only queue if reminder is in the next hour
          if (reminderTime > now && reminderTime <= new Date(now.getTime() + 60 * 60 * 1000)) {
            // Check for existing notification
            const { data: existing } = await supabase
              .from('notification_queue')
              .select('id')
              .eq('user_id', userId)
              .eq('notification_type', 'task_reminder')
              .contains('data', { task_id: task.id })
              .eq('scheduled_for', reminderTime.toISOString())
              .maybeSingle();

            if (existing) continue;

            const reminderType = reminderTime === oneHourBefore ? '1 hour' : '15 minutes';
            
            await supabase
              .from('notification_queue')
              .insert({
                user_id: userId,
                pair_id: task.pair_id,
                notification_type: 'task_reminder',
                title: 'Task Reminder',
                message: generateReminderMessage(task, reminderType),
                delivery_method: deliveryMethods,
                scheduled_for: reminderTime.toISOString(),
                data: {
                  task_id: task.id,
                  task_title: task.title,
                  due_at: task.due_at,
                  reminder_type: reminderType
                }
              });

            remindersQueued++;
          }
        }
      }
    }

    console.log(`Queued ${remindersQueued} task reminders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        tasks_processed: upcomingTasks?.length || 0,
        reminders_queued: remindersQueued
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing task reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateReminderMessage(task: Task, reminderType: string): string {
  return `Your task "${task.title}" is due in ${reminderType}!`;
}
