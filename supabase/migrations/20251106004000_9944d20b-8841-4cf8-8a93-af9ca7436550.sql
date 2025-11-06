-- Grant super_admin role to user c@3bi.io
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE email = 'c@3bi.io'
ON CONFLICT (user_id, role) DO NOTHING;