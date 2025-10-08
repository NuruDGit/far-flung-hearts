-- Add cron jobs for notification processors

-- Process task reminders every 15 minutes
SELECT cron.schedule(
  'process-task-reminders',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://smatdnlednyhqsypmzzl.supabase.co/functions/v1/process-task-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYXRkbmxlZG55aHFzeXBtenpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjU3NDMsImV4cCI6MjA3NDI0MTc0M30.qio5GOi1N_4nBWsYZa97a9FfDENtoc3BNHwcjmSS8cs"}'::jsonb
  ) as request_id;
  $$
);

-- Process mood alerts once per day at 7 AM
SELECT cron.schedule(
  'process-mood-alerts',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://smatdnlednyhqsypmzzl.supabase.co/functions/v1/process-mood-alerts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYXRkbmxlZG55aHFzeXBtenpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjU3NDMsImV4cCI6MjA3NDI0MTc0M30.qio5GOi1N_4nBWsYZa97a9FfDENtoc3BNHwcjmSS8cs"}'::jsonb
  ) as request_id;
  $$
);

-- Process daily questions once per day at 8 AM
SELECT cron.schedule(
  'process-daily-questions',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://smatdnlednyhqsypmzzl.supabase.co/functions/v1/process-daily-questions',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYXRkbmxlZG55aHFzeXBtenpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjU3NDMsImV4cCI6MjA3NDI0MTc0M30.qio5GOi1N_4nBWsYZa97a9FfDENtoc3BNHwcjmSS8cs"}'::jsonb
  ) as request_id;
  $$
);