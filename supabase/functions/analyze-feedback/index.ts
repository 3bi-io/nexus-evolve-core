/**
 * Analyze Feedback Function
 * Analyzes user feedback from interactions to identify adaptive behavioral patterns
 */

import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateNumber } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { lovableAIFetch } from '../_shared/api-client.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('analyze-feedback', requestId);

  try {
    logger.info('Processing feedback analysis request');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const { timeframe = 30 } = body;
    validateNumber(timeframe, 'timeframe', { min: 1, max: 365 });

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframe);

    logger.info('Fetching rated interactions', { timeframe, cutoffDate: cutoffDate.toISOString() });

    // Fetch rated interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', user.id)
      .not('quality_rating', 'is', null)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (interactionsError) throw interactionsError;

    if (!interactions || interactions.length === 0) {
      return successResponse({ 
        message: 'No rated interactions to analyze', 
        behaviors_created: 0 
      }, requestId);
    }

    // Separate positive and negative interactions
    const positiveInteractions = interactions.filter(i => (i.quality_rating || 0) > 0);
    const negativeInteractions = interactions.filter(i => (i.quality_rating || 0) < 0);

    logger.info('Categorized interactions', { 
      positive: positiveInteractions.length, 
      negative: negativeInteractions.length 
    });

    // Prepare analysis prompt
    const analysisPrompt = `Analyze these user interactions and extract behavioral patterns that will improve AI responses.

HIGH-RATED INTERACTIONS (User liked these - ${positiveInteractions.length} total):
${positiveInteractions.slice(0, 10).map(i => 
  `Rating: ${i.quality_rating}\nUser: ${i.message}\nAssistant: ${i.response?.substring(0, 500)}...`
).join('\n---\n')}

LOW-RATED INTERACTIONS (User disliked these - ${negativeInteractions.length} total):
${negativeInteractions.slice(0, 10).map(i => 
  `Rating: ${i.quality_rating}\nUser: ${i.message}\nAssistant: ${i.response?.substring(0, 500)}...`
).join('\n---\n')}

Extract actionable behavioral patterns in JSON format. Return an array of behaviors with:
- behavior_type: one of ['response_style', 'reasoning_pattern', 'topic_focus', 'communication_preference', 'context_usage', 'capability_preference']
- description: Clear instruction for how AI should behave (e.g., "Keep technical responses concise with code examples")
- effectiveness_score: 0.0-1.0 based on consistency of pattern (higher rating count = higher score)
- created_from: 'positive_feedback' or 'negative_feedback'
- sample_ids: array of interaction IDs that support this pattern

Focus on response style preferences, reasoning patterns, topics, and communication preferences.

Return ONLY valid JSON array of behaviors.`;

    logger.info('Analyzing patterns with AI');

    const aiResponse = await lovableAIFetch('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a behavioral pattern analyst. Extract actionable AI behavior improvements from user feedback.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      logger.error('AI analysis error', { status: aiResponse.status, error: errorText });
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const analysisText = aiResult.choices[0].message.content;
    
    // Extract JSON from response
    let behaviors = [];
    try {
      const jsonMatch = analysisText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        behaviors = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      logger.error('Failed to parse AI response', e);
      throw new Error('AI returned invalid JSON');
    }

    logger.info('Extracted behavioral patterns', { count: behaviors.length });

    // Store adaptive behaviors
    let behaviorsCreated = 0;
    let behaviorsUpdated = 0;
    const newBehaviorIds = [];

    for (const behavior of behaviors) {
      // Check if similar behavior exists
      const { data: existing } = await supabase
        .from('adaptive_behaviors')
        .select('id, effectiveness_score, application_count')
        .eq('user_id', user.id)
        .eq('behavior_type', behavior.behavior_type)
        .ilike('description', `%${behavior.description.substring(0, 30)}%`)
        .single();

      if (existing) {
        // Update existing behavior with weighted average
        const newScore = (existing.effectiveness_score * 0.7) + (behavior.effectiveness_score * 0.3);
        await supabase
          .from('adaptive_behaviors')
          .update({
            effectiveness_score: newScore,
            sample_interaction_ids: behavior.sample_ids || [],
            metadata: { last_analysis: new Date().toISOString(), ...behavior.metadata }
          })
          .eq('id', existing.id);
        behaviorsUpdated++;
      } else {
        // Create new behavior
        const { data: newBehavior, error: insertError } = await supabase
          .from('adaptive_behaviors')
          .insert({
            user_id: user.id,
            behavior_type: behavior.behavior_type,
            description: behavior.description,
            effectiveness_score: behavior.effectiveness_score,
            created_from: behavior.created_from,
            sample_interaction_ids: behavior.sample_ids || [],
            metadata: { analysis_date: new Date().toISOString() }
          })
          .select()
          .single();

        if (!insertError && newBehavior) {
          newBehaviorIds.push(newBehavior.id);
          behaviorsCreated++;
        }
      }
    }

    // Deactivate low-performing behaviors
    const { data: lowPerformers } = await supabase
      .from('adaptive_behaviors')
      .select('id')
      .eq('user_id', user.id)
      .eq('active', true)
      .lt('effectiveness_score', 0.3)
      .gt('application_count', 5);

    let behaviorsDeactivated = 0;
    if (lowPerformers && lowPerformers.length > 0) {
      await supabase
        .from('adaptive_behaviors')
        .update({ active: false })
        .in('id', lowPerformers.map(b => b.id));
      behaviorsDeactivated = lowPerformers.length;
    }

    // Log evolution
    await supabase.from('evolution_logs').insert({
      user_id: user.id,
      log_type: 'behavior_analysis',
      description: `Analyzed ${interactions.length} interactions and updated adaptive behaviors`,
      change_type: 'behavior_modified',
      metrics: {
        interactions_analyzed: interactions.length,
        positive_interactions: positiveInteractions.length,
        negative_interactions: negativeInteractions.length,
        behaviors_created: behaviorsCreated,
        behaviors_updated: behaviorsUpdated,
        behaviors_deactivated: behaviorsDeactivated,
        timeframe_days: timeframe
      },
      success: true
    });

    logger.info('Analysis complete', { created: behaviorsCreated, updated: behaviorsUpdated, deactivated: behaviorsDeactivated });

    return successResponse({
      success: true,
      message: `Analyzed ${interactions.length} interactions`,
      behaviors_created: behaviorsCreated,
      behaviors_updated: behaviorsUpdated,
      behaviors_deactivated: behaviorsDeactivated,
      new_behavior_ids: newBehaviorIds
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'analyze-feedback',
      error,
      requestId
    });
  }
});
