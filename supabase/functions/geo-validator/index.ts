// Geographic Risk Validator Edge Function
// Validates IP addresses against geographic risk lists

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/cors.ts';
import { performSecurityCheck } from '../_shared/advanced-security.ts';

interface GeoValidationRequest {
  ipAddress?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { ipAddress }: GeoValidationRequest = await req.json();
    
    // Get IP from request if not provided
    const ip = ipAddress || 
               req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown';

    // Perform security check with geographic validation
    const securityCheck = await performSecurityCheck(req, supabase, {
      checkGeo: true,
      checkBot: false,
      checkBruteForce: false
    });

    return new Response(
      JSON.stringify({
        allowed: securityCheck.allowed,
        riskLevel: securityCheck.riskLevel,
        countryCode: securityCheck.countryCode,
        reason: securityCheck.reason,
        requiresVerification: securityCheck.riskLevel === 'high' || securityCheck.riskLevel === 'medium'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: securityCheck.allowed ? 200 : 403
      }
    );
  } catch (error) {
    console.error('Geo validation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Validation failed',
        allowed: true, // Fail open for availability
        riskLevel: 'low'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
