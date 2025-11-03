-- Phase 1: Temporal Memory Enhancement Tables
-- Create memory_temporal_scores table for tracking memory access patterns and decay
CREATE TABLE IF NOT EXISTS public.memory_temporal_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_id TEXT NOT NULL,
  access_count INTEGER DEFAULT 1,
  importance_score REAL DEFAULT 0.5,
  decay_rate REAL DEFAULT 0.1,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  calculated_relevance REAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, memory_id)
);

-- Enable RLS
ALTER TABLE public.memory_temporal_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for temporal scores
CREATE POLICY "Users manage own temporal scores"
ON public.memory_temporal_scores
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_temporal_scores_user_relevance ON public.memory_temporal_scores(user_id, calculated_relevance DESC);
CREATE INDEX idx_temporal_scores_last_accessed ON public.memory_temporal_scores(user_id, last_accessed DESC);

-- Phase 3: Auto-Pruning System Tables
-- Create memory_pruning_logs table
CREATE TABLE IF NOT EXISTS public.memory_pruning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pruned_count INTEGER DEFAULT 0,
  storage_saved_kb INTEGER DEFAULT 0,
  threshold_used REAL,
  pruned_memory_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.memory_pruning_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pruning logs
CREATE POLICY "Users view own pruning logs"
ON public.memory_pruning_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can insert logs
CREATE POLICY "Service can create pruning logs"
ON public.memory_pruning_logs
FOR INSERT
WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_pruning_logs_user_date ON public.memory_pruning_logs(user_id, created_at DESC);

-- Create user_memory_preferences table for pruning settings
CREATE TABLE IF NOT EXISTS public.user_memory_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_pruning_enabled BOOLEAN DEFAULT true,
  pruning_aggressiveness TEXT DEFAULT 'moderate' CHECK (pruning_aggressiveness IN ('conservative', 'moderate', 'aggressive')),
  min_age_days INTEGER DEFAULT 90,
  relevance_threshold REAL DEFAULT 0.3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_memory_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for memory preferences
CREATE POLICY "Users manage own memory preferences"
ON public.user_memory_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at on temporal scores
CREATE OR REPLACE FUNCTION update_temporal_scores_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_temporal_scores_timestamp
BEFORE UPDATE ON public.memory_temporal_scores
FOR EACH ROW
EXECUTE FUNCTION update_temporal_scores_updated_at();

-- Trigger to update updated_at on memory preferences
CREATE TRIGGER update_memory_preferences_timestamp
BEFORE UPDATE ON public.user_memory_preferences
FOR EACH ROW
EXECUTE FUNCTION update_temporal_scores_updated_at();

-- Function to calculate temporal relevance score
CREATE OR REPLACE FUNCTION calculate_temporal_relevance(
  p_access_count INTEGER,
  p_importance_score REAL,
  p_last_accessed TIMESTAMPTZ,
  p_decay_rate REAL
)
RETURNS REAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  days_since_access REAL;
  decay_factor REAL;
  relevance REAL;
BEGIN
  -- Calculate days since last access
  days_since_access := EXTRACT(EPOCH FROM (NOW() - p_last_accessed)) / 86400.0;
  
  -- Calculate decay factor: e^(-decay_rate * days)
  decay_factor := EXP(-p_decay_rate * days_since_access);
  
  -- Calculate relevance: (importance * 0.4) + (access_count * 0.3) + (decay_factor * 0.3)
  relevance := (p_importance_score * 0.4) + (LEAST(p_access_count / 10.0, 1.0) * 0.3) + (decay_factor * 0.3);
  
  RETURN LEAST(relevance, 1.0);
END;
$$;