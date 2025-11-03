-- Create Founder badge achievement definition if it doesn't exist
INSERT INTO public.achievement_definitions (
  achievement_key, 
  name, 
  description, 
  category, 
  icon, 
  target_value
)
VALUES (
  'founder_badge',
  'Founder',
  'Original beta tester and platform founder',
  'special',
  '🚀',
  1
)
ON CONFLICT (achievement_key) DO NOTHING;

-- Grant super_admin role to c@3bi.io
INSERT INTO public.user_roles (user_id, role)
VALUES ('d191f5bc-aa0f-4aa3-8cb5-798c999f2b9a', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Grant Founder badge achievement to c@3bi.io
INSERT INTO public.user_achievements (
  user_id, 
  achievement_key, 
  progress, 
  completed_at
)
VALUES (
  'd191f5bc-aa0f-4aa3-8cb5-798c999f2b9a',
  'founder_badge',
  1,
  NOW()
)
ON CONFLICT (user_id, achievement_key) DO NOTHING;