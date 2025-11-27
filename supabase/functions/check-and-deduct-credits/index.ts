import { corsHeaders } from '../_shared/cors.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { createLogger } from '../_shared/logger.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('check-and-deduct-credits', requestId);

  try {
    logger.info('Everything is free - always allowing access');

    // Everything is free - always return unlimited access
    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: 999999,
        creditCost: 0,
        unlimited: true,
        isAnonymous: false,
        message: 'All features are free - unlimited access'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return handleError({
      functionName: 'check-and-deduct-credits',
      error,
      requestId,
      userId: undefined,
    });
  }
});
