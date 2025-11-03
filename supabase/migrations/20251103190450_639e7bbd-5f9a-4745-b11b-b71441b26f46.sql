-- Phase 1: Database Consistency Fixes & Indexes

-- Add indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON public.admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON public.admin_actions(admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON public.feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_system_announcements_active ON public.system_announcements(is_active, start_date, end_date);

-- Create helper function for admin action logging
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action_type TEXT,
  _target_type TEXT DEFAULT NULL,
  _target_id UUID DEFAULT NULL,
  _details JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action_id UUID;
  _ip_address TEXT;
BEGIN
  -- Try to get IP from headers, fallback to NULL if not available
  BEGIN
    _ip_address := current_setting('request.headers', true)::json->>'x-forwarded-for';
  EXCEPTION WHEN OTHERS THEN
    _ip_address := NULL;
  END;
  
  INSERT INTO public.admin_actions (
    admin_user_id, 
    action_type, 
    target_type, 
    target_id, 
    details, 
    ip_address
  ) VALUES (
    auth.uid(), 
    _action_type, 
    _target_type, 
    _target_id, 
    _details, 
    _ip_address
  )
  RETURNING id INTO _action_id;
  
  RETURN _action_id;
END;
$$;

-- Add function to get real-time stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSONB;
BEGIN
  -- Only allow super_admins to access
  IF NOT public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_agents', (SELECT COUNT(*) FROM public.custom_agents),
    'total_sessions', (SELECT COUNT(*) FROM public.sessions),
    'active_announcements', (SELECT COUNT(*) FROM public.system_announcements WHERE is_active = true),
    'pending_agent_approvals', (SELECT COUNT(*) FROM public.custom_agents WHERE is_template = false AND visibility = 'public'),
    'total_credits_distributed', (SELECT COALESCE(SUM(credits_total), 0) FROM public.user_subscriptions)
  ) INTO stats;
  
  RETURN stats;
END;
$$;