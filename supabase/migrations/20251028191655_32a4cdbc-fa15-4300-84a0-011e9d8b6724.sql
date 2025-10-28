-- Create sessions table for chat sessions
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE
);

-- Create interactions table for chat messages
CREATE TABLE public.interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  quality_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_memory table for storing memories
CREATE TABLE public.agent_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  context_summary TEXT NOT NULL,
  memory_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge_base table for learned topics
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create capability_modules table for dynamic capabilities
CREATE TABLE public.capability_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  capability_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evolution_logs table for tracking system evolution
CREATE TABLE public.evolution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create problem_solutions table for problem-solving history
CREATE TABLE public.problem_solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  problem_description TEXT NOT NULL,
  solution TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capability_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_solutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON public.sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for interactions
CREATE POLICY "Users can view their own interactions" ON public.interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own interactions" ON public.interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interactions" ON public.interactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interactions" ON public.interactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for agent_memory
CREATE POLICY "Users can view their own memories" ON public.agent_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own memories" ON public.agent_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own memories" ON public.agent_memory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own memories" ON public.agent_memory FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for knowledge_base
CREATE POLICY "Users can view their own knowledge" ON public.knowledge_base FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own knowledge" ON public.knowledge_base FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own knowledge" ON public.knowledge_base FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own knowledge" ON public.knowledge_base FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for capability_modules
CREATE POLICY "Users can view their own capabilities" ON public.capability_modules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own capabilities" ON public.capability_modules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own capabilities" ON public.capability_modules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own capabilities" ON public.capability_modules FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for evolution_logs
CREATE POLICY "Users can view their own evolution logs" ON public.evolution_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own evolution logs" ON public.evolution_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for problem_solutions
CREATE POLICY "Users can view their own solutions" ON public.problem_solutions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own solutions" ON public.problem_solutions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own solutions" ON public.problem_solutions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own solutions" ON public.problem_solutions FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_interactions_session_id ON public.interactions(session_id);
CREATE INDEX idx_interactions_user_id ON public.interactions(user_id);
CREATE INDEX idx_agent_memory_user_id ON public.agent_memory(user_id);
CREATE INDEX idx_knowledge_base_user_id ON public.knowledge_base(user_id);
CREATE INDEX idx_capability_modules_user_id ON public.capability_modules(user_id);
CREATE INDEX idx_evolution_logs_user_id ON public.evolution_logs(user_id);
CREATE INDEX idx_problem_solutions_user_id ON public.problem_solutions(user_id);