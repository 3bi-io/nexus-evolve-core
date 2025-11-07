import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

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

  const requestId = crypto.randomUUID();
  const logger = createLogger('validate-secrets', requestId);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);

    logger.info('Validating API keys', { userId: user.id });

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
        results.OPENAI_API_KEY = { valid: false, error: 'Network error', lastChecked: timestamp };
      }
    } else {
      results.OPENAI_API_KEY = { valid: false, error: 'Not configured', lastChecked: timestamp };
    }

    // Validate Lovable API Key
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    results.LOVABLE_API_KEY = lovableKey && lovableKey.length > 20
      ? { valid: true, lastChecked: timestamp }
      : { valid: false, error: lovableKey ? 'Invalid format' : 'Not configured', lastChecked: timestamp };

    // Validate Tavily API Key
    const tavilyKey = Deno.env.get('TAVILY_API_KEY');
    if (tavilyKey) {
      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
            model: 'google/gemini-2.5-flash-lite',
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

    // Validate HuggingFace API Key
    const huggingfaceKey = Deno.env.get('HUGGINGFACE_API_KEY');
    if (huggingfaceKey) {
      try {
        const response = await fetch('https://huggingface.co/api/whoami-v2', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${huggingfaceKey}` },
        });
        
        results.HUGGINGFACE_API_KEY = {
          valid: response.ok,
          error: response.ok ? undefined : 'Authentication failed',
          lastChecked: timestamp,
          endpoint: 'https://huggingface.co/api/whoami-v2'
        };
      } catch (error) {
        results.HUGGINGFACE_API_KEY = { valid: false, error: 'Network error', lastChecked: timestamp };
      }
    } else {
      results.HUGGINGFACE_API_KEY = { valid: false, error: 'Not configured', lastChecked: timestamp };
    }

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

    logger.info('API key validation completed', { summary });

    return successResponse(requestId, {
      valid: allValid,
      results,
      timestamp,
      summary,
    });
  } catch (error) {
    logger.error('Secrets validation failed', error);
    return handleError(error, requestId);
  }
});
