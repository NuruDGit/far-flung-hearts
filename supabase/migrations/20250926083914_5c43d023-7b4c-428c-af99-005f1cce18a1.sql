-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the process-calendar-reminders function to run every 15 minutes
SELECT cron.schedule(
  'process-calendar-reminders',
  '*/15 * * * *', -- every 15 minutes
  $$
  select
    net.http_post(
        url:='https://smatdnlednyhqsypmzzl.supabase.co/functions/v1/process-calendar-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYXRkbmxlZG55aHFzeXBtenpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjU3NDMsImV4cCI6MjA3NDI0MTc0M30.qio5GOi1N_4nBWsYZa97a9FfDENtoc3BNHwcjmSS8cs"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Schedule the send-notifications function to run every 5 minutes
SELECT cron.schedule(
  'send-notifications',
  '*/5 * * * *', -- every 5 minutes
  $$
  select
    net.http_post(
        url:='https://smatdnlednyhqsypmzzl.supabase.co/functions/v1/send-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYXRkbmxlZG55aHFzeXBtenpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjU3NDMsImV4cCI6MjA3NDI0MTc0M30.qio5GOi1N_4nBWsYZa97a9FfDENtoc3BNHwcjmSS8cs"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Create trigger to set up default notification preferences for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to automatically create notification preferences when a user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notification_preferences();