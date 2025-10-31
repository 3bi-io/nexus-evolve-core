-- Table for tracking LLM calls and observability
CREATE TABLE IF NOT EXISTS llm_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id UUID,
  agent_type TEXT NOT NULL,
  model_used TEXT NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  cost_usd DECIMAL(10,6),
  latency_ms INTEGER,
  quality_score DECIMAL(3,2),
  braintrust_span_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_llm_obs_user ON llm_observations(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_obs_agent ON llm_observations(agent_type);
CREATE INDEX IF NOT EXISTS idx_llm_obs_created ON llm_observations(created_at);
CREATE INDEX IF NOT EXISTS idx_llm_obs_model ON llm_observations(model_used);

-- Enable RLS
ALTER TABLE llm_observations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own observations"
ON llm_observations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can create observations"
ON llm_observations FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Super admins can view all observations"
ON llm_observations FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));