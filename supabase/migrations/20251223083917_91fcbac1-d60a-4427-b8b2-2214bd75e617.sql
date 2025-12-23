-- =====================================================
-- COMPLETE REMAINING SECURITY FIXES
-- =====================================================

-- ===========================================
-- Fix visitor_credits security (restrict public access)
-- ===========================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view visitor credits" ON public.visitor_credits;
DROP POLICY IF EXISTS "System can manage visitor credits" ON public.visitor_credits;
DROP POLICY IF EXISTS "Service can manage visitor credits" ON public.visitor_credits;
DROP POLICY IF EXISTS "Service role can select visitor credits" ON public.visitor_credits;
DROP POLICY IF EXISTS "Service role can insert visitor credits" ON public.visitor_credits;
DROP POLICY IF EXISTS "Service role can update visitor credits" ON public.visitor_credits;

-- Create restrictive policies for visitor_credits
CREATE POLICY "Service role only select visitor credits"
ON public.visitor_credits
FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY "Service role only insert visitor credits"
ON public.visitor_credits
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only update visitor credits"
ON public.visitor_credits
FOR UPDATE
USING (auth.role() = 'service_role');

-- ===========================================
-- Tighten api_keys - add explicit column security note
-- ===========================================

COMMENT ON COLUMN public.api_keys.key_hash IS 
'SECURITY: This column should NEVER be exposed to clients. Only used for server-side verification.';

-- ===========================================
-- Fix rate_limit_log - add super admin view policy
-- ===========================================

-- Drop and recreate to avoid conflict
DROP POLICY IF EXISTS "Super admins can view rate limits" ON public.rate_limit_log;

CREATE POLICY "Super admins can view rate limits"
ON public.rate_limit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

-- ===========================================
-- Fix function missing search_path
-- ===========================================

CREATE OR REPLACE FUNCTION public.update_platform_improvements_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;