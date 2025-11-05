import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, conversationId, agentId, messages, title } = await req.json();

    switch (action) {
      case 'save': {
        const { data, error } = await supabase
          .from('agent_conversations')
          .upsert({
            id: conversationId,
            agent_id: agentId,
            user_id: user.id,
            title,
            messages,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Auto-generate title if not provided and we have messages
        if (!title && messages.length >= 2) {
          const firstMessages = messages.slice(0, 3);
          const prompt = `Generate a short, descriptive title (max 6 words) for this conversation:\n\n${JSON.stringify(firstMessages)}`;
          
          const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
          if (anthropicKey) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash-lite',
                max_tokens: 50,
                messages: [{ role: 'user', content: prompt }]
              })
            });

            if (response.ok) {
              const result = await response.json();
              const generatedTitle = result.content[0].text.trim();
              
              await supabase
                .from('conversation_titles')
                .upsert({
                  conversation_id: data.id,
                  auto_generated_title: generatedTitle
                });

              data.title = generatedTitle;
            }
          }
        }

        return new Response(JSON.stringify({ success: true, conversation: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'load': {
        const { data, error } = await supabase
          .from('agent_conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, conversation: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'list': {
        const { data, error } = await supabase
          .from('agent_conversations')
          .select('*')
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .order('updated_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, conversations: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'delete': {
        const { error } = await supabase
          .from('agent_conversations')
          .delete()
          .eq('id', conversationId)
          .eq('user_id', user.id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'search': {
        const { query } = await req.json();
        const { data, error } = await supabase
          .from('agent_conversations')
          .select('*')
          .eq('user_id', user.id)
          .or(`title.ilike.%${query}%,messages::text.ilike.%${query}%`)
          .order('updated_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, conversations: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in manage-conversation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
