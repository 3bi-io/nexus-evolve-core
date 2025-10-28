-- Create adaptive_behaviors table for storing learned patterns
CREATE TABLE IF NOT EXISTS public.adaptive_behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  behavior_type TEXT NOT NULL CHECK (behavior_type IN ('response_style', 'reasoning_pattern', 'topic_focus', 'communication_preference', 'context_usage', 'capability_preference')),
  description TEXT NOT NULL,
  effectiveness_score REAL DEFAULT 0.5 CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
  active BOOLEAN DEFAULT true,
  created_from TEXT CHECK (created_from IN ('positive_feedback', 'negative_feedback', 'usage_pattern', 'auto_discovery')),
  sample_interaction_ids UUID[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_applied_at TIMESTAMP WITH TIME ZONE,
  application_count INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX idx_adaptive_behaviors_user ON public.adaptive_behaviors(user_id);
CREATE INDEX idx_adaptive_behaviors_active ON public.adaptive_behaviors(user_id, active) WHERE active = true;
CREATE INDEX idx_adaptive_behaviors_type ON public.adaptive_behaviors(behavior_type);
CREATE INDEX idx_adaptive_behaviors_effectiveness ON public.adaptive_behaviors(effectiveness_score DESC);

-- Enable RLS
ALTER TABLE public.adaptive_behaviors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own adaptive behaviors"
  ON public.adaptive_behaviors
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own adaptive behaviors"
  ON public.adaptive_behaviors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own adaptive behaviors"
  ON public.adaptive_behaviors
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own adaptive behaviors"
  ON public.adaptive_behaviors
  FOR DELETE
  USING (auth.uid() = user_id);