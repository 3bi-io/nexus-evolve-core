-- Create model performance tracking for Phase 2: Multi-Model Router

-- Track model performance metrics
CREATE TABLE public.model_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  model_name TEXT NOT NULL,
  task_type TEXT NOT NULL, -- 'reasoning', 'creative', 'vision', 'real-time', 'general'
  success_rate REAL DEFAULT 0.5,
  avg_latency_ms INTEGER DEFAULT 0,
  avg_cost_credits REAL DEFAULT 1.0,
  total_uses INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Model routing decisions log
CREATE TABLE public.model_routing_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  interaction_id UUID,
  task_type TEXT NOT NULL,
  task_complexity REAL DEFAULT 0.5,
  selected_model TEXT NOT NULL,
  ensemble_mode BOOLEAN DEFAULT false,
  ensemble_models TEXT[],
  routing_reason TEXT,
  confidence_score REAL DEFAULT 0.5,
  actual_latency_ms INTEGER,
  actual_cost_credits REAL,
  user_satisfaction INTEGER, -- 1-5 rating
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Available models configuration
CREATE TABLE public.available_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'xai', 'google', 'lovable'
  model_id TEXT NOT NULL, -- actual model ID for API calls
  capabilities TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['vision', 'reasoning', 'real-time', 'creative']
  cost_per_1k_tokens REAL DEFAULT 0.01,
  max_tokens INTEGER DEFAULT 4096,
  supports_streaming BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 50, -- higher = preferred
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_routing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.available_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies for model_performance
CREATE POLICY "Users can view their own model performance"
  ON public.model_performance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own model performance"
  ON public.model_performance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own model performance"
  ON public.model_performance FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for model_routing_log
CREATE POLICY "Users can view their own routing logs"
  ON public.model_routing_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routing logs"
  ON public.model_routing_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for available_models
CREATE POLICY "Anyone can view available models"
  ON public.available_models FOR SELECT
  USING (is_available = true);

CREATE POLICY "Admins can manage models"
  ON public.available_models FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create indexes
CREATE INDEX idx_model_performance_user_model ON public.model_performance(user_id, model_name);
CREATE INDEX idx_model_performance_task_type ON public.model_performance(task_type, success_rate DESC);
CREATE INDEX idx_routing_log_user ON public.model_routing_log(user_id, created_at DESC);
CREATE INDEX idx_routing_log_model ON public.model_routing_log(selected_model, created_at DESC);
CREATE INDEX idx_available_models_provider ON public.available_models(provider, is_available);

-- Insert default available models
INSERT INTO public.available_models (model_name, provider, model_id, capabilities, cost_per_1k_tokens, max_tokens, priority) VALUES
  ('GPT-5', 'openai', 'gpt-5-2025-08-07', ARRAY['reasoning', 'vision', 'general'], 0.05, 128000, 95),
  ('GPT-5 Mini', 'openai', 'gpt-5-mini-2025-08-07', ARRAY['general', 'vision'], 0.02, 128000, 85),
  ('GPT-5 Nano', 'openai', 'gpt-5-nano-2025-08-07', ARRAY['general'], 0.01, 128000, 75),
  ('Claude Opus 4.1', 'anthropic', 'claude-opus-4-1-20250805', ARRAY['reasoning', 'creative', 'vision'], 0.08, 200000, 100),
  ('Claude Sonnet 4.5', 'anthropic', 'claude-sonnet-4-5', ARRAY['reasoning', 'creative', 'vision'], 0.04, 200000, 90),
  ('Grok 3', 'xai', 'grok-3-20260418', ARRAY['real-time', 'creative', 'reasoning'], 0.03, 128000, 88),
  ('Gemini Pro 2.5', 'google', 'google/gemini-2.5-pro', ARRAY['vision', 'reasoning', 'general'], 0.03, 1000000, 87),
  ('Gemini Flash 2.5', 'google', 'google/gemini-2.5-flash', ARRAY['general', 'vision'], 0.01, 1000000, 80);

-- Function to update model performance
CREATE OR REPLACE FUNCTION public.update_model_performance(
  p_user_id UUID,
  p_model_name TEXT,
  p_task_type TEXT,
  p_success BOOLEAN,
  p_latency_ms INTEGER,
  p_cost_credits REAL
) RETURNS VOID AS $$
DECLARE
  v_current RECORD;
BEGIN
  -- Get current performance
  SELECT * INTO v_current
  FROM public.model_performance
  WHERE user_id = p_user_id
    AND model_name = p_model_name
    AND task_type = p_task_type;
  
  IF v_current IS NULL THEN
    -- Create new performance record
    INSERT INTO public.model_performance (
      user_id, model_name, task_type,
      success_rate, avg_latency_ms, avg_cost_credits, total_uses, last_used_at
    ) VALUES (
      p_user_id, p_model_name, p_task_type,
      CASE WHEN p_success THEN 1.0 ELSE 0.0 END,
      p_latency_ms, p_cost_credits, 1, now()
    );
  ELSE
    -- Update existing record with running averages
    UPDATE public.model_performance SET
      success_rate = (
        (success_rate * total_uses + CASE WHEN p_success THEN 1.0 ELSE 0.0 END) 
        / (total_uses + 1)
      ),
      avg_latency_ms = (
        (avg_latency_ms * total_uses + p_latency_ms) / (total_uses + 1)
      ),
      avg_cost_credits = (
        (avg_cost_credits * total_uses + p_cost_credits) / (total_uses + 1)
      ),
      total_uses = total_uses + 1,
      last_used_at = now(),
      updated_at = now()
    WHERE user_id = p_user_id
      AND model_name = p_model_name
      AND task_type = p_task_type;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;