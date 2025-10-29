-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule subscription renewal job (runs every hour)
SELECT cron.schedule(
  'process-subscription-renewals-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://coobieessxvnujkkiadc.supabase.co/functions/v1/process-subscription-renewals',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb2JpZWVzc3h2bnVqa2tpYWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg4NjYsImV4cCI6MjA3NzI1NDg2Nn0.YLEDjz3IRW5dBvBQTnK0ORv-XjU1cbNwGY6Laj2IV6k"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule daily credit reset job (runs daily at 00:00 UTC)
SELECT cron.schedule(
  'reset-daily-credits-midnight',
  '0 0 * * *', -- Every day at midnight UTC
  $$
  SELECT
    net.http_post(
        url:='https://coobieessxvnujkkiadc.supabase.co/functions/v1/reset-daily-credits',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb2JpZWVzc3h2bnVqa2tpYWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg4NjYsImV4cCI6MjA3NzI1NDg2Nn0.YLEDjz3IRW5dBvBQTnK0ORv-XjU1cbNwGY6Laj2IV6k"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Create a view to monitor cron jobs
CREATE OR REPLACE VIEW cron_job_status AS
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job
ORDER BY jobname;