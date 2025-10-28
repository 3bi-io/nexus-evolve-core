-- Phase 3E: Automation with Cron Jobs
-- Enable pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily evolution cycle (runs at 2 AM daily)
SELECT cron.schedule(
  'daily-evolution-cycle',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:='https://coobieessxvnujkkiadc.supabase.co/functions/v1/evolve-system',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule weekly capability discovery (runs at 3 AM every Sunday)
SELECT cron.schedule(
  'weekly-capability-discovery',
  '0 3 * * 0',
  $$
  SELECT net.http_post(
    url:='https://coobieessxvnujkkiadc.supabase.co/functions/v1/discover-capabilities',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Create function to auto-extract learnings from completed sessions
CREATE OR REPLACE FUNCTION auto_extract_learnings_on_session_end()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if session has at least 4 interactions
  IF (
    SELECT COUNT(*) 
    FROM interactions 
    WHERE session_id = NEW.id
  ) >= 4 THEN
    -- Schedule async extraction (via pg_net)
    PERFORM net.http_post(
      url := 'https://coobieessxvnujkkiadc.supabase.co/functions/v1/extract-learnings',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object('sessionId', NEW.id::text)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger auto-extraction when session is updated (e.g., marked as inactive)
CREATE TRIGGER trigger_auto_extract_learnings
  AFTER UPDATE ON sessions
  FOR EACH ROW
  WHEN (OLD.last_message_at IS DISTINCT FROM NEW.last_message_at)
  EXECUTE FUNCTION auto_extract_learnings_on_session_end();