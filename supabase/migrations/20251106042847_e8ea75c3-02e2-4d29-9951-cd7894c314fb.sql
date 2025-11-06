-- Automation Pipelines & Smart Caching Tables

-- Automation pipelines for chaining AI tasks
CREATE TABLE IF NOT EXISTS public.automation_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pipeline_config JSONB NOT NULL, -- Steps, triggers, conditions
  is_active BOOLEAN DEFAULT true,
  schedule_cron TEXT, -- Cron expression for scheduling
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pipeline execution logs
CREATE TABLE IF NOT EXISTS public.pipeline_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.automation_pipelines(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  steps_completed INTEGER DEFAULT 0,
  steps_total INTEGER NOT NULL,
  results JSONB,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Smart cache for AI responses
CREATE TABLE IF NOT EXISTS public.ai_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE, -- Hash of request parameters
  operation_type TEXT NOT NULL, -- 'vision', 'generation', 'reasoning', 'workflow'
  request_hash TEXT NOT NULL,
  response_data JSONB NOT NULL,
  model_used TEXT,
  hit_count INTEGER DEFAULT 0,
  cost_saved_usd REAL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_accessed_at TIMESTAMPTZ DEFAULT now()
);

-- Scheduled monitoring tasks
CREATE TABLE IF NOT EXISTS public.scheduled_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monitor_type TEXT NOT NULL CHECK (monitor_type IN ('trends', 'sentiment', 'competitor', 'keyword', 'brand')),
  target TEXT NOT NULL, -- What to monitor (brand name, keyword, etc.)
  config JSONB NOT NULL, -- Monitor-specific configuration
  schedule_cron TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notification_channels JSONB DEFAULT '[]'::jsonb, -- ['email', 'webhook', 'in-app']
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  alert_threshold JSONB, -- Conditions to trigger alerts
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Monitor execution results
CREATE TABLE IF NOT EXISTS public.monitor_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES public.scheduled_monitors(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'alert_triggered')),
  results JSONB NOT NULL,
  alerts JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  error_message TEXT
);

-- Content generation queue
CREATE TABLE IF NOT EXISTS public.content_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES public.automation_pipelines(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL, -- 'social_post', 'blog', 'image', 'video_script'
  prompt TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 5,
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_pipelines_user_active ON public.automation_pipelines(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_automation_pipelines_next_run ON public.automation_pipelines(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_pipeline ON public.pipeline_executions(pipeline_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON public.ai_response_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON public.ai_response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_monitors_user ON public.scheduled_monitors(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_monitors_next_run ON public.scheduled_monitors(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_monitor_results_monitor ON public.monitor_results(monitor_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_queue_status ON public.content_generation_queue(status, priority, scheduled_for);

-- Enable RLS
ALTER TABLE public.automation_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitor_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own pipelines"
  ON public.automation_pipelines FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their pipeline executions"
  ON public.pipeline_executions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.automation_pipelines
    WHERE id = pipeline_executions.pipeline_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can access their cache"
  ON public.ai_response_cache FOR ALL
  USING (true); -- Cache is shared but access controlled by application logic

CREATE POLICY "Users can manage their monitors"
  ON public.scheduled_monitors FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their monitor results"
  ON public.monitor_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.scheduled_monitors
    WHERE id = monitor_results.monitor_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their content queue"
  ON public.content_generation_queue FOR ALL
  USING (auth.uid() = user_id);

-- Trigger for updating timestamps
CREATE TRIGGER update_automation_pipelines_updated_at
  BEFORE UPDATE ON public.automation_pipelines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_monitors_updated_at
  BEFORE UPDATE ON public.scheduled_monitors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to cleanup expired cache
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ai_response_cache
  WHERE expires_at < now();
END;
$$;