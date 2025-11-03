-- Advanced AGI Enhancement Database Schema

-- 1. Cross-Agent Learning Network
CREATE TABLE IF NOT EXISTS public.agent_learning_network (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_type TEXT NOT NULL,
  learning_event TEXT NOT NULL,
  success_score REAL NOT NULL DEFAULT 0.0,
  context JSONB,
  shared_to_agents TEXT[] DEFAULT ARRAY[]::TEXT[],
  applied_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_learning_user ON public.agent_learning_network(user_id);
CREATE INDEX idx_agent_learning_type ON public.agent_learning_network(agent_type);
CREATE INDEX idx_agent_learning_score ON public.agent_learning_network(success_score DESC);

-- 2. Multi-Agent Collaborations
CREATE TABLE IF NOT EXISTS public.agent_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  agents_involved TEXT[] NOT NULL,
  task_description TEXT NOT NULL,
  collaboration_type TEXT NOT NULL,
  synthesis_result JSONB,
  quality_score REAL,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collaborations_user ON public.agent_collaborations(user_id);
CREATE INDEX idx_collaborations_session ON public.agent_collaborations(session_id);

-- 3. Predictive Capabilities
CREATE TABLE IF NOT EXISTS public.capability_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  predicted_capability TEXT NOT NULL,
  confidence_score REAL NOT NULL,
  reasoning TEXT,
  status TEXT DEFAULT 'predicted' CHECK (status IN ('predicted', 'confirmed', 'rejected')),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_predictions_user ON public.capability_predictions(user_id);
CREATE INDEX idx_predictions_status ON public.capability_predictions(status);
CREATE INDEX idx_predictions_confidence ON public.capability_predictions(confidence_score DESC);

-- 4. Meta-Learning Metrics
CREATE TABLE IF NOT EXISTS public.meta_learning_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  optimization_direction TEXT CHECK (optimization_direction IN ('maximize', 'minimize')),
  auto_adjusted BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meta_learning_user ON public.meta_learning_metrics(user_id);
CREATE INDEX idx_meta_learning_type ON public.meta_learning_metrics(metric_type);

-- 5. Self-Optimizing Prompts
CREATE TABLE IF NOT EXISTS public.prompt_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_type TEXT NOT NULL,
  prompt_variant TEXT NOT NULL,
  parent_prompt_id UUID,
  test_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  avg_satisfaction REAL DEFAULT 0.0,
  avg_latency_ms INTEGER DEFAULT 0,
  status TEXT DEFAULT 'testing' CHECK (status IN ('testing', 'winner', 'retired')),
  promoted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prompt_experiments_user ON public.prompt_experiments(user_id);
CREATE INDEX idx_prompt_experiments_agent ON public.prompt_experiments(agent_type);
CREATE INDEX idx_prompt_experiments_status ON public.prompt_experiments(status);

-- 6. Emotional Intelligence
CREATE TABLE IF NOT EXISTS public.emotional_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  message_id UUID,
  detected_sentiment TEXT,
  emotion_scores JSONB,
  intensity REAL,
  response_tone_adjustment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_emotional_context_user ON public.emotional_context(user_id);
CREATE INDEX idx_emotional_context_session ON public.emotional_context(session_id);

-- 7. Uncertainty Quantification
CREATE TABLE IF NOT EXISTS public.uncertainty_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  agent_type TEXT NOT NULL,
  query TEXT NOT NULL,
  confidence_score REAL NOT NULL,
  uncertainty_reasons TEXT[],
  clarification_requested BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_uncertainty_user ON public.uncertainty_scores(user_id);
CREATE INDEX idx_uncertainty_confidence ON public.uncertainty_scores(confidence_score);

-- 8. Causal Reasoning
CREATE TABLE IF NOT EXISTS public.causal_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cause_event TEXT NOT NULL,
  effect_event TEXT NOT NULL,
  strength REAL NOT NULL DEFAULT 0.5,
  evidence_count INTEGER DEFAULT 1,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_causal_user ON public.causal_relationships(user_id);
CREATE INDEX idx_causal_strength ON public.causal_relationships(strength DESC);

-- 9. Long-Term Goals
CREATE TABLE IF NOT EXISTS public.long_term_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_description TEXT NOT NULL,
  subtasks JSONB DEFAULT '[]'::JSONB,
  progress REAL DEFAULT 0.0,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_goals_user ON public.long_term_goals(user_id);
CREATE INDEX idx_goals_status ON public.long_term_goals(status);
CREATE INDEX idx_goals_priority ON public.long_term_goals(priority);

-- Enable RLS
ALTER TABLE public.agent_learning_network ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capability_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_learning_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uncertainty_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.causal_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.long_term_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own learning network" ON public.agent_learning_network FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own learning network" ON public.agent_learning_network FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own collaborations" ON public.agent_collaborations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own collaborations" ON public.agent_collaborations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own predictions" ON public.capability_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own predictions" ON public.capability_predictions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own meta-learning" ON public.meta_learning_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own meta-learning" ON public.meta_learning_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own prompt experiments" ON public.prompt_experiments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own prompt experiments" ON public.prompt_experiments FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own emotional context" ON public.emotional_context FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own emotional context" ON public.emotional_context FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own uncertainty scores" ON public.uncertainty_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own uncertainty scores" ON public.uncertainty_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own causal relationships" ON public.causal_relationships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own causal relationships" ON public.causal_relationships FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own goals" ON public.long_term_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own goals" ON public.long_term_goals FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_causal_relationships_updated_at
  BEFORE UPDATE ON public.causal_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_long_term_goals_updated_at
  BEFORE UPDATE ON public.long_term_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();