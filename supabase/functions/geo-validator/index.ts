import { corsHeaders } from '../_shared/cors.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { handleError } from '../_shared/error-handler.ts';
import { performSecurityCheck } from '../_shared/advanced-security.ts';

interface GeoValidationRequest {
  ipAddress?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('geo-validator', requestId);

  try {
    const supabase = initSupabaseClient();
    const body: GeoValidationRequest = await req.json();
    
    // Get IP from request if not provided
    const ip = body.ipAddress || 
               req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';

    logger.info('Validating geographic location', { ip });

    // Perform security check with geographic validation
    const securityCheck = await performSecurityCheck(req, supabase, {
      checkGeo: true,
      checkBot: false,
      checkBruteForce: false
    });

    const requiresVerification = securityCheck.riskLevel === 'high' || securityCheck.riskLevel === 'medium';

    logger.info('Geographic validation completed', { 
      allowed: securityCheck.allowed, 
      riskLevel: securityCheck.riskLevel,
      countryCode: securityCheck.countryCode 
    });

    return new Response(
      JSON.stringify({
        allowed: securityCheck.allowed,
        riskLevel: securityCheck.riskLevel,
        countryCode: securityCheck.countryCode,
        reason: securityCheck.reason,
        requiresVerification,
        requestId,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: securityCheck.allowed ? 200 : 403
      }
    );
  } catch (error) {
    logger.error('Geo validation error', error);
    // Fail open for availability
    return new Response(
      JSON.stringify({ 
        error: 'Validation failed',
        allowed: true,
        riskLevel: 'low',
        requestId,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
