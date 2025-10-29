-- Phase 4: Advanced Integrations (Zapier/Make.com)

-- Table for user integrations (Zapier, Make.com, custom webhooks)
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL, -- 'zapier', 'make', 'webhook', 'api'
  name TEXT NOT NULL,
  description TEXT,
  webhook_url TEXT,
  api_key TEXT, -- encrypted
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for integration triggers log
CREATE TABLE IF NOT EXISTS public.integration_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL,
  user_id UUID NOT NULL,
  agent_id UUID,
  trigger_data JSONB NOT NULL,
  response_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_integrations_user_id ON public.user_integrations(user_id);
CREATE INDEX idx_user_integrations_type ON public.user_integrations(integration_type);
CREATE INDEX idx_integration_triggers_integration_id ON public.integration_triggers(integration_id);
CREATE INDEX idx_integration_triggers_user_id ON public.integration_triggers(user_id);
CREATE INDEX idx_integration_triggers_created_at ON public.integration_triggers(created_at DESC);

-- RLS Policies
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_triggers ENABLE ROW LEVEL SECURITY;

-- user_integrations policies
CREATE POLICY "Users can view their own integrations"
  ON public.user_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations"
  ON public.user_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON public.user_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON public.user_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- integration_triggers policies
CREATE POLICY "Users can view their own triggers"
  ON public.integration_triggers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can create triggers"
  ON public.integration_triggers FOR INSERT
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();