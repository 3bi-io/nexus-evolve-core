-- Phase 3A: Add missing columns to enable intelligent memory system

-- Update agent_memory table
ALTER TABLE agent_memory 
  ADD COLUMN IF NOT EXISTS content jsonb,
  ADD COLUMN IF NOT EXISTS importance_score real DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS retrieval_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_retrieved_at timestamp with time zone;

-- Update interactions table
ALTER TABLE interactions 
  ADD COLUMN IF NOT EXISTS context jsonb,
  ADD COLUMN IF NOT EXISTS model_used text DEFAULT 'google/gemini-2.5-flash',
  ADD COLUMN IF NOT EXISTS reasoning_trace jsonb;

-- Update knowledge_base table
ALTER TABLE knowledge_base 
  ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'conversation',
  ADD COLUMN IF NOT EXISTS source_reference text,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS importance_score real DEFAULT 0.5;

-- Update problem_solutions table
ALTER TABLE problem_solutions 
  ADD COLUMN IF NOT EXISTS solution_path jsonb,
  ADD COLUMN IF NOT EXISTS reasoning_steps jsonb,
  ADD COLUMN IF NOT EXISTS success_score real;

-- Update evolution_logs table
ALTER TABLE evolution_logs 
  ADD COLUMN IF NOT EXISTS change_type text,
  ADD COLUMN IF NOT EXISTS metrics jsonb,
  ADD COLUMN IF NOT EXISTS success boolean;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_memory_importance ON agent_memory(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_session ON agent_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_user_session ON agent_memory(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_importance ON knowledge_base(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING gin(tags);

-- Create function to update retrieval tracking
CREATE OR REPLACE FUNCTION increment_memory_retrieval(memory_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE agent_memory 
  SET 
    retrieval_count = retrieval_count + 1,
    last_retrieved_at = now()
  WHERE id = memory_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;