-- Phase 2: Auto-Generate Embeddings
-- Create trigger function to automatically generate embeddings for new records

CREATE OR REPLACE FUNCTION public.trigger_generate_embedding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  text_content text;
BEGIN
  -- Get text content based on table
  IF TG_TABLE_NAME = 'agent_memory' THEN
    text_content := NEW.context_summary;
  ELSIF TG_TABLE_NAME = 'knowledge_base' THEN
    text_content := COALESCE(NEW.content, NEW.topic);
  ELSE
    RAISE EXCEPTION 'Unsupported table: %', TG_TABLE_NAME;
  END IF;

  -- Only proceed if we have text content
  IF text_content IS NULL OR text_content = '' THEN
    RETURN NEW;
  END IF;

  -- Get Supabase URL from environment
  supabase_url := 'https://coobieessxvnujkkiadc.supabase.co';
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- If service role key not configured, skip silently (embeddings will be NULL)
  IF service_role_key IS NULL OR service_role_key = '' THEN
    RAISE NOTICE 'Service role key not configured, skipping embedding generation';
    RETURN NEW;
  END IF;

  -- Call generate-embeddings edge function asynchronously via pg_net
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/generate-embeddings',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'text', text_content,
      'table', TG_TABLE_NAME,
      'record_id', NEW.id::text
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger for agent_memory table
DROP TRIGGER IF EXISTS after_insert_generate_memory_embedding ON agent_memory;
CREATE TRIGGER after_insert_generate_memory_embedding
AFTER INSERT ON agent_memory
FOR EACH ROW
WHEN (NEW.embedding IS NULL)
EXECUTE FUNCTION trigger_generate_embedding();

-- Create trigger for knowledge_base table
DROP TRIGGER IF EXISTS after_insert_generate_knowledge_embedding ON knowledge_base;
CREATE TRIGGER after_insert_generate_knowledge_embedding
AFTER INSERT ON knowledge_base
FOR EACH ROW
WHEN (NEW.embedding IS NULL)
EXECUTE FUNCTION trigger_generate_embedding();

-- Log the setup
COMMENT ON FUNCTION public.trigger_generate_embedding() IS 'Automatically generates embeddings for new records in agent_memory and knowledge_base tables by calling the generate-embeddings edge function';