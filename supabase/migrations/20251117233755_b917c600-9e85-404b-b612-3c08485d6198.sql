-- Secure cron_job_status view with RLS
-- Only super admins should see scheduled job information

-- Note: Views don't have RLS directly, so we convert to a SECURITY DEFINER function

-- Create a secure function wrapper
CREATE OR REPLACE FUNCTION public.get_cron_job_status()
RETURNS TABLE (
  jobid bigint,
  jobname text,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean,
  jobid_at_entry bigint
) 
SECURITY DEFINER
SET search_path = public, cron
LANGUAGE sql
AS $$
  -- Only allow super admins to view cron job status
  SELECT 
    j.jobid,
    j.jobname,
    j.schedule,
    j.command,
    j.nodename,
    j.nodeport,
    j.database,
    j.username,
    j.active,
    j.jobid as jobid_at_entry
  FROM cron.job j
  WHERE public.has_role(auth.uid(), 'super_admin'::app_role);
$$;

-- Grant execute permission only to authenticated users
GRANT EXECUTE ON FUNCTION public.get_cron_job_status() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_cron_job_status() IS 
  'Secure access to cron job status. Only super_admin role can view scheduled jobs.
  Replaced cron_job_status view with this secure function.
  Usage: SELECT * FROM get_cron_job_status();';

-- Drop the old view if it exists
DROP VIEW IF EXISTS public.cron_job_status;