-- Create user_router_preferences table for custom routing configuration
CREATE TABLE public.user_router_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_priority TEXT NOT NULL DEFAULT 'quality',
  max_cost_per_request REAL DEFAULT NULL,
  max_latency_ms INTEGER DEFAULT NULL,
  preferred_providers JSONB DEFAULT '[]'::jsonb,
  blocked_providers JSONB DEFAULT '[]'::jsonb,
  custom_rules JSONB DEFAULT '[]'::jsonb,
  cost_alert_threshold INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create router_ab_tests table for A/B testing providers
CREATE TABLE public.router_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  variant_a_config JSONB NOT NULL,
  variant_b_config JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  variant_a_calls INTEGER DEFAULT 0,
  variant_b_calls INTEGER DEFAULT 0,
  variant_a_success REAL DEFAULT 0,
  variant_b_success REAL DEFAULT 0,
  variant_a_avg_latency REAL DEFAULT 0,
  variant_b_avg_latency REAL DEFAULT 0,
  variant_a_total_cost REAL DEFAULT 0,
  variant_b_total_cost REAL DEFAULT 0,
  winner TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create router_cost_alerts table for budget tracking
CREATE TABLE public.router_cost_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  threshold_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'daily',
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create router_analytics table for detailed metrics
CREATE TABLE public.router_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  task_type TEXT NOT NULL,
  model_used TEXT NOT NULL,
  priority TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  latency_ms INTEGER NOT NULL,
  cost REAL NOT NULL,
  fallback_used BOOLEAN DEFAULT false,
  ab_test_id UUID REFERENCES public.router_ab_tests(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_router_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.router_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.router_cost_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.router_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_router_preferences
CREATE POLICY "Users can view their own router preferences"
  ON public.user_router_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own router preferences"
  ON public.user_router_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own router preferences"
  ON public.user_router_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own router preferences"
  ON public.user_router_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for router_ab_tests
CREATE POLICY "Users can view their own A/B tests"
  ON public.router_ab_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own A/B tests"
  ON public.router_ab_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own A/B tests"
  ON public.router_ab_tests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own A/B tests"
  ON public.router_ab_tests FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for router_cost_alerts
CREATE POLICY "Users can view their own cost alerts"
  ON public.router_cost_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cost alerts"
  ON public.router_cost_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cost alerts"
  ON public.router_cost_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cost alerts"
  ON public.router_cost_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for router_analytics
CREATE POLICY "Users can view their own router analytics"
  ON public.router_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own router analytics"
  ON public.router_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_router_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_router_preferences_updated_at
  BEFORE UPDATE ON public.user_router_preferences
  FOR EACH ROW EXECUTE FUNCTION update_router_updated_at();

CREATE TRIGGER update_router_cost_alerts_updated_at
  BEFORE UPDATE ON public.router_cost_alerts
  FOR EACH ROW EXECUTE FUNCTION update_router_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_router_preferences_user_id ON public.user_router_preferences(user_id);
CREATE INDEX idx_router_ab_tests_user_id ON public.router_ab_tests(user_id);
CREATE INDEX idx_router_ab_tests_active ON public.router_ab_tests(active) WHERE active = true;
CREATE INDEX idx_router_cost_alerts_user_id ON public.router_cost_alerts(user_id);
CREATE INDEX idx_router_cost_alerts_active ON public.router_cost_alerts(active) WHERE active = true;
CREATE INDEX idx_router_analytics_user_id ON public.router_analytics(user_id);
CREATE INDEX idx_router_analytics_created_at ON public.router_analytics(created_at DESC);
CREATE INDEX idx_router_analytics_provider ON public.router_analytics(provider, created_at DESC);