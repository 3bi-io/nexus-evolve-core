-- ============================================
-- CRON JOB ACTIVATION SCRIPT
-- ============================================
-- Execute this SQL in Supabase SQL Editor to activate automated platform features
-- 
-- Project: coobieessxvnujkkiadc
-- Date: 2025-11-06
-- 
-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/coobieessxvnujkkiadc/sql/new
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- 4. Verify execution by checking edge function logs
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- 1. SCHEDULED TREND MONITOR (Every 6 hours)
-- ============================================
-- Monitors social trends, sentiment, competitors, and keywords
SELECT cron.schedule(
  'scheduled-trend-monitor-6h',
  '0 */6 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://coobieessxvnujkkiadc.supabase.co/functions/v1/scheduled-trend-monitor',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb2JpZWVzc3h2bnVqa2tpYWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg4NjYsImV4cCI6MjA3NzI1NDg2Nn0.YLEDjz3IRW5dBvBQTnK0ORv-XjU1cbNwGY6Laj2IV6k"}'::jsonb,
      body := jsonb_build_object('scheduled', true, 'timestamp', now())
    ) as request_id;
  $$
);

-- ============================================
-- 2. CONTENT GENERATION WORKER (Every 5 minutes)
-- ============================================
-- Processes queued content generation tasks
SELECT cron.schedule(
  'content-generation-worker-5m',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://coobieessxvnujkkiadc.supabase.co/functions/v1/content-generation-worker',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb2JpZWVzc3h2bnVqa2tpYWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg4NjYsImV4cCI6MjA3NzI1NDg2Nn0.YLEDjz3IRW5dBvBQTnK0ORv-XjU1cbNwGY6Laj2IV6k"}'::jsonb,
      body := jsonb_build_object('scheduled', true, 'timestamp', now())
    ) as request_id;
  $$
);

-- ============================================
-- 3. AUTOMATION PIPELINE EXECUTOR (Every 10 minutes)
-- ============================================
-- Executes scheduled automation pipelines
SELECT cron.schedule(
  'automation-pipeline-executor-10m',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://coobieessxvnujkkiadc.supabase.co/functions/v1/automation-pipeline-executor',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb2JpZWVzc3h2bnVqa2tpYWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg4NjYsImV4cCI6MjA3NzI1NDg2Nn0.YLEDjz3IRW5dBvBQTnK0ORv-XjU1cbNwGY6Laj2IV6k"}'::jsonb,
      body := jsonb_build_object('scheduled', true, 'timestamp', now())
    ) as request_id;
  $$
);

-- ============================================
-- 4. CLEANUP EXPIRED CACHE (Every hour)
-- ============================================
-- Removes expired AI response cache entries
SELECT cron.schedule(
  'cleanup-expired-cache-hourly',
  '0 * * * *',
  $$
  SELECT public.cleanup_expired_cache();
  $$
);

-- ============================================
-- 5. RESET DAILY CREDITS (Daily at 12:00 AM UTC)
-- ============================================
-- Resets visitor daily credits and cleans up old data
SELECT cron.schedule(
  'reset-daily-credits-midnight',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://coobieessxvnujkkiadc.supabase.co/functions/v1/reset-daily-credits',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb2JpZWVzc3h2bnVqa2tpYWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg4NjYsImV4cCI6MjA3NzI1NDg2Nn0.YLEDjz3IRW5dBvBQTnK0ORv-XjU1cbNwGY6Laj2IV6k"}'::jsonb,
      body := jsonb_build_object('scheduled', true, 'timestamp', now())
    ) as request_id;
  $$
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify cron jobs are scheduled:

-- View all scheduled jobs:
SELECT * FROM cron.job;

-- View recent job runs:
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- ============================================
-- MAINTENANCE COMMANDS (optional)
-- ============================================
-- To unschedule a job if needed:
-- SELECT cron.unschedule('job-name-here');

-- To view job execution history:
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'job-name-here') ORDER BY start_time DESC;
