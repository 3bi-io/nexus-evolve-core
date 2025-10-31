import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RouterRequest {
  task: 'text-generation' | 'text-to-image' | 'embeddings' | 'classification';
  input: string;
  model?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task, input, model } = await req.json() as RouterRequest;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Routing request:', { task, model });

    // Default model selection
    const defaultModel = model || 'google/gemini-2.5-flash';

    let result;
    let cost = 0;

    if (task === 'text-to-image') {
      // Image generation
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [
            { role: 'user', content: input }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lovable AI error:', response.status, errorText);
        throw new Error(`Lovable AI request failed: ${response.status}`);
      }

      const data = await response.json();
      result = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      cost = 0.01; // $0.01 per image
    } else {
      // Text tasks (generation, embeddings, classification)
      const systemPrompts: Record<string, string> = {
        'text-generation': 'You are a helpful AI assistant. Provide clear and concise responses.',
        'embeddings': 'Generate semantic embeddings for the input text.',
        'classification': 'Classify the sentiment of the input text as positive, negative, or neutral. Respond with just the classification and a confidence score.'
      };

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: defaultModel,
          messages: [
            { role: 'system', content: systemPrompts[task] || systemPrompts['text-generation'] },
            { role: 'user', content: input }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lovable AI error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        throw new Error(`Lovable AI request failed: ${response.status}`);
      }

      const data = await response.json();
      result = data.choices?.[0]?.message?.content;
      
      // Estimate cost based on token usage (rough estimate)
      const tokens = data.usage?.total_tokens || 100;
      cost = (tokens / 1000) * 0.001; // $0.001 per 1k tokens for Gemini Flash
    }

    return new Response(
      JSON.stringify({
        result,
        cost,
        model: task === 'text-to-image' ? 'google/gemini-2.5-flash-image' : defaultModel
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Router error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
