-- ============================================
-- PHASE 1: Final Database Security Fixes
-- ============================================

-- 1. Move vector extension to extensions schema
ALTER EXTENSION vector SET SCHEMA extensions;

-- 2. Fix check_rate_limit function with proper search path
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_hash text, 
  p_max_requests integer DEFAULT 100, 
  p_window_minutes integer DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
  v_allowed BOOLEAN;
BEGIN
  v_window_start := date_trunc('hour', now() AT TIME ZONE 'UTC');
  
  SELECT request_count INTO v_current_count
  FROM public.rate_limit_log
  WHERE ip_hash = p_ip_hash 
    AND window_start = v_window_start
  FOR UPDATE;
  
  IF v_current_count IS NULL THEN
    INSERT INTO public.rate_limit_log (ip_hash, request_count, window_start)
    VALUES (p_ip_hash, 1, v_window_start);
    
    RETURN jsonb_build_object(
      'allowed', true,
      'current_count', 1,
      'limit', p_max_requests,
      'reset_at', v_window_start + (p_window_minutes || ' minutes')::INTERVAL
    );
  ELSE
    v_allowed := v_current_count < p_max_requests;
    
    IF v_allowed THEN
      UPDATE public.rate_limit_log
      SET request_count = request_count + 1,
          updated_at = now() AT TIME ZONE 'UTC'
      WHERE ip_hash = p_ip_hash 
        AND window_start = v_window_start;
      
      v_current_count := v_current_count + 1;
    END IF;
    
    RETURN jsonb_build_object(
      'allowed', v_allowed,
      'current_count', v_current_count,
      'limit', p_max_requests,
      'reset_at', v_window_start + (p_window_minutes || ' minutes')::INTERVAL
    );
  END IF;
END;
$function$;