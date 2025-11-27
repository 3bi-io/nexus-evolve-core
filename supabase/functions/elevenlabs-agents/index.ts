import { corsHeaders } from '../_shared/cors.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { createLogger } from '../_shared/logger.ts';
import { optionalAuth } from '../_shared/auth.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { elevenLabsFetch } from '../_shared/api-client.ts';

interface Agent {
  agent_id: string;
  name: string;
  conversation_config?: {
    agent?: {
      prompt?: { prompt?: string };
      first_message?: string;
      language?: string;
    };
    tts?: {
      voice_id?: string;
    };
  };
  platform_settings?: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('elevenlabs-agents', requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    const isAnonymous = !user;
    
    logger.info('Processing ElevenLabs agents request', { 
      userId: user?.id || 'anonymous',
      isAnonymous 
    });

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    logger.debug('Action requested', { action });

    // List all agents
    if (action === 'list') {
      const response = await elevenLabsFetch('/v1/convai/agents', {
        method: 'GET',
      });

      if (!response.ok) throw response;

      const agents = await response.json();
      logger.info('Fetched agents', { count: agents.length || 0 });
      
      return successResponse(agents, requestId);
    }

    // Get single agent
    if (action === 'get') {
      const { agentId } = await req.json();
      
      const response = await elevenLabsFetch(`/v1/convai/agents/${agentId}`, {
        method: 'GET',
      });

      if (!response.ok) throw response;

      const agent = await response.json();
      return successResponse(agent, requestId);
    }

    // Create agent
    if (action === 'create') {
      const body = await req.json();
      
      const response = await elevenLabsFetch('/v1/convai/agents', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!response.ok) throw response;

      const agent = await response.json();
      logger.info('Created agent', { agentId: agent.agent_id });
      
      return successResponse(agent, requestId);
    }

    // Update agent
    if (action === 'update') {
      const { agentId, ...updateData } = await req.json();
      
      const response = await elevenLabsFetch(`/v1/convai/agents/${agentId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw response;

      const agent = await response.json();
      logger.info('Updated agent', { agentId });
      
      return successResponse(agent, requestId);
    }

    // Delete agent
    if (action === 'delete') {
      const { agentId } = await req.json();
      
      const response = await elevenLabsFetch(`/v1/convai/agents/${agentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw response;

      logger.info('Deleted agent', { agentId });
      return successResponse({ success: true }, requestId);
    }

    // Get available voices
    if (action === 'voices') {
      const response = await elevenLabsFetch('/v1/voices', {
        method: 'GET',
      });

      if (!response.ok) throw response;

      const voices = await response.json();
      return successResponse(voices, requestId);
    }

    throw new Error('Invalid action');

  } catch (error) {
    return handleError({
      functionName: 'elevenlabs-agents',
      error,
      requestId,
    });
  }
});