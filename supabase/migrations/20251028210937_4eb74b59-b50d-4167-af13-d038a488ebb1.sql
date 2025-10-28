-- Fix security issue: Set explicit search_path for function
DROP FUNCTION IF EXISTS increment_memory_retrieval(uuid);

CREATE OR REPLACE FUNCTION increment_memory_retrieval(memory_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE agent_memory 
  SET 
    retrieval_count = retrieval_count + 1,
    last_retrieved_at = now()
  WHERE id = memory_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;