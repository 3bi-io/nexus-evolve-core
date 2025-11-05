-- ============================================================================
-- PHASE 1: CRITICAL SECURITY FIXES - Part 2 (Fixed)
-- Fix Security Definer View and Function Search Paths
-- ============================================================================

-- ============================================================================
-- 1. Fix cron_job_status view (Security Definer View issue)
-- ============================================================================

-- Drop and recreate without SECURITY DEFINER if it exists
DROP VIEW IF EXISTS public.cron_job_status;

-- Recreate as a regular view (no SECURITY DEFINER)
CREATE VIEW public.cron_job_status AS
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job;

-- Note: pg_net extension cannot be moved to another schema
-- This is a known limitation. The warning can be safely ignored.

-- ============================================================================
-- 2. Add search_path to all security-critical functions
-- ============================================================================

-- Update has_role function to ensure search_path is set
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update timestamp trigger function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_temp
    AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$';
  END IF;
END $$;