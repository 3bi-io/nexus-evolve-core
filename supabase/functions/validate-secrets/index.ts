import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    console.log('[validate-secrets] Validating API keys for user:', user.id);

    const results: Record<string, { valid: boolean; error?: string }> = {};

    // Validate OpenAI API Key
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
          },
        });
        
        if (response.ok) {
          results.OPENAI_API_KEY = { valid: true };
        } else {
          const errorData = await response.json();
          results.OPENAI_API_KEY = { 
            valid: false, 
            error: errorData.error?.message || 'Invalid API key'
          };
        }
      } catch (error) {
        results.OPENAI_API_KEY = { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    } else {
      results.OPENAI_API_KEY = { valid: false, error: 'Not configured' };
    }

    // Validate Lovable API Key (simple check - just verify it exists and has correct format)
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (lovableKey && lovableKey.length > 20) {
      results.LOVABLE_API_KEY = { valid: true };
    } else {
      results.LOVABLE_API_KEY = { 
        valid: false, 
        error: lovableKey ? 'Invalid format' : 'Not configured'
      };
    }

    // Overall validation status
    const allValid = Object.values(results).every(r => r.valid);

    // Log validation results
    await supabase.from('evolution_logs').insert({
      user_id: user.id,
      log_type: 'system',
      description: `API Key Validation: ${allValid ? 'All keys valid' : 'Some keys invalid'}`,
      metrics: results,
      success: allValid,
    });

    return new Response(
      JSON.stringify({
        valid: allValid,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[validate-secrets] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
