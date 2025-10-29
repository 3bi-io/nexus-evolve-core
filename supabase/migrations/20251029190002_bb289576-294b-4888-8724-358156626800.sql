-- Create referrals table to track user referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_email TEXT NOT NULL,
  referred_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted')),
  referral_code TEXT NOT NULL UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals
CREATE POLICY "Users can view their own referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id);

-- Users can create their own referrals
CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referrer_id);

-- Create referral_rewards table for tracking earned rewards
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('credits', 'premium_trial', 'badge', 'feature_unlock')),
  reward_value INTEGER NOT NULL DEFAULT 0,
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Users can view their own rewards
CREATE POLICY "Users can view their own rewards"
ON public.referral_rewards
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own rewards (for claiming)
CREATE POLICY "Users can claim their rewards"
ON public.referral_rewards
FOR UPDATE
USING (auth.uid() = user_id);

-- Create viral_shares table to track social shares
CREATE TABLE IF NOT EXISTS public.viral_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'linkedin', 'whatsapp', 'email', 'copy_link')),
  share_type TEXT NOT NULL CHECK (share_type IN ('achievement', 'milestone', 'general', 'referral')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.viral_shares ENABLE ROW LEVEL SECURITY;

-- Users can view their own shares
CREATE POLICY "Users can view their own shares"
ON public.viral_shares
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create shares
CREATE POLICY "Users can create shares"
ON public.viral_shares
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Create function to process referral signup
CREATE OR REPLACE FUNCTION process_referral_signup(
  p_referral_code TEXT,
  p_referred_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create indexes for better performance
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referral_rewards_user_id ON public.referral_rewards(user_id);
CREATE INDEX idx_viral_shares_user_id ON public.viral_shares(user_id);