import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { xAIFetch } from "../_shared/api-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GROK_API_KEY = Deno.env.get('GROK_API_KEY');

interface ChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  search?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for optional auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Optional authentication - allow anonymous users
    let user = null;
    let isAnonymous = false;
    
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabaseClient.auth.getUser();
      
      if (!authError && authUser) {
        user = authUser;
      } else {
        isAnonymous = true;
      }
    } catch {
      isAnonymous = true;
    }

    if (!GROK_API_KEY) {
      console.error('GROK_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'xAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      messages,
      model = 'grok-beta',
      temperature = 0.7,
      max_tokens = 2000,
      stream = false,
      search = false
    } = await req.json() as ChatRequest;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`xAI Chat request:`, {
      userId: user?.id || 'anonymous',
      isAnonymous,
      model,
      messageCount: messages.length,
      stream,
      search
    });

    // Prepare request body
    const requestBody: any = {
      model,
      messages,
      temperature,
      max_tokens,
      stream
    };

    // Add search parameters if enabled
    if (search) {
      requestBody.search_parameters = {
        mode: 'auto',
        max_search_results: 5
      };
    }

    // Make request to xAI API
    const response = await xAIFetch('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    }, {
      timeout: 60000,
      maxRetries: 2,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `xAI API error: ${response.statusText}`,
          details: errorText 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle streaming response
    if (stream) {
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle non-streaming response
    const data = await response.json();
    
    // Log usage for analytics (only for authenticated users)
    if (!isAnonymous && user) {
      console.log('xAI Chat completion:', {
        userId: user.id,
        model,
        usage: data.usage,
        hasSearch: search
      });
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in xai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
