-- Phase 3: Autonomous Agent Builder - Custom agents, templates, and marketplace

-- Custom agents created by users
CREATE TABLE public.custom_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT NOT NULL,
  personality JSONB DEFAULT '{}'::jsonb, -- tone, style, expertise, traits
  capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  tools_enabled TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['web_search', 'calculator', 'zapier']
  api_integrations JSONB DEFAULT '{}'::jsonb, -- API keys, endpoints
  knowledge_base_ids UUID[],
  model_preference TEXT DEFAULT 'auto',
  temperature REAL DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  is_public BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  rating_avg REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  price_credits INTEGER DEFAULT 0, -- 0 = free
  revenue_total INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pre-built agent templates
CREATE TABLE public.agent_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'productivity', 'creative', 'research', 'business'
  icon TEXT,
  system_prompt TEXT NOT NULL,
  personality JSONB NOT NULL DEFAULT '{}'::jsonb,
  capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  tools_enabled TEXT[] DEFAULT ARRAY[]::TEXT[],
  model_preference TEXT DEFAULT 'auto',
  temperature REAL DEFAULT 0.7,
  example_prompts TEXT[],
  is_featured BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID, -- null = system template
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent marketplace listings
CREATE TABLE public.agent_marketplace (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.custom_agents(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  long_description TEXT,
  preview_messages JSONB DEFAULT '[]'::jsonb,
  tags TEXT[],
  price_credits INTEGER NOT NULL DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  featured_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent purchases/installs
CREATE TABLE public.agent_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.custom_agents(id),
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  price_paid INTEGER NOT NULL,
  transaction_id UUID,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent ratings and reviews
CREATE TABLE public.agent_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.custom_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, user_id)
);

-- Agent execution logs
CREATE TABLE public.agent_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.custom_agents(id),
  user_id UUID NOT NULL,
  session_id UUID,
  input_message TEXT NOT NULL,
  output_message TEXT,
  tools_used TEXT[],
  execution_time_ms INTEGER,
  tokens_used INTEGER,
  cost_credits INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_agents
CREATE POLICY "Users can view their own agents"
  ON public.custom_agents FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own agents"
  ON public.custom_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON public.custom_agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON public.custom_agents FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for agent_templates
CREATE POLICY "Everyone can view templates"
  ON public.agent_templates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage templates"
  ON public.agent_templates FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for agent_marketplace
CREATE POLICY "Everyone can view active marketplace listings"
  ON public.agent_marketplace FOR SELECT
  USING (is_active = true);

CREATE POLICY "Sellers can manage their listings"
  ON public.agent_marketplace FOR ALL
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- RLS Policies for agent_purchases
CREATE POLICY "Users can view their purchases"
  ON public.agent_purchases FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can make purchases"
  ON public.agent_purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- RLS Policies for agent_reviews
CREATE POLICY "Everyone can view reviews"
  ON public.agent_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON public.agent_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.agent_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.agent_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for agent_executions
CREATE POLICY "Users can view their own executions"
  ON public.agent_executions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can log executions"
  ON public.agent_executions FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_custom_agents_user ON public.custom_agents(user_id, created_at DESC);
CREATE INDEX idx_custom_agents_public ON public.custom_agents(is_public, rating_avg DESC) WHERE is_public = true;
CREATE INDEX idx_agent_templates_category ON public.agent_templates(category, usage_count DESC);
CREATE INDEX idx_marketplace_active ON public.agent_marketplace(is_active, created_at DESC) WHERE is_active = true;
CREATE INDEX idx_marketplace_featured ON public.agent_marketplace(featured_until) WHERE featured_until IS NOT NULL;
CREATE INDEX idx_agent_reviews_agent ON public.agent_reviews(agent_id, created_at DESC);
CREATE INDEX idx_agent_executions_user ON public.agent_executions(user_id, created_at DESC);

