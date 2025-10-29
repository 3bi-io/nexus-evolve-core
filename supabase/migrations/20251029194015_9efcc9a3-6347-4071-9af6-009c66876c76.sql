-- Schedule low credit alert to run twice daily (morning and evening)
SELECT cron.schedule(
  'low-credit-alert-job',
  '0 9,18 * * *', -- 9 AM and 6 PM UTC daily
  $$
  SELECT
    net.http_post(
      url := 'https://coobieessxvnujkkiadc.supabase.co/functions/v1/send-low-credit-alert',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb2JpZWVzc3h2bnVqa2tpYWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg4NjYsImV4cCI6MjA3NzI1NDg2Nn0.YLEDjz3IRW5dBvBQTnK0ORv-XjU1cbNwGY6Laj2IV6k"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);