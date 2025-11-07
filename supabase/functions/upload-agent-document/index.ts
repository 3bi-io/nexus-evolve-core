import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('upload-agent-document', requestId);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    const body = await req.json();

    validateRequiredFields(body, ['agentId', 'document', 'title']);
    validateString(body.agentId, 'agentId');
    validateString(body.document, 'document');
    validateString(body.title, 'title');

    const { agentId, document, title } = body;

    logger.info('Uploading agent document', { agentId, title, userId: user.id });

    // Verify ownership
    const { data: agent, error: agentError } = await supabase
      .from('custom_agents')
      .select('id')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or unauthorized');
    }

    // Chunk the document (500 words per chunk)
    const words = document.split(/\s+/);
    const chunks = [];
    const chunkSize = 500;
    
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }

    logger.info('Processing document chunks', { chunks: chunks.length });

    // Store each chunk in knowledge_base
    const knowledgeIds = [];
    for (let i = 0; i < chunks.length; i++) {
      const { data: kb, error: kbError } = await supabase
        .from('knowledge_base')
        .insert({
          user_id: user.id,
          content: chunks[i],
          metadata: {
            title,
            chunk: i + 1,
            total_chunks: chunks.length,
            agent_id: agentId
          }
        })
        .select()
        .single();

      if (kbError) {
        logger.error('Failed to insert chunk', { chunk: i + 1, error: kbError });
        continue;
      }

      knowledgeIds.push(kb.id);

      // Link to agent
      await supabase
        .from('agent_knowledge_links')
        .insert({
          agent_id: agentId,
          knowledge_id: kb.id
        });

      // Generate embeddings asynchronously
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        await fetch(`${supabaseUrl}/functions/v1/generate-embeddings`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contentId: kb.id,
            content: chunks[i]
          })
        });
      } catch (embError) {
        logger.error('Embedding generation failed', { chunk: i + 1, error: embError });
      }
    }

    logger.info('Document upload completed', { knowledgeIds: knowledgeIds.length });

    return successResponse({
      message: `Document uploaded and processed into ${chunks.length} chunks`,
      chunks: chunks.length,
      knowledgeIds
    }, requestId);
  } catch (error) {
    logger.error('Document upload failed', error);
    return handleError({ functionName: 'upload-agent-document', error, requestId });
  }
});
