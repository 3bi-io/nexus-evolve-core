-- Function to initialize subscription for new users
CREATE OR REPLACE FUNCTION public.initialize_user_subscription()
RETURNS TRIGGER AS $$
DECLARE
  starter_tier_id UUID;
BEGIN
  -- Get the starter tier ID
  SELECT id INTO starter_tier_id
  FROM public.subscription_tiers
  WHERE tier_name = 'starter'
  AND active = true
  LIMIT 1;

  -- Create subscription for new user
  IF starter_tier_id IS NOT NULL THEN
    INSERT INTO public.user_subscriptions (
      user_id,
      tier_id,
      credits_total,
      credits_remaining,
      billing_cycle,
      status,
      started_at,
      renews_at
    ) VALUES (
      NEW.id,
      starter_tier_id,
      500,  -- starter tier credits
      500,
      'monthly',
      'active',
      NOW(),
      NOW() + INTERVAL '30 days'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_subscription();

-- Backfill existing users who don't have subscriptions
DO $$
DECLARE
  starter_tier_id UUID;
  user_record RECORD;
BEGIN
  -- Get starter tier
  SELECT id INTO starter_tier_id
  FROM public.subscription_tiers
  WHERE tier_name = 'starter'
  AND active = true
  LIMIT 1;

  -- Create subscriptions for existing users without one
  IF starter_tier_id IS NOT NULL THEN
    FOR user_record IN 
      SELECT au.id
      FROM auth.users au
      LEFT JOIN public.user_subscriptions us ON au.id = us.user_id
      WHERE us.id IS NULL
    LOOP
      INSERT INTO public.user_subscriptions (
        user_id,
        tier_id,
        credits_total,
        credits_remaining,
        billing_cycle,
        status,
        started_at,
        renews_at
      ) VALUES (
        user_record.id,
        starter_tier_id,
        500,
        500,
        'monthly',
        'active',
        NOW(),
        NOW() + INTERVAL '30 days'
      );
    END LOOP;
  END IF;
END $$;