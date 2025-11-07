/**
 * Discover Capabilities Function
 * Analyzes user interactions to identify capability gaps and suggest new features
 */

import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { lovableAIFetch } from '../_shared/api-client.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('discover-capabilities', requestId);

  try {
    logger.info('Processing capability discovery request');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    // Analyze user interaction patterns
    const { data: interactions } = await supabase
      .from('interactions')
      .select('message, quality_rating, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!interactions || interactions.length === 0) {
      return successResponse({ 
        message: 'Not enough interaction data to discover capabilities',
        suggestions: []
      }, requestId);
    }

    logger.info('Fetched interactions', { count: interactions.length });

    // Analyze current capabilities
    const { data: existingCapabilities } = await supabase
      .from('capability_modules')
      .select('capability_name, description, usage_count')
      .eq('user_id', user.id);

    // Calculate interaction statistics
    const ratedInteractions = interactions.filter(i => i.quality_rating !== null);
    const avgRating = ratedInteractions.length > 0
      ? ratedInteractions.reduce((sum, i) => sum + (i.quality_rating || 0), 0) / ratedInteractions.length
      : 0;

    const lowRatedTopics = interactions
      .filter(i => (i.quality_rating || 0) < 0)
      .map(i => i.message);

    const messageTopics = interactions.map(i => i.message.substring(0, 200));

    logger.info('Interaction statistics calculated', { avgRating, lowRatedCount: lowRatedTopics.length });

    // AI-powered capability gap analysis
    const analysisPrompt = `Analyze these user interactions and identify capability gaps.

USER INTERACTION PATTERNS (last ${interactions.length} messages):
${messageTopics.slice(0, 20).join('\n---\n')}

CURRENT CAPABILITIES:
${existingCapabilities?.map(c => `- ${c.capability_name}: ${c.description} (used ${c.usage_count} times)`).join('\n') || 'None'}

LOW-RATED INTERACTIONS (user struggled with these):
${lowRatedTopics.slice(0, 10).join('\n---\n')}

PERFORMANCE METRICS:
- Total interactions: ${interactions.length}
- Average rating: ${(avgRating * 100 + 50).toFixed(0)}%
- Low-rated interactions: ${lowRatedTopics.length}

Identify 3-5 new capabilities that would improve this AI system based on:
1. Repeated topics/patterns in user messages
2. Areas with low satisfaction ratings
3. Emerging user needs not covered by existing capabilities
4. Knowledge gaps that cause poor responses

Return ONLY valid JSON array:
[
  {
    "capability_name": "Short descriptive name",
    "description": "What this capability does",
    "reasoning": "Why this is needed based on the data",
    "confidence_score": 0.0-1.0,
    "evidence": ["interaction example 1", "interaction example 2"]
  }
]

Focus on concrete, implementable capabilities that address real user needs.`;

    logger.info('Analyzing capability gaps with AI');

    const aiResponse = await lovableAIFetch('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a capability gap analyst. Return only valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.5,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const analysisText = aiResult.choices[0].message.content;

    // Parse suggestions
    let suggestions = [];
    try {
      const jsonMatch = analysisText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      logger.error('Failed to parse capability suggestions', e);
      suggestions = [];
    }

    logger.info('Discovered capability suggestions', { count: suggestions.length });

    // Store suggestions in database
    const newSuggestions = [];
    for (const suggestion of suggestions) {
      const { data: newSuggestion, error } = await supabase
        .from('capability_suggestions')
        .insert({
          user_id: user.id,
          capability_name: suggestion.capability_name,
          description: suggestion.description,
          reasoning: suggestion.reasoning,
          confidence_score: suggestion.confidence_score || 0.5,
          status: 'pending'
        })
        .select()
        .single();

      if (!error && newSuggestion) {
        newSuggestions.push(newSuggestion);
      }
    }

    // Log discovery event
    await supabase.from('evolution_logs').insert({
      user_id: user.id,
      log_type: 'capability_discovery',
      description: `Discovered ${suggestions.length} potential new capabilities`,
      change_type: 'auto_discovery',
      metrics: {
        suggestions_count: suggestions.length,
        interactions_analyzed: interactions.length,
        avg_user_rating: avgRating,
        existing_capabilities: existingCapabilities?.length || 0
      },
      success: true
    });

    logger.info('Capability discovery complete');

    return successResponse({
      success: true,
      suggestions: newSuggestions,
      analyzed_interactions: interactions.length,
      existing_capabilities: existingCapabilities?.length || 0
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'discover-capabilities',
      error,
      requestId
    });
  }
});
