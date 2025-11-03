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

    const { agentId } = await req.json();

    // Verify ownership
    const { data: agent, error: agentError } = await supabase
      .from('custom_agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or unauthorized');
    }

    // Get agent's performance metrics
    const { data: analytics } = await supabase
      .from('agent_analytics_daily')
      .select('*')
      .eq('agent_id', agentId)
      .order('date', { ascending: false })
      .limit(30);

    const avgSuccessRate = analytics?.reduce((sum, day) => sum + (day.success_rate || 0), 0) / (analytics?.length || 1);
    const avgResponseTime = analytics?.reduce((sum, day) => sum + (day.avg_execution_time || 0), 0) / (analytics?.length || 1);

    const suggestions = [];

    // Temperature recommendation
    if (avgResponseTime > 5000 && agent.temperature > 0.7) {
      suggestions.push({
        suggestion_type: 'temperature',
        suggestion: 'Lower temperature to 0.5',
        reasoning: 'Your agent has slow response times. Lower temperature can improve speed while maintaining quality.',
        confidence_score: 0.8
      });
    }

    if (avgSuccessRate < 0.7 && agent.temperature < 0.5) {
      suggestions.push({
        suggestion_type: 'temperature',
        suggestion: 'Increase temperature to 0.7',
        reasoning: 'Your success rate is below average. Higher temperature can improve response creativity and problem-solving.',
        confidence_score: 0.75
      });
    }

    // Tool recommendations
    const enabledTools = agent.tools || [];
    if (!enabledTools.includes('web_search') && agent.description?.toLowerCase().includes('research')) {
      suggestions.push({
        suggestion_type: 'tools',
        suggestion: 'Enable web_search tool',
        reasoning: 'Your agent seems research-focused but doesn\'t have web search enabled.',
        confidence_score: 0.85
      });
    }

    if (!enabledTools.includes('semantic_search') && agent.knowledge_base_ids?.length > 0) {
      suggestions.push({
        suggestion_type: 'tools',
        suggestion: 'Enable semantic_search tool',
        reasoning: 'You have knowledge base content but semantic search is not enabled.',
        confidence_score: 0.9
      });
    }

    // Model recommendation
    if (avgResponseTime > 8000 && agent.model === 'claude-3-opus-20240229') {
      suggestions.push({
        suggestion_type: 'model',
        suggestion: 'Switch to claude-3-sonnet-20240229',
        reasoning: 'Sonnet is significantly faster while maintaining high quality for most tasks.',
        confidence_score: 0.85
      });
    }

    // Prompt improvement
    if (agent.system_prompt && agent.system_prompt.length < 100) {
      suggestions.push({
        suggestion_type: 'prompt',
        suggestion: 'Expand your system prompt',
        reasoning: 'Short system prompts often lead to inconsistent behavior. Add more context about the agent\'s role and capabilities.',
        confidence_score: 0.7
      });
    }

    // Store suggestions
    for (const suggestion of suggestions) {
      await supabase
        .from('agent_improvement_suggestions')
        .insert({
          agent_id: agentId,
          ...suggestion
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        suggestions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in agent-recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
