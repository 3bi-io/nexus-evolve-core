-- Create unpublished Founder tier with unlimited usage
INSERT INTO subscription_tiers (
  tier_name,
  monthly_price,
  yearly_price,
  monthly_credits,
  features,
  active,
  sort_order
) VALUES (
  'founder',
  199.00,
  1990.00,
  999999,
  '["Unlimited credits (lifetime)", "All features unlocked", "Priority support", "Early access to new features", "Founder badge", "Direct line to founders", "Lifetime price lock", "Custom AI training", "White-label options", "API access"]'::jsonb,
  false,
  0
)
ON CONFLICT (tier_name) DO UPDATE SET
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price,
  monthly_credits = EXCLUDED.monthly_credits,
  features = EXCLUDED.features,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order;