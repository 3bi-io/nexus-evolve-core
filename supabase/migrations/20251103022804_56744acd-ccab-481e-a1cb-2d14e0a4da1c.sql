-- Upgrade user c@3bi.io to Founder tier
UPDATE user_subscriptions 
SET 
  tier_id = '49c21b9c-ce64-41db-8755-2ff61fd96e8e',
  status = 'active',
  renews_at = (NOW() + INTERVAL '100 years'),
  credits_remaining = 999999,
  credits_total = 999999,
  billing_cycle = 'yearly',
  updated_at = NOW()
WHERE user_id = 'd191f5bc-aa0f-4aa3-8cb5-798c999f2b9a';

-- Log the upgrade transaction
INSERT INTO credit_transactions (
  user_id,
  transaction_type,
  operation_type,
  credits_amount,
  balance_after,
  metadata
) VALUES (
  'd191f5bc-aa0f-4aa3-8cb5-798c999f2b9a',
  'bonus',
  'add',
  999999,
  999999,
  '{"tier": "founder", "reason": "Manual upgrade to Founder tier", "upgraded_from": "starter"}'::jsonb
);