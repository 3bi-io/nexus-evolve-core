-- Fix visitor tracking security issue on usage_sessions table
-- Restrict anonymous users from querying other visitors' sessions

-- First, check if the table exists and has the problematic policy
DO $$ 
BEGIN
  -- Drop existing overly permissive policies if they exist
  DROP POLICY IF EXISTS "Users can view their own sessions" ON usage_sessions;
  DROP POLICY IF EXISTS "Anyone can view sessions" ON usage_sessions;
  DROP POLICY IF EXISTS "Public read access" ON usage_sessions;
END $$;

-- Create a secure policy that only allows users to view their own sessions
-- This prevents visitor tracking across sessions
CREATE POLICY "Users can only view their own sessions"
ON usage_sessions
FOR SELECT
USING (
  -- Authenticated users can only see their own sessions
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Service role can see all (for admin operations)
  (auth.jwt() ->> 'role' = 'service_role')
);

-- Ensure users can create their own sessions
CREATE POLICY "Users can create their own sessions"
ON usage_sessions
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.jwt() ->> 'role' = 'service_role')
);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
ON usage_sessions
FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.jwt() ->> 'role' = 'service_role')
);

COMMENT ON POLICY "Users can only view their own sessions" ON usage_sessions IS 
'Security fix: Prevents cross-visitor tracking by restricting SELECT to user-owned sessions only. Visitor credit IDs are no longer queryable across sessions.';