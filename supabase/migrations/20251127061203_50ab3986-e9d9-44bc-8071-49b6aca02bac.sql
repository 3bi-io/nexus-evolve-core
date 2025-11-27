-- Security Linter Fixes for Production Release

-- 1. Add missing search_path to function
CREATE OR REPLACE FUNCTION public.update_tsv_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.tsv := to_tsvector('english', COALESCE(NEW.topic, '') || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$function$;

-- 2. Add RLS policies to ai_response_cache
ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read cache entries" ON public.ai_response_cache;
DROP POLICY IF EXISTS "Only authenticated users can create cache entries" ON public.ai_response_cache;

-- Allow anonymous read access to cache (needed for anonymous users)
CREATE POLICY "Anyone can read cache entries"
ON public.ai_response_cache FOR SELECT
USING (true);

-- Only system can write cache entries
CREATE POLICY "Only authenticated users can create cache entries"
ON public.ai_response_cache FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 3. Ensure rate_limit_log has proper RLS
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Only service role can access rate limits" ON public.rate_limit_log;

-- Only service role can access rate limit logs (for admin purposes)
CREATE POLICY "Only service role can access rate limits"
ON public.rate_limit_log FOR ALL
USING (auth.role() = 'service_role');