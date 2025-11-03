-- Phase 1: Core Functionality Tables

-- Tool execution metrics
CREATE TABLE IF NOT EXISTS tool_execution_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES custom_agents(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  avg_duration_ms INTEGER,
  last_executed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tool_metrics_agent ON tool_execution_metrics(agent_id, last_executed_at DESC);

-- Add tool_results to agent_executions
ALTER TABLE agent_executions 
ADD COLUMN IF NOT EXISTS tool_results JSONB DEFAULT '[]'::jsonb;

-- Agent conversations for persistence
CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES custom_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON agent_conversations(user_id);
CREATE INDEX idx_conversations_agent ON agent_conversations(agent_id);
CREATE INDEX idx_conversations_updated ON agent_conversations(user_id, updated_at DESC);

-- Conversation auto-titles
CREATE TABLE IF NOT EXISTS conversation_titles (
  conversation_id UUID PRIMARY KEY REFERENCES agent_conversations(id) ON DELETE CASCADE,
  auto_generated_title TEXT,
  user_title TEXT,
  title_generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge base links
CREATE TABLE IF NOT EXISTS agent_knowledge_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES custom_agents(id) ON DELETE CASCADE,
  knowledge_id UUID REFERENCES knowledge_base(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, knowledge_id)
);

CREATE INDEX idx_knowledge_links_agent ON agent_knowledge_links(agent_id);

-- Track knowledge retrieval
ALTER TABLE agent_executions 
ADD COLUMN IF NOT EXISTS knowledge_items_retrieved JSONB DEFAULT '[]'::jsonb;

-- Analytics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS agent_analytics_daily AS
SELECT 
  agent_id,
  user_id,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as execution_count,
  AVG(execution_time_ms) as avg_execution_time,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(*), 0) as success_rate,
  AVG(tokens_used) as avg_tokens,
  SUM(cost_credits) as total_credits_used
FROM agent_executions
GROUP BY agent_id, user_id, DATE_TRUNC('day', created_at);

CREATE UNIQUE INDEX idx_agent_analytics ON agent_analytics_daily(agent_id, user_id, date);

-- Phase 2: Quality & Testing Tables

-- Test suites
CREATE TABLE IF NOT EXISTS agent_test_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES custom_agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  test_cases JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test results
CREATE TABLE IF NOT EXISTS agent_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_suite_id UUID REFERENCES agent_test_suites(id) ON DELETE CASCADE,
  agent_version_id UUID,
  results JSONB NOT NULL,
  success_rate REAL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent versions
CREATE TABLE IF NOT EXISTS agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES custom_agents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  change_summary TEXT,
  changed_fields TEXT[],
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_versions ON agent_versions(agent_id, version_number DESC);

-- Add version tracking
ALTER TABLE custom_agents ADD COLUMN IF NOT EXISTS current_version INTEGER DEFAULT 1;

-- Preview interactions
CREATE TABLE IF NOT EXISTS agent_preview_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES custom_agents(id) ON DELETE CASCADE,
  user_id UUID,
  interaction_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 3: Advanced Features Tables

-- Agent workflows
CREATE TABLE IF NOT EXISTS agent_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  workflow_definition JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow executions
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES agent_workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  input_data JSONB,
  execution_trace JSONB,
  output_data JSONB,
  duration_ms INTEGER,
  status TEXT DEFAULT 'running',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Agent improvement suggestions
CREATE TABLE IF NOT EXISTS agent_improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES custom_agents(id) ON DELETE CASCADE,
  suggestion_type TEXT,
  suggestion TEXT,
  reasoning TEXT,
  confidence_score REAL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 4: Automation & Scale Tables

-- Agent schedules
CREATE TABLE IF NOT EXISTS agent_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES custom_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  schedule_type TEXT,
  schedule_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_executed_at TIMESTAMPTZ,
  next_execution_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_schedules_next ON agent_schedules(next_execution_at) 
WHERE is_active = TRUE;

-- Multi-modal tracking
ALTER TABLE agent_executions 
ADD COLUMN IF NOT EXISTS input_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS output_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;

-- Revenue analytics view
CREATE MATERIALIZED VIEW IF NOT EXISTS agent_revenue_analytics AS
SELECT 
  a.id as agent_id,
  a.user_id as creator_id,
  COUNT(DISTINCT ap.id) as total_sales,
  SUM(ap.price_paid) as total_revenue,
  SUM(ap.price_paid * 0.7) as creator_earnings,
  DATE_TRUNC('month', ap.purchased_at) as month
FROM custom_agents a
LEFT JOIN agent_purchases ap ON a.id = ap.agent_id
GROUP BY a.id, a.user_id, DATE_TRUNC('month', ap.purchased_at);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_executions_agent_created ON agent_executions(agent_id, created_at DESC);

-- Enable RLS on new tables
ALTER TABLE tool_execution_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_knowledge_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_preview_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" ON agent_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" ON agent_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON agent_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON agent_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for test suites
CREATE POLICY "Users can view test suites for their agents" ON agent_test_suites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_agents 
      WHERE custom_agents.id = agent_test_suites.agent_id 
      AND custom_agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create test suites for their agents" ON agent_test_suites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM custom_agents 
      WHERE custom_agents.id = agent_test_suites.agent_id 
      AND custom_agents.user_id = auth.uid()
    )
  );

-- RLS Policies for workflows
CREATE POLICY "Users can view their own workflows" ON agent_workflows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows" ON agent_workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows" ON agent_workflows
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for schedules
CREATE POLICY "Users can view their own schedules" ON agent_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules" ON agent_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" ON agent_schedules
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for preview interactions (public read)
CREATE POLICY "Anyone can view preview interactions" ON agent_preview_interactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create preview interactions" ON agent_preview_interactions
  FOR INSERT WITH CHECK (true);