-- Create admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Super admins can view all admin actions
CREATE POLICY "Super admins can view all admin actions"
ON public.admin_actions FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Admins can create their own action logs
CREATE POLICY "Admins can create their own action logs"
ON public.admin_actions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = admin_user_id AND 
  (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'))
);

-- Create feature flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can view feature flags
CREATE POLICY "Everyone can view feature flags"
ON public.feature_flags FOR SELECT
TO authenticated
USING (true);

-- Only super admins can manage feature flags
CREATE POLICY "Super admins can manage feature flags"
ON public.feature_flags FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Create system announcements table
CREATE TABLE IF NOT EXISTS public.system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can view active announcements
CREATE POLICY "Everyone can view active announcements"
ON public.system_announcements FOR SELECT
TO authenticated
USING (is_active = true AND start_date <= NOW() AND (end_date IS NULL OR end_date > NOW()));

-- Only super admins can manage announcements
CREATE POLICY "Super admins can manage announcements"
ON public.system_announcements FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_user_id ON public.admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flags_flag_name ON public.feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_system_announcements_active ON public.system_announcements(is_active, start_date, end_date);