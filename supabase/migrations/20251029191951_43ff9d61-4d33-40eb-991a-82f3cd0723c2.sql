-- Create table to track active usage sessions
CREATE TABLE IF NOT EXISTS public.usage_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  visitor_credit_id UUID,
  session_id UUID,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  credits_deducted INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usage_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.usage_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create sessions"
ON public.usage_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their sessions"
ON public.usage_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can manage all sessions
CREATE POLICY "Service role can manage all sessions"
ON public.usage_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_usage_sessions_user_id ON public.usage_sessions(user_id);
CREATE INDEX idx_usage_sessions_is_active ON public.usage_sessions(is_active);
CREATE INDEX idx_usage_sessions_visitor_id ON public.usage_sessions(visitor_credit_id);