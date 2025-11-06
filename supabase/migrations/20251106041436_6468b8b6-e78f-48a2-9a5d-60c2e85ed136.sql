-- Phase 1: XAI Model Infrastructure
-- XAI Models Registry
CREATE TABLE IF NOT EXISTS public.xai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id TEXT UNIQUE NOT NULL,
  model_name TEXT NOT NULL,
  capabilities TEXT[] NOT NULL,
  supports_streaming BOOLEAN DEFAULT true,
  supports_vision BOOLEAN DEFAULT false,
  supports_image_gen BOOLEAN DEFAULT false,
  supports_function_calling BOOLEAN DEFAULT false,
  max_tokens INTEGER DEFAULT 131072,
  cost_per_1m_input_tokens DECIMAL(10,4),
  cost_per_1m_output_tokens DECIMAL(10,4),
  is_available BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 50,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- XAI Usage Analytics
CREATE TABLE IF NOT EXISTS public.xai_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  model_id TEXT NOT NULL,
  feature_type TEXT NOT NULL,
  tokens_used INTEGER,
  cost_credits DECIMAL(10,4),
  latency_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- XAI Generated Images
CREATE TABLE IF NOT EXISTS public.xai_generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model TEXT DEFAULT 'grok-2-image-1212',
  num_images INTEGER DEFAULT 1,
  image_urls TEXT[] NOT NULL,
  image_data JSONB,
  generation_time_ms INTEGER,
  cost_credits DECIMAL(10,4),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- XAI Vision Analysis
CREATE TABLE IF NOT EXISTS public.xai_vision_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  image_url TEXT NOT NULL,
  query TEXT NOT NULL,
  model TEXT DEFAULT 'grok-vision-beta',
  analysis_result JSONB NOT NULL,
  confidence_score REAL,
  processing_time_ms INTEGER,
  cost_credits DECIMAL(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- XAI Function Calls Log
CREATE TABLE IF NOT EXISTS public.xai_function_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id UUID,
  function_name TEXT NOT NULL,
  arguments JSONB NOT NULL,
  result JSONB,
  success BOOLEAN DEFAULT true,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance social_intelligence with citations
ALTER TABLE public.social_intelligence
ADD COLUMN IF NOT EXISTS citations JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS sources TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS x_handles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS confidence_score REAL DEFAULT 0.8,
ADD COLUMN IF NOT EXISTS model_used TEXT DEFAULT 'grok-beta';

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_xai_usage_user_id ON public.xai_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_xai_usage_created_at ON public.xai_usage_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xai_usage_user_created ON public.xai_usage_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xai_images_user_id ON public.xai_generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_xai_images_user_created ON public.xai_generated_images(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xai_vision_user_id ON public.xai_vision_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_xai_vision_user_created ON public.xai_vision_analysis(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xai_function_calls_created ON public.xai_function_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_intelligence_user_topic ON public.social_intelligence(user_id, topic);
CREATE INDEX IF NOT EXISTS idx_social_intelligence_type_expires ON public.social_intelligence(intelligence_type, expires_at);

-- Enable RLS
ALTER TABLE public.xai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xai_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xai_generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xai_vision_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xai_function_calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for xai_models (read-only for all authenticated users)
CREATE POLICY "Anyone can view XAI models"
  ON public.xai_models FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for xai_usage_analytics
CREATE POLICY "Users can view their own usage analytics"
  ON public.xai_usage_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage analytics"
  ON public.xai_usage_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage analytics"
  ON public.xai_usage_analytics FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for xai_generated_images
CREATE POLICY "Users can view their own generated images"
  ON public.xai_generated_images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated images"
  ON public.xai_generated_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated images"
  ON public.xai_generated_images FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for xai_vision_analysis
CREATE POLICY "Users can view their own vision analysis"
  ON public.xai_vision_analysis FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vision analysis"
  ON public.xai_vision_analysis FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for xai_function_calls
CREATE POLICY "Users can view their own function calls"
  ON public.xai_function_calls FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all function calls"
  ON public.xai_function_calls FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Insert default XAI models
INSERT INTO public.xai_models (model_id, model_name, capabilities, supports_streaming, supports_vision, supports_image_gen, supports_function_calling, max_tokens, cost_per_1m_input_tokens, cost_per_1m_output_tokens, priority, metadata) VALUES
('grok-4', 'Grok 4', ARRAY['reasoning', 'code', 'analysis', 'search'], true, false, false, true, 131072, 3.0000, 15.0000, 90, '{"description": "Most powerful Grok model for complex reasoning and analysis"}'),
('grok-3', 'Grok 3', ARRAY['chat', 'reasoning', 'search'], true, false, false, true, 131072, 1.0000, 5.0000, 80, '{"description": "Balanced performance for most tasks"}'),
('grok-3-mini', 'Grok 3 Mini', ARRAY['chat', 'classification', 'simple-tasks'], true, false, false, false, 131072, 0.3000, 0.5000, 70, '{"description": "Fast and cost-effective for simple tasks"}'),
('grok-code-fast-1', 'Grok Code Fast', ARRAY['code', 'analysis', 'debug'], true, false, false, true, 131072, 0.3000, 0.5000, 75, '{"description": "Specialized for code analysis and generation"}'),
('grok-2-image-1212', 'Grok 2 Image', ARRAY['image-generation'], false, false, true, false, 0, 0, 0, 60, '{"description": "High-quality image generation", "cost_per_image": 0.05}'),
('grok-vision-beta', 'Grok Vision Beta', ARRAY['vision', 'ocr', 'analysis'], true, true, false, true, 131072, 1.0000, 5.0000, 85, '{"description": "Advanced image understanding and analysis"}'),
('grok-beta', 'Grok Beta (Legacy)', ARRAY['chat', 'search'], true, false, false, false, 131072, 0.5000, 1.5000, 50, '{"description": "Legacy model, use newer models instead"}')
ON CONFLICT (model_id) DO NOTHING;