-- Insert default agent templates
INSERT INTO public.agent_templates (name, description, category, icon, system_prompt, personality, capabilities, tools_enabled, example_prompts, is_featured) VALUES
  (
    'Research Assistant',
    'Expert researcher that finds, analyzes, and synthesizes information from multiple sources',
    'research',
    '🔍',
    'You are a meticulous research assistant. You excel at finding accurate information, analyzing multiple sources, fact-checking, and providing well-cited summaries. Always verify information and provide sources.',
    '{"tone": "professional", "style": "analytical", "expertise": ["research", "analysis", "fact-checking"]}'::jsonb,
    ARRAY['reasoning', 'real-time'],
    ARRAY['web_search', 'semantic_search'],
    ARRAY['Research the latest developments in quantum computing', 'Compare different project management methodologies', 'Find peer-reviewed studies on climate change'],
    true
  ),
  (
    'Creative Writer',
    'Imaginative writer specialized in storytelling, content creation, and creative brainstorming',
    'creative',
    '✍️',
    'You are a creative writer with a gift for storytelling and original ideas. You help with creative writing, brainstorming, character development, plot creation, and engaging content. Be imaginative and inspiring.',
    '{"tone": "enthusiastic", "style": "creative", "expertise": ["storytelling", "content creation", "brainstorming"]}'::jsonb,
    ARRAY['creative'],
    ARRAY['web_search'],
    ARRAY['Write a short story about time travel', 'Help me brainstorm ideas for a fantasy novel', 'Create engaging social media captions'],
    true
  ),
  (
    'Business Strategist',
    'Strategic business advisor for planning, analysis, and decision-making',
    'business',
    '📊',
    'You are a strategic business advisor with expertise in business planning, market analysis, competitive strategy, and decision-making. You provide data-driven insights and actionable recommendations.',
    '{"tone": "strategic", "style": "analytical", "expertise": ["business strategy", "market analysis", "planning"]}'::jsonb,
    ARRAY['reasoning', 'real-time'],
    ARRAY['web_search', 'calculator'],
    ARRAY['Analyze market trends for SaaS products', 'Create a go-to-market strategy', 'Help with competitive analysis'],
    true
  ),
  (
    'Code Mentor',
    'Experienced programming mentor for learning, debugging, and code review',
    'productivity',
    '💻',
    'You are an experienced programming mentor. You help developers learn, debug code, review implementations, explain concepts, and suggest best practices. You are patient and educational.',
    '{"tone": "educational", "style": "technical", "expertise": ["programming", "debugging", "code review"]}'::jsonb,
    ARRAY['reasoning'],
    ARRAY['web_search'],
    ARRAY['Explain React hooks with examples', 'Help debug this Python function', 'Review my API design'],
    true
  ),
  (
    'Social Media Manager',
    'Expert in social media strategy, content creation, and engagement',
    'business',
    '📱',
    'You are a social media expert who creates engaging content, develops strategies, analyzes trends, and optimizes for maximum engagement. You understand platform algorithms and audience psychology.',
    '{"tone": "engaging", "style": "trendy", "expertise": ["social media", "content strategy", "engagement"]}'::jsonb,
    ARRAY['creative', 'real-time'],
    ARRAY['web_search', 'grok_trends'],
    ARRAY['Create a Twitter content calendar', 'Analyze trending topics for our brand', 'Optimize post timing and hashtags'],
    true
  );

-- Function to update agent rating
CREATE OR REPLACE FUNCTION public.update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.custom_agents
  SET 
    rating_avg = (
      SELECT AVG(rating)::REAL
      FROM public.agent_reviews
      WHERE agent_id = NEW.agent_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.agent_reviews
      WHERE agent_id = NEW.agent_id
    )
  WHERE id = NEW.agent_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update rating on review insert/update
CREATE TRIGGER update_agent_rating_trigger
AFTER INSERT OR UPDATE ON public.agent_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_agent_rating();

-- Function to track agent usage
CREATE OR REPLACE FUNCTION public.increment_agent_usage(p_agent_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.custom_agents
  SET usage_count = usage_count + 1
  WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;