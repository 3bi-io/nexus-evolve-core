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
  const logger = createLogger('get-elevenlabs-signed-url', requestId);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    const body = await req.json();

    validateRequiredFields(body, ['agentId']);
    validateString(body.agentId, 'agentId');

    const { agentId } = body;

    logger.info('Getting signed URL for agent', { agentId, userId: user.id });

    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsKey) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    // Get signed URL from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('ElevenLabs API error', { status: response.status, error: errorText });
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();

    logger.info('Signed URL obtained successfully', { agentId });

    return successResponse({ signedUrl: data.signed_url }, requestId);
  } catch (error) {
    logger.error('Failed to get signed URL', error);
    return handleError({ functionName: 'get-elevenlabs-signed-url', error, requestId });
  }
});
