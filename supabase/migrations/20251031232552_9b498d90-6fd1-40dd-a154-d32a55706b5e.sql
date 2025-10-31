-- Add huggingface_models table to track available models
CREATE TABLE IF NOT EXISTS public.huggingface_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id TEXT UNIQUE NOT NULL,
  task TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  parameters_count BIGINT,
  license TEXT,
  active BOOLEAN DEFAULT true,
  cost_per_1k_tokens DECIMAL(10,4),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for huggingface_models (read-only for authenticated users)
ALTER TABLE public.huggingface_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active HuggingFace models"
ON public.huggingface_models
FOR SELECT
USING (active = true);

-- Add provider column to llm_observations if not exists
ALTER TABLE public.llm_observations 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'lovable';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_huggingface_models_task ON public.huggingface_models(task);
CREATE INDEX IF NOT EXISTS idx_huggingface_models_active ON public.huggingface_models(active);
CREATE INDEX IF NOT EXISTS idx_llm_observations_provider ON public.llm_observations(provider);

-- Insert some default HuggingFace models
INSERT INTO public.huggingface_models (model_id, task, display_name, description, parameters_count, license, cost_per_1k_tokens, metadata) VALUES
('meta-llama/Llama-3.2-3B-Instruct', 'text-generation', 'Llama 3.2 3B Instruct', 'Fast and efficient instruction-following model', 3000000000, 'llama3.2', 0.0001, '{"streaming": true, "max_tokens": 8192}'::jsonb),
('mistralai/Mistral-7B-Instruct-v0.2', 'text-generation', 'Mistral 7B Instruct', 'High-quality instruction model', 7000000000, 'apache-2.0', 0.0002, '{"streaming": true, "max_tokens": 32768}'::jsonb),
('sentence-transformers/all-MiniLM-L6-v2', 'feature-extraction', 'MiniLM Embeddings', 'Fast and efficient text embeddings', 22000000, 'apache-2.0', 0.00005, '{"dimensions": 384}'::jsonb),
('stabilityai/stable-diffusion-xl-base-1.0', 'text-to-image', 'Stable Diffusion XL', 'High-quality image generation', 3500000000, 'openrail++', 0.005, '{"resolution": "1024x1024"}'::jsonb),
('runwayml/stable-diffusion-v1-5', 'text-to-image', 'Stable Diffusion 1.5', 'Economy image generation', 860000000, 'creativeml-openrail-m', 0.001, '{"resolution": "512x512"}'::jsonb)
ON CONFLICT (model_id) DO NOTHING;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_huggingface_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER huggingface_models_updated_at
BEFORE UPDATE ON public.huggingface_models
FOR EACH ROW
EXECUTE FUNCTION update_huggingface_models_updated_at();