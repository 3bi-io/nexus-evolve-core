-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create visitor_credits table for anonymous IP-based tracking
CREATE TABLE public.visitor_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL UNIQUE,
  ip_encrypted TEXT NOT NULL,
  daily_credits INTEGER NOT NULL DEFAULT 5,
  credits_used_today INTEGER NOT NULL DEFAULT 0,
  last_visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  consecutive_days INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription_tiers table
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,
  monthly_price DECIMAL(10,2) NOT NULL,
  yearly_price DECIMAL(10,2) NOT NULL,
  monthly_credits INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tier_id UUID REFERENCES public.subscription_tiers(id) NOT NULL,
  credits_remaining INTEGER NOT NULL,
  credits_total INTEGER NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  renews_at TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create credit_transactions table for audit trail
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  visitor_credit_id UUID REFERENCES public.visitor_credits(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('usage', 'refill', 'purchase', 'bonus')),
  credits_amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  operation_type TEXT,
  interaction_id UUID REFERENCES public.interactions(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_visitor_ip_hash ON public.visitor_credits(ip_hash);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_visitor_id ON public.credit_transactions(visitor_credit_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at);

-- Enable RLS
ALTER TABLE public.visitor_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_credits (service role only)
CREATE POLICY "Service role can manage visitor credits"
ON public.visitor_credits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- RLS Policies for subscription_tiers (public read)
CREATE POLICY "Anyone can view active subscription tiers"
ON public.subscription_tiers
FOR SELECT
USING (active = true);

CREATE POLICY "Super admins can manage subscription tiers"
ON public.subscription_tiers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
ON public.user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Super admins can view all subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view their own transactions"
ON public.credit_transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can create transactions"
ON public.credit_transactions
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Super admins can view all transactions"
ON public.credit_transactions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (tier_name, monthly_price, yearly_price, monthly_credits, features, sort_order) VALUES
('starter', 49.00, 470.00, 500, 
  '[
    "500 credits per month",
    "All basic features",
    "Email support",
    "Community access",
    "Standard response time"
  ]'::jsonb, 1),
('professional', 149.00, 1430.00, 2000,
  '[
    "2,000 credits per month",
    "All features unlocked",
    "Priority support",
    "Advanced analytics",
    "API access",
    "Faster response time"
  ]'::jsonb, 2),
('enterprise', 999.00, 9990.00, 999999,
  '[
    "Unlimited credits",
    "White-label options",
    "Dedicated support",
    "Custom integrations",
    "SLA guarantees",
    "Custom AI training"
  ]'::jsonb, 3);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_visitor_credits_updated_at
BEFORE UPDATE ON public.visitor_credits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();