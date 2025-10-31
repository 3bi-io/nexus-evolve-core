-- Enhanced knowledge base table with metadata for better retrieval
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'note';
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS chunk_index INTEGER DEFAULT 0;
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS parent_doc_id UUID;
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS keywords TEXT[];

-- Create index for keyword search
CREATE INDEX IF NOT EXISTS idx_kb_keywords ON knowledge_base USING GIN(keywords);

-- Create full-text search column and index
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS tsv tsvector;

CREATE INDEX IF NOT EXISTS idx_kb_tsv ON knowledge_base USING GIN(tsv);

-- Trigger to update tsvector on insert/update
CREATE OR REPLACE FUNCTION update_tsv_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tsv := to_tsvector('english', COALESCE(NEW.topic, '') || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON knowledge_base;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_tsv_column();

-- Table for query history and feedback
CREATE TABLE IF NOT EXISTS rag_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  transformed_query TEXT,
  results_count INTEGER,
  user_feedback TEXT,
  response_quality_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_queries_user ON rag_queries(user_id);

-- Enable RLS on rag_queries
ALTER TABLE rag_queries ENABLE ROW LEVEL SECURITY;

-- RLS policies for rag_queries
CREATE POLICY "Users can create their own RAG queries"
ON rag_queries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own RAG queries"
ON rag_queries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RPC function for vector similarity search
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  topic text,
  content text,
  source_url text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
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