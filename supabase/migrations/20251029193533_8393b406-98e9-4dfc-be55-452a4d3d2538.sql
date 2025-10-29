-- ============================================================================
-- PRIORITY 1: Set up daily visitor credit reset cron job
-- ============================================================================

-- Schedule the reset-daily-credits function to run daily at 00:00 UTC
SELECT cron.schedule(
  'reset-daily-credits-job',
  '0 0 * * *', -- Every day at midnight UTC
  $$
  SELECT
    net.http_post(
      url := 'https://coobieessxvnujkkiadc.supabase.co/functions/v1/reset-daily-credits',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb2JpZWVzc3h2bnVqa2tpYWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Nzg4NjYsImV4cCI6MjA3NzI1NDg2Nn0.YLEDjz3IRW5dBvBQTnK0ORv-XjU1cbNwGY6Laj2IV6k"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- PRIORITY 2: Auto-generate referral codes on user signup
-- ============================================================================

-- Create function to automatically create referral code for new users
CREATE OR REPLACE FUNCTION public.create_user_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
BEGIN
  -- Generate unique referral code
  v_referral_code := public.generate_referral_code();
  
  -- Insert referral entry for the new user (as their personal referral code)
  INSERT INTO public.referrals (
    referrer_id,
    referral_code,
    referred_email,
    status
  ) VALUES (
    NEW.id,
    v_referral_code,
    NEW.email,
    'signed_up' -- User's own referral code starts as signed_up
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-generate referral code on user creation
CREATE TRIGGER on_user_signup_create_referral_code
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_referral_code();

-- Backfill referral codes for existing users who don't have one
DO $$
DECLARE
  user_record RECORD;
  v_referral_code TEXT;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT u.id, u.email
    FROM auth.users u
    LEFT JOIN public.referrals r ON r.referrer_id = u.id AND r.referred_email = u.email
    WHERE r.id IS NULL
  LOOP
    v_referral_code := public.generate_referral_code();
    
    INSERT INTO public.referrals (
      referrer_id,
      referral_code,
      referred_email,
      status
    ) VALUES (
      user_record.id,
      v_referral_code,
      user_record.email,
      'signed_up'
    );
  END LOOP;
END $$;