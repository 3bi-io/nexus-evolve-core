-- Add security features: IP encryption, rate limiting, UTC timezone fixes

-- Create helper function to encrypt IP addresses
CREATE OR REPLACE FUNCTION encrypt_ip(ip_address TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(ip_address, encryption_key),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to decrypt IP addresses (for admin use only)
CREATE OR REPLACE FUNCTION decrypt_ip(encrypted_ip TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(
    decode(encrypted_ip, 'base64'),
    encryption_key
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create rate_limit_log table for tracking requests
CREATE TABLE public.rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')
);

-- Create index for rate limiting lookups
CREATE INDEX idx_rate_limit_ip_window ON public.rate_limit_log(ip_hash, window_start);

-- Enable RLS on rate_limit_log
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add trigger to update rate_limit_log updated_at
CREATE TRIGGER update_rate_limit_log_updated_at
BEFORE UPDATE ON public.rate_limit_log
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update visitor_credits defaults to use UTC explicitly
ALTER TABLE public.visitor_credits 
  ALTER COLUMN last_visit_date SET DEFAULT (CURRENT_DATE AT TIME ZONE 'UTC'),
  ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'UTC'),
  ALTER COLUMN updated_at SET DEFAULT (now() AT TIME ZONE 'UTC');

-- Update credit_transactions to use UTC
ALTER TABLE public.credit_transactions
  ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'UTC');

-- Update user_subscriptions to use UTC
ALTER TABLE public.user_subscriptions
  ALTER COLUMN started_at SET DEFAULT (now() AT TIME ZONE 'UTC'),
  ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'UTC'),
  ALTER COLUMN updated_at SET DEFAULT (now() AT TIME ZONE 'UTC');

-- Function to clean up old rate limit logs (run via cron)
CREATE OR REPLACE FUNCTION cleanup_rate_limit_logs()
RETURNS void AS $$
BEGIN
  -- Delete logs older than 2 hours
  DELETE FROM public.rate_limit_log
  WHERE window_start < (now() AT TIME ZONE 'UTC') - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip_hash TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS JSONB AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
  v_allowed BOOLEAN;
BEGIN
  -- Calculate current window start (round down to nearest window)
  v_window_start := date_trunc('hour', now() AT TIME ZONE 'UTC');
  
  -- Try to get existing rate limit record with row lock
  SELECT request_count INTO v_current_count
  FROM public.rate_limit_log
  WHERE ip_hash = p_ip_hash 
    AND window_start = v_window_start
  FOR UPDATE;
  
  IF v_current_count IS NULL THEN
    -- No existing record, create new one
    INSERT INTO public.rate_limit_log (ip_hash, request_count, window_start)
    VALUES (p_ip_hash, 1, v_window_start);
    
    RETURN jsonb_build_object(
      'allowed', true,
      'current_count', 1,
      'limit', p_max_requests,
      'reset_at', v_window_start + (p_window_minutes || ' minutes')::INTERVAL
    );
  ELSE
    -- Check if under limit
    v_allowed := v_current_count < p_max_requests;
    
    IF v_allowed THEN
      -- Increment counter
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining IP encryption
COMMENT ON COLUMN public.visitor_credits.ip_encrypted IS 
  'IP address encrypted using pgp_sym_encrypt. Use decrypt_ip() function to view (admin only).';

COMMENT ON COLUMN public.visitor_credits.ip_hash IS 
  'SHA-256 hash of IP address for fast lookups. Never exposed to clients.';