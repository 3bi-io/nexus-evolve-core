-- Negotiation Agent System Tables

-- 1. Negotiation Sessions (main session tracking)
CREATE TABLE public.negotiation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_persona TEXT NOT NULL DEFAULT 'zara',
  cumulative_favorability INTEGER DEFAULT 0,
  current_price_tier DECIMAL(5,2) DEFAULT 11.99,
  session_state JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  completion_reason TEXT
);

-- 2. Negotiation Rounds (per-message scoring)
CREATE TABLE public.negotiation_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.negotiation_sessions(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  user_message TEXT NOT NULL,
  agent_response TEXT,
  round_score INTEGER DEFAULT 0,
  score_breakdown JSONB DEFAULT '{}',
  security_flags JSONB DEFAULT '{}',
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. User Negotiation Profiles (aggregated stats)
CREATE TABLE public.user_negotiation_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_sessions INTEGER DEFAULT 0,
  successful_negotiations INTEGER DEFAULT 0,
  average_favorability DECIMAL(5,2) DEFAULT 0,
  preferred_personas TEXT[] DEFAULT '{}',
  behavioral_patterns JSONB DEFAULT '{}',
  last_negotiation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Agent Personas (configurable personalities)
CREATE TABLE public.agent_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  personality_config JSONB NOT NULL DEFAULT '{}',
  scoring_weights JSONB DEFAULT '{"creativity":2,"effort":2,"authenticity":1,"technical":2}',
  response_patterns JSONB DEFAULT '{}',
  cultural_references JSONB DEFAULT '{}',
  pricing_matrix JSONB DEFAULT '{"0-6":11.99,"7-11":8.99,"12-18":6.99,"19-24":4.99,"25-35":3.49,"36-47":2.49,"48-60":1.99,"61-75":1.49,"76-100":0.99}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.negotiation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_negotiation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_personas ENABLE ROW LEVEL SECURITY;

-- Negotiation Sessions policies
CREATE POLICY "Users can view their own sessions" ON public.negotiation_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.negotiation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.negotiation_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all sessions" ON public.negotiation_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Negotiation Rounds policies
CREATE POLICY "Users can view rounds for their sessions" ON public.negotiation_rounds
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.negotiation_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));
CREATE POLICY "Service role can insert rounds" ON public.negotiation_rounds
  FOR INSERT WITH CHECK (true);

-- User Negotiation Profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_negotiation_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.user_negotiation_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_negotiation_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage profiles" ON public.user_negotiation_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Agent Personas policies
CREATE POLICY "Anyone can view active personas" ON public.agent_personas
  FOR SELECT USING (is_active = true);
CREATE POLICY "Super admins can manage personas" ON public.agent_personas
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Indexes for performance
CREATE INDEX idx_neg_sessions_user ON public.negotiation_sessions(user_id);
CREATE INDEX idx_neg_sessions_persona ON public.negotiation_sessions(agent_persona);
CREATE INDEX idx_neg_rounds_session ON public.negotiation_rounds(session_id);
CREATE INDEX idx_neg_rounds_score ON public.negotiation_rounds(round_score DESC);

-- Trigger for updated_at
CREATE TRIGGER update_negotiation_sessions_updated_at
  BEFORE UPDATE ON public.negotiation_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_negotiation_profiles_updated_at
  BEFORE UPDATE ON public.user_negotiation_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default Zara persona
INSERT INTO public.agent_personas (name, personality_config, scoring_weights, response_patterns, cultural_references)
VALUES (
  'zara',
  '{
    "base_traits": ["lowercase", "no_punctuation", "contractions", "gen-z"],
    "emotional_range": ["excitement", "fake_offense", "playful_roasting"],
    "anti_corporate": true,
    "music_knowledge": ["tyler", "frank", "bladee", "yeat", "steve_lacy"]
  }',
  '{"creativity": 2, "effort": 2, "authenticity": 1, "technical": 2}',
  '{
    "greetings": ["yo", "ayy", "ok so", "ngl"],
    "reactions": ["lmao", "💀", "no way", "thats crazy"],
    "closers": ["anyway", "but yeah", "so like"]
  }',
  '{
    "music": ["tyler the creator", "frank ocean", "bladee", "yeat"],
    "internet": ["npc behavior", "main character", "its giving"],
    "tech": ["chatgpt", "midjourney", "based takes"]
  }'
);