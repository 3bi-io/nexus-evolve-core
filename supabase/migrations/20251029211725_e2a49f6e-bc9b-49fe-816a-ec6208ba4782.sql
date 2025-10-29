-- Create social intelligence tables for Grok-powered features

-- Social intelligence cache for trends and sentiment
CREATE TABLE public.social_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intelligence_type TEXT NOT NULL, -- 'trend', 'sentiment', 'topic'
  topic TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  score REAL DEFAULT 0.5,
  metadata JSONB DEFAULT '{}'::jsonb,
  source TEXT DEFAULT 'grok',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 hour')
);

-- Viral content tracking
CREATE TABLE public.viral_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'tweet', 'post', 'thread'
  content TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', etc.
  generated_by TEXT DEFAULT 'grok',
  metadata JSONB DEFAULT '{}'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  shared BOOLEAN DEFAULT false,
  shared_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trend predictions
CREATE TABLE public.trend_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  prediction_type TEXT NOT NULL, -- 'rising', 'peak', 'declining'
  confidence_score REAL DEFAULT 0.5,
  predicted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  actual_data JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  prediction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  target_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.social_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viral_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_intelligence
CREATE POLICY "Users can view their own social intelligence"
  ON public.social_intelligence FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own social intelligence"
  ON public.social_intelligence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social intelligence"
  ON public.social_intelligence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social intelligence"
  ON public.social_intelligence FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for viral_content
CREATE POLICY "Users can view their own viral content"
  ON public.viral_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own viral content"
  ON public.viral_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own viral content"
  ON public.viral_content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own viral content"
  ON public.viral_content FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for trend_predictions
CREATE POLICY "Users can view their own trend predictions"
  ON public.trend_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trend predictions"
  ON public.trend_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trend predictions"
  ON public.trend_predictions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_social_intelligence_user_type ON public.social_intelligence(user_id, intelligence_type);
CREATE INDEX idx_social_intelligence_expires ON public.social_intelligence(expires_at);
CREATE INDEX idx_viral_content_user ON public.viral_content(user_id, created_at DESC);
CREATE INDEX idx_trend_predictions_user ON public.trend_predictions(user_id, target_date);