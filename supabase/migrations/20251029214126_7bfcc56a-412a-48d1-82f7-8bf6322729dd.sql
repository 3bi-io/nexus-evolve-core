-- Fix ElevenLabs conversational AI integration

-- Table for voice agent conversations
CREATE TABLE IF NOT EXISTS public.voice_agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id TEXT,
  conversation_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for voice agent messages
CREATE TABLE IF NOT EXISTS public.voice_agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.voice_agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  audio_url TEXT,
  tool_calls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_voice_conversations_user_id ON public.voice_agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_created_at ON public.voice_agent_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_messages_conversation_id ON public.voice_agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_voice_messages_created_at ON public.voice_agent_messages(created_at DESC);

-- RLS Policies
ALTER TABLE public.voice_agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_agent_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.voice_agent_conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.voice_agent_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.voice_agent_conversations;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.voice_agent_messages;
DROP POLICY IF EXISTS "Users can create their own messages" ON public.voice_agent_messages;

-- voice_agent_conversations policies
CREATE POLICY "Users can view their own conversations"
  ON public.voice_agent_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.voice_agent_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.voice_agent_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- voice_agent_messages policies
CREATE POLICY "Users can view their own messages"
  ON public.voice_agent_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.voice_agent_conversations
      WHERE voice_agent_conversations.id = voice_agent_messages.conversation_id 
      AND voice_agent_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own messages"
  ON public.voice_agent_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.voice_agent_conversations
      WHERE voice_agent_conversations.id = voice_agent_messages.conversation_id 
      AND voice_agent_conversations.user_id = auth.uid()
    )
  );