-- ============================================================================
-- PHASE 5: SECURITY HARDENING
-- Fix all SECURITY DEFINER functions to have proper search_path
-- ============================================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix encrypt_ip function
CREATE OR REPLACE FUNCTION public.encrypt_ip(ip_address text, encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(ip_address, encryption_key),
    'base64'
  );
END;
$function$;

-- Fix decrypt_ip function
CREATE OR REPLACE FUNCTION public.decrypt_ip(encrypted_ip text, encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN pgp_sym_decrypt(
    decode(encrypted_ip, 'base64'),
    encryption_key
  );
END;
$function$;

-- Fix cleanup_rate_limit_logs function
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Delete logs older than 2 hours
  DELETE FROM public.rate_limit_log
  WHERE window_start < (now() AT TIME ZONE 'UTC') - INTERVAL '2 hours';
END;
$function$;

-- Fix process_referral_signup function
CREATE OR REPLACE FUNCTION public.process_referral_signup(p_referral_code text, p_referred_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_referral_id UUID;
  v_referrer_id UUID;
  v_reward_id UUID;
BEGIN
  -- Find the referral
  SELECT id, referrer_id INTO v_referral_id, v_referrer_id
  FROM public.referrals
  WHERE referral_code = p_referral_code
  AND status = 'pending';
  
  IF v_referral_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or already used referral code');
  END IF;
  
  -- Update referral status
  UPDATE public.referrals
  SET status = 'signed_up',
      referred_user_id = p_referred_user_id
  WHERE id = v_referral_id;
  
  -- Create reward for referrer (100 bonus credits)
  INSERT INTO public.referral_rewards (user_id, referral_id, reward_type, reward_value)
  VALUES (v_referrer_id, v_referral_id, 'credits', 100)
  RETURNING id INTO v_reward_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral_id,
    'reward_id', v_reward_id
  );
END;
$function$;

-- Fix update_user_preferences_updated_at function
CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix auto_extract_learnings_on_session_end function
CREATE OR REPLACE FUNCTION public.auto_extract_learnings_on_session_end()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only trigger if session has at least 4 interactions
  IF (
    SELECT COUNT(*) 
    FROM public.interactions 
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
$function$;

-- Fix trigger_generate_embedding function
CREATE OR REPLACE FUNCTION public.trigger_generate_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  supabase_url text;
  service_role_key text;
  text_content text;
BEGIN
  -- Get text content based on table
  IF TG_TABLE_NAME = 'agent_memory' THEN
    text_content := NEW.context_summary;
  ELSIF TG_TABLE_NAME = 'knowledge_base' THEN
    text_content := COALESCE(NEW.content, NEW.topic);
  ELSE
    RAISE EXCEPTION 'Unsupported table: %', TG_TABLE_NAME;
  END IF;

  -- Only proceed if we have text content
  IF text_content IS NULL OR text_content = '' THEN
    RETURN NEW;
  END IF;

  -- Get Supabase URL from environment
  supabase_url := 'https://coobieessxvnujkkiadc.supabase.co';
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- If service role key not configured, skip silently (embeddings will be NULL)
  IF service_role_key IS NULL OR service_role_key = '' THEN
    RAISE NOTICE 'Service role key not configured, skipping embedding generation';
    RETURN NEW;
  END IF;

  -- Call generate-embeddings edge function asynchronously via pg_net
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/generate-embeddings',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'text', text_content,
      'table', TG_TABLE_NAME,
      'record_id', NEW.id::text
    )
  );

  RETURN NEW;
END;
$function$;