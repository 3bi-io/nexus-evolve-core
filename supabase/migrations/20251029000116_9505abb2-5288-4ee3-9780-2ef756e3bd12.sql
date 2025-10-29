-- Fix function search path security issue by recreating with proper settings
DROP TRIGGER IF EXISTS update_user_preferences_timestamp ON public.user_preferences;
DROP FUNCTION IF EXISTS update_user_preferences_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_preferences_timestamp
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();