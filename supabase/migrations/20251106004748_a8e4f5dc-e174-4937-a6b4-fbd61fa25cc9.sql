-- Update functions to set search_path explicitly for security

-- 1. Update match_knowledge_base to set search_path
CREATE OR REPLACE FUNCTION public.match_knowledge_base(
  query_embedding extensions.vector, 
  match_threshold double precision DEFAULT 0.7, 
  match_count integer DEFAULT 10, 
  p_user_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  topic text, 
  content text, 
  source_url text, 
  created_at timestamp with time zone, 
  similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.user_id,
    kb.topic,
    kb.content,
    kb.source_url,
    kb.created_at,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM knowledge_base kb
  WHERE kb.user_id = p_user_id
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. Update update_router_updated_at to set search_path
CREATE OR REPLACE FUNCTION public.update_router_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;