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

    const { agentId, document, title } = await req.json();

    // Verify ownership
    const { data: agent, error: agentError } = await supabase
      .from('custom_agents')
      .select('id')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or unauthorized');
    }

    // Chunk the document (500 words per chunk)
    const words = document.split(/\s+/);
    const chunks = [];
    const chunkSize = 500;
    
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }

    console.log(`Processing ${chunks.length} chunks for document: ${title}`);

    // Store each chunk in knowledge_base
    const knowledgeIds = [];
    for (let i = 0; i < chunks.length; i++) {
      const { data: kb, error: kbError } = await supabase
        .from('knowledge_base')
        .insert({
          user_id: user.id,
          content: chunks[i],
          metadata: {
            title,
            chunk: i + 1,
            total_chunks: chunks.length,
            agent_id: agentId
          }
        })
        .select()
        .single();

      if (kbError) {
        console.error('Error inserting knowledge chunk:', kbError);
        continue;
      }

      knowledgeIds.push(kb.id);

      // Link to agent
      await supabase
        .from('agent_knowledge_links')
        .insert({
          agent_id: agentId,
          knowledge_id: kb.id
        });

      // Generate embeddings
      try {
        await fetch(`${supabaseUrl}/functions/v1/generate-embeddings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contentId: kb.id,
            content: chunks[i]
          })
        });
      } catch (embError) {
        console.error('Error generating embeddings:', embError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Document uploaded and processed into ${chunks.length} chunks`,
        knowledgeIds
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in upload-agent-document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
