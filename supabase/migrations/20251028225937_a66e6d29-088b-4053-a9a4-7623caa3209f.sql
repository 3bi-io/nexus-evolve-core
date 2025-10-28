-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding columns to agent_memory and knowledge_base
ALTER TABLE agent_memory 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE knowledge_base 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create indexes for vector similarity search
CREATE INDEX IF NOT EXISTS idx_agent_memory_embedding 
ON agent_memory USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
ON knowledge_base USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create table for A/B testing experiments
CREATE TABLE IF NOT EXISTS ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  experiment_name TEXT NOT NULL,
  variant TEXT NOT NULL, -- 'control' or 'test'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  metrics JSONB,
  winner TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ab_experiments_user ON ab_experiments(user_id);
CREATE INDEX idx_ab_experiments_active ON ab_experiments(user_id, active) WHERE active = true;

-- Enable RLS
ALTER TABLE ab_experiments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ab_experiments
CREATE POLICY "Users can view their own experiments"
  ON ab_experiments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own experiments"
  ON ab_experiments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments"
  ON ab_experiments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create table for capability suggestions
CREATE TABLE IF NOT EXISTS capability_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  capability_name TEXT NOT NULL,
  description TEXT,
  reasoning TEXT,
  confidence_score REAL DEFAULT 0.5,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_capability_suggestions_user ON capability_suggestions(user_id);
CREATE INDEX idx_capability_suggestions_status ON capability_suggestions(status);

-- Enable RLS
ALTER TABLE capability_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for capability_suggestions
CREATE POLICY "Users can view their own suggestions"
  ON capability_suggestions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own suggestions"
  ON capability_suggestions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions"
  ON capability_suggestions
  FOR UPDATE
  USING (auth.uid() = user_id);