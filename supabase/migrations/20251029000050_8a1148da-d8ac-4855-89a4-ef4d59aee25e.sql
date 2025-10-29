-- Priority 1: Cron Job Monitoring Table
CREATE TABLE public.cron_job_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_name text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  status text NOT NULL DEFAULT 'running', -- 'success', 'failed', 'running'
  error_message text,
  metrics jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own cron logs"
  ON public.cron_job_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cron logs"
  ON public.cron_job_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_cron_logs_user_created ON public.cron_job_logs(user_id, created_at DESC);

-- Priority 4: User Preferences Table
CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_approval_threshold numeric DEFAULT 0.8,
  default_agent text DEFAULT 'auto',
  auto_learning_enabled boolean DEFAULT true,
  notifications_enabled boolean DEFAULT true,
  evolution_frequency text DEFAULT 'daily', -- 'daily', 'weekly', 'never'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_timestamp
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Priority 6: Performance Indexes
CREATE INDEX IF NOT EXISTS idx_interactions_user_created ON public.interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_user_importance ON public.agent_memory(user_id, importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_user_retrieval ON public.agent_memory(user_id, last_retrieved_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_evolution_logs_user_created ON public.evolution_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_user_importance ON public.knowledge_base(user_id, importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_last_message ON public.sessions(user_id, last_message_at DESC NULLS LAST);