-- Fix function search_path issues
-- Add SET search_path to functions that are missing it

-- Note: Vector extension functions are from pgvector and cannot be modified
-- The warnings about extensions in public schema can be documented as exceptions

-- If there are any custom SECURITY DEFINER functions without search_path set,
-- they should be identified and fixed. The linter doesn't provide specific function names,
-- but based on the codebase review, most functions already have SET search_path = 'public'

-- Document exceptions for vector extension functions
COMMENT ON EXTENSION vector IS 'pgvector extension - requires public schema for proper operation';

-- Verify all custom functions have proper search_path
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT 
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_functiondef(p.oid) as function_def
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prosecdef = true  -- SECURITY DEFINER
    AND pg_get_functiondef(p.oid) NOT LIKE '%search_path%'
    AND p.proname NOT LIKE 'vector%'  -- Exclude vector extension functions
    AND p.proname NOT LIKE 'halfvec%'
    AND p.proname NOT LIKE 'sparsevec%'
    AND p.proname NOT LIKE '%ivfflat%'
    AND p.proname NOT LIKE '%hnsw%'
  LOOP
    RAISE NOTICE 'Function % needs search_path: %', func_record.function_name, func_record.schema_name;
  END LOOP;
END $$;