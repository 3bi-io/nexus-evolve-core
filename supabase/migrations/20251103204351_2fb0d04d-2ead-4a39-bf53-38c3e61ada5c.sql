-- Phase 1.1 & 1.2: Update subscription tiers and add grandfathering support

-- Update professional tier to $29/mo founder rate
UPDATE subscription_tiers 
SET 
  monthly_price = 29.00,
  yearly_price = 290.00,
  monthly_credits = 10000,
  features = '[
    "10,000 AI interactions/month",
    "All 9 AI systems",
    "Multi-agent orchestration",
    "Priority support",
    "Advanced analytics",
    "Enhanced security monitoring",
    "Founder badge",
    "Locked-in rate forever"
  ]'::jsonb
WHERE tier_name = 'professional';

-- Update starter tier to accurate free tier
UPDATE subscription_tiers 
SET 
  monthly_price = 0.00,
  yearly_price = 0.00,
  monthly_credits = 500,
  features = '[
    "500 daily AI interactions",
    "All 9 AI systems",
    "Multi-agent orchestration",
    "Voice AI",
    "Agent marketplace",
    "Beta tester badge",
    "Community support"
  ]'::jsonb
WHERE tier_name = 'starter';

-- Insert new professional_unlimited tier ($49/mo for new users)
INSERT INTO subscription_tiers (
  tier_name,
  monthly_price,
  yearly_price,
  monthly_credits,
  features,
  sort_order,
  active
) VALUES (
  'professional_unlimited',
  49.00,
  470.00,
  999999,
  '[
    "Unlimited AI interactions",
    "All 9 AI systems",
    "100 custom agents/month",
    "Multi-agent orchestration",
    "Priority support",
    "Advanced analytics",
    "Enhanced security monitoring",
    "API access"
  ]'::jsonb,
  2,
  false
) ON CONFLICT (tier_name) DO UPDATE SET
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price,
  monthly_credits = EXCLUDED.monthly_credits,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;

-- Add grandfathering columns to user_subscriptions
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS is_grandfathered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);

-- Mark existing super admin (c@3bi.io) as grandfathered at $29/mo
UPDATE user_subscriptions
SET 
  is_grandfathered = true,
  original_price = 29.00
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'c@3bi.io'
);