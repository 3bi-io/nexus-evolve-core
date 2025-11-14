-- Fix usage_sessions RLS policies to prevent unauthorized access
-- Critical Security Fix: Remove overly permissive policy that allows public access to all sessions

-- Drop the insecure policy that allows all users to manage all sessions
DROP POLICY IF EXISTS "Service role can manage all sessions" ON public.usage_sessions;

-- Drop duplicate policies (keeping the more secure versions)
DROP POLICY IF EXISTS "Users can create sessions" ON public.usage_sessions;
DROP POLICY IF EXISTS "Users can update their sessions" ON public.usage_sessions;

-- Ensure users can only view their own sessions (already exists but keeping it)
DROP POLICY IF EXISTS "Users can only view their own sessions" ON public.usage_sessions;
CREATE POLICY "Users can only view their own sessions" 
ON public.usage_sessions 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- Ensure users can only create their own sessions  
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.usage_sessions;
CREATE POLICY "Users can create their own sessions" 
ON public.usage_sessions 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- Ensure users can only update their own sessions
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.usage_sessions;
CREATE POLICY "Users can update their own sessions" 
ON public.usage_sessions 
FOR UPDATE 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- Allow super admins to view all sessions for monitoring purposes
CREATE POLICY "Super admins can view all sessions" 
ON public.usage_sessions 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- Allow super admins to manage all sessions for administrative purposes
CREATE POLICY "Super admins can manage all sessions" 
ON public.usage_sessions 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- Ensure RLS is enabled (should already be, but confirming)
ALTER TABLE public.usage_sessions ENABLE ROW LEVEL SECURITY;

-- Add comment documenting the security fix
COMMENT ON TABLE public.usage_sessions IS 'User session tracking data. RLS enforces users can only access their own sessions. Super admins have full access for monitoring.';