import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ValidationResult = {
  valid: boolean;
  error?: string;
  lastChecked: string;
  endpoint?: string;
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

    const results: Record<string, ValidationResult> = {};
    const timestamp = new Date().toISOString();

    // Validate OpenAI API Key
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${openaiKey}` },
        });
        
        results.OPENAI_API_KEY = {
          valid: response.ok,
          error: response.ok ? undefined : 'Authentication failed',
          lastChecked: timestamp,
          endpoint: 'https://api.openai.com/v1/models'
        };
      } catch (error) {
        results.OPENAI_API_KEY = { 
          valid: false, 
          error: 'Network error', 
          lastChecked: timestamp 
        };
      }
    } else {
      results.OPENAI_API_KEY = { valid: false, error: 'Not configured', lastChecked: timestamp };
    }

    // Validate Lovable API Key
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (lovableKey && lovableKey.length > 20) {
      results.LOVABLE_API_KEY = { valid: true, lastChecked: timestamp };
    } else {
      results.LOVABLE_API_KEY = { 
        valid: false, 
        error: lovableKey ? 'Invalid format' : 'Not configured',
        lastChecked: timestamp
      };
    }

    // Validate Tavily API Key
    const tavilyKey = Deno.env.get('TAVILY_API_KEY');
    if (tavilyKey) {
      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ api_key: tavilyKey, query: 'test', max_results: 1 })
        });
        
        results.TAVILY_API_KEY = {
          valid: response.ok,
          error: response.ok ? undefined : 'Authentication failed',
          lastChecked: timestamp,
          endpoint: 'https://api.tavily.com/search'
        };
      } catch (error) {
        results.TAVILY_API_KEY = { valid: false, error: 'Network error', lastChecked: timestamp };
      }
    } else {
      results.TAVILY_API_KEY = { valid: false, error: 'Not configured', lastChecked: timestamp };
    }

    // Validate Anthropic API Key
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (anthropicKey) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        
        results.ANTHROPIC_API_KEY = {
          valid: response.status === 200 || response.status === 400,
          error: (response.status === 200 || response.status === 400) ? undefined : 'Authentication failed',
          lastChecked: timestamp,
          endpoint: 'https://api.anthropic.com/v1/messages'
        };
      } catch (error) {
        results.ANTHROPIC_API_KEY = { valid: false, error: 'Network error', lastChecked: timestamp };
      }
    } else {
      results.ANTHROPIC_API_KEY = { valid: false, error: 'Not configured', lastChecked: timestamp };
    }

    // Validate Replicate API Key
    const replicateKey = Deno.env.get('REPLICATE_API_KEY');
    if (replicateKey) {
      try {
        const response = await fetch('https://api.replicate.com/v1/models', {
          method: 'GET',
          headers: { 'Authorization': `Token ${replicateKey}` },
        });
        
        results.REPLICATE_API_KEY = {
          valid: response.ok,
          error: response.ok ? undefined : 'Authentication failed',
          lastChecked: timestamp,
          endpoint: 'https://api.replicate.com/v1/models'
        };
      } catch (error) {
        results.REPLICATE_API_KEY = { valid: false, error: 'Network error', lastChecked: timestamp };
      }
    } else {
      results.REPLICATE_API_KEY = { valid: false, error: 'Not configured', lastChecked: timestamp };
    }

    // Validate Mem0 API Key
    const mem0Key = Deno.env.get('MEM0_API_KEY');
    if (mem0Key) {
      try {
        const response = await fetch('https://api.mem0.ai/v1/memories/', {
          method: 'GET',
          headers: { 'Authorization': `Token ${mem0Key}` },
        });
        
        results.MEM0_API_KEY = {
          valid: response.ok,
          error: response.ok ? undefined : 'Authentication failed',
          lastChecked: timestamp,
          endpoint: 'https://api.mem0.ai/v1/memories/'
        };
      } catch (error) {
        results.MEM0_API_KEY = { valid: false, error: 'Network error', lastChecked: timestamp };
      }
    } else {
      results.MEM0_API_KEY = { valid: false, error: 'Not configured', lastChecked: timestamp };
    }

    // Validate Pinecone API Key & Host
    const pineconeKey = Deno.env.get('PINECONE_API_KEY');
    const pineconeHost = Deno.env.get('PINECONE_HOST');
    
    if (pineconeKey && pineconeHost) {
      try {
        const response = await fetch(`${pineconeHost}/describe_index_stats`, {
          method: 'POST',
          headers: { 
            'Api-Key': pineconeKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        });
        
        results.PINECONE_API_KEY = {
          valid: response.ok,
          error: response.ok ? undefined : 'Authentication failed',
          lastChecked: timestamp,
          endpoint: `${pineconeHost}/describe_index_stats`
        };
      } catch (error) {
        results.PINECONE_API_KEY = { valid: false, error: 'Network error', lastChecked: timestamp };
      }
    } else {
      results.PINECONE_API_KEY = { 
        valid: false, 
        error: !pineconeKey ? 'API key not configured' : 'Host not configured',
        lastChecked: timestamp 
      };
    }

    results.PINECONE_HOST = pineconeHost 
      ? { valid: true, lastChecked: timestamp }
      : { valid: false, error: 'Not configured', lastChecked: timestamp };

    // Calculate summary
    const allResults = Object.values(results);
    const summary = {
      total: allResults.length,
      valid: allResults.filter(r => r.valid).length,
      invalid: allResults.filter(r => !r.valid && r.error !== 'Not configured').length,
      notConfigured: allResults.filter(r => r.error === 'Not configured').length,
    };

    const allValid = summary.valid === summary.total;

    // Log validation results
    await supabase.from('evolution_logs').insert({
      user_id: user.id,
      log_type: 'system',
      description: `API Key Validation: ${summary.valid}/${summary.total} valid`,
      metrics: { results, summary },
      success: allValid,
    });

    return new Response(
      JSON.stringify({
        valid: allValid,
        results,
        timestamp,
        summary,
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
