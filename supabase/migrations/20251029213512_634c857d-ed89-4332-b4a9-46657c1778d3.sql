-- Phase 5: Multimodal Intelligence

-- Table for generated images
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT,
  image_data TEXT, -- base64 encoded image
  model_used TEXT DEFAULT 'google/gemini-2.5-flash-image-preview',
  generation_time_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for voice interactions
CREATE TABLE IF NOT EXISTS public.voice_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL, -- 'speech_to_text', 'text_to_speech'
  input_text TEXT,
  output_text TEXT,
  audio_data TEXT, -- base64 encoded audio
  audio_duration_ms INTEGER,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for multimodal sessions
CREATE TABLE IF NOT EXISTS public.multimodal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- 'image_generation', 'voice_chat', 'mixed'
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_generated_images_user_id ON public.generated_images(user_id);
CREATE INDEX idx_generated_images_created_at ON public.generated_images(created_at DESC);
CREATE INDEX idx_voice_interactions_user_id ON public.voice_interactions(user_id);
CREATE INDEX idx_voice_interactions_type ON public.voice_interactions(interaction_type);
CREATE INDEX idx_multimodal_sessions_user_id ON public.multimodal_sessions(user_id);

-- RLS Policies
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multimodal_sessions ENABLE ROW LEVEL SECURITY;

-- generated_images policies
CREATE POLICY "Users can view their own generated images"
  ON public.generated_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated images"
  ON public.generated_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated images"
  ON public.generated_images FOR DELETE
  USING (auth.uid() = user_id);

-- voice_interactions policies
CREATE POLICY "Users can view their own voice interactions"
  ON public.voice_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice interactions"
  ON public.voice_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- multimodal_sessions policies
CREATE POLICY "Users can view their own multimodal sessions"
  ON public.multimodal_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own multimodal sessions"
  ON public.multimodal_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own multimodal sessions"
  ON public.multimodal_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own multimodal sessions"
  ON public.multimodal_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_multimodal_sessions_updated_at
  BEFORE UPDATE ON public.multimodal_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();