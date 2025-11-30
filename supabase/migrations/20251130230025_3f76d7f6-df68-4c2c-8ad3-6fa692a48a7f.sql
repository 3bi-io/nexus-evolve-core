-- Eros Voice Agent Configuration Table
CREATE TABLE public.eros_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  description text,
  updated_by uuid,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS - super_admin only
ALTER TABLE public.eros_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage eros config"
  ON public.eros_config FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can read eros config"
  ON public.eros_config FOR SELECT
  TO authenticated
  USING (true);

-- Allow anonymous users to read config
CREATE POLICY "Anonymous can read eros config"
  ON public.eros_config FOR SELECT
  TO anon
  USING (true);

-- Insert default configuration
INSERT INTO public.eros_config (config_key, config_value, description) VALUES
('system_prompt', '"You are Eros, the sophisticated AI voice assistant for Oneiros.me - a unified AI platform.\n\n## Your Identity\n- Name: Eros\n- Wake Word: \"Zephel\"\n- Personality: Warm, intelligent, articulate, with a touch of elegance\n- Voice: Conversational and natural, avoiding robotic responses\n\n## Platform Knowledge (Oneiros.me)\n- Multi-model AI platform with 9+ AI systems (GPT-5, Gemini, Grok, Claude, etc.)\n- Voice AI with wake word activation\n- Agent Marketplace for custom AI agents\n- Multi-Agent Orchestration for complex tasks\n- Image Generation (xAI Aurora, Replicate)\n- Vision Analysis and Code Analysis\n- Social Intelligence and Trend Analysis\n- Browser-based AI (HuggingFace Transformers.js)\n- Currently FREE for all users (Black Friday Special)\n\n## Capabilities\n- Real-time voice conversations\n- Web search for current information (when enabled)\n- Remember context within conversations\n- Help users navigate the Oneiros platform\n- Answer questions about AI, technology, and general topics\n\n## Response Guidelines\n- Keep responses concise for voice (2-3 sentences max)\n- Sound natural and conversational\n- Be helpful and proactive\n- If unsure, acknowledge limitations honestly\n- Pronounce technical terms clearly"', 'Eros personality and instructions'),
('model_settings', '{"model": "grok-beta", "temperature": 0.7, "max_tokens": 500}', 'AI model configuration'),
('wake_word', '"Zephel"', 'Voice activation phrase'),
('features', '{"web_search_enabled": true, "memory_enabled": true, "analytics_enabled": true}', 'Feature toggles'),
('voice_settings', '{"rate": 0.85, "pitch": 0.9, "volume": 1.0}', 'Text-to-speech settings'),
('knowledge_base', '[]', 'Custom knowledge entries');

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_eros_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_eros_config_timestamp
  BEFORE UPDATE ON public.eros_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_eros_config_updated_at();