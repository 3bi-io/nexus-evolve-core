import { corsHeaders } from '../_shared/cors.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { createLogger } from '../_shared/logger.ts';
import { requireAuth } from '../_shared/auth.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { validateRequiredFields } from '../_shared/validators.ts';
import { anthropicFetch } from '../_shared/api-client.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('manage-conversation', requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await requireAuth(req, supabase);

    const { action, conversationId, agentId, messages, title } = await req.json();
    validateRequiredFields({ action }, ['action']);

    logger.info('Conversation action', { action, userId: user.id, conversationId });

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
          try {
            const firstMessages = messages.slice(0, 3);
            const prompt = `Generate a short, descriptive title (max 6 words) for this conversation:\n\n${JSON.stringify(firstMessages)}`;
            
            const response = await anthropicFetch('/v1/messages', {
              method: 'POST',
              body: JSON.stringify({
                model: 'claude-sonnet-4-5',
                max_tokens: 50,
                system: 'You are a helpful assistant that generates concise conversation titles.',
                messages: [{ role: 'user', content: prompt }]
              })
            });

            if (response.ok) {
              const result = await response.json();
              
              if (result?.content?.[0]?.text) {
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
          } catch (error) {
            console.error('Error generating title:', error);
            // Continue without title if generation fails
          }
        }

        return successResponse({ success: true, conversation: data }, requestId);
      }

      case 'load': {
        const { data, error } = await supabase
          .from('agent_conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        return successResponse({ success: true, conversation: data }, requestId);
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

        return successResponse({ success: true, conversations: data }, requestId);
      }

      case 'delete': {
        const { error } = await supabase
          .from('agent_conversations')
          .delete()
          .eq('id', conversationId)
          .eq('user_id', user.id);

        if (error) throw error;

        return successResponse({ success: true }, requestId);
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

        return successResponse({ success: true, conversations: data }, requestId);
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    return handleError({
      functionName: 'manage-conversation',
      error,
      requestId,
      userId: undefined,
    });
  }
});
