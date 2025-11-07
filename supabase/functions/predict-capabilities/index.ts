/**
 * Predict Capabilities Function
 * Analyzes usage patterns to predict needed capabilities
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
  const logger = createLogger('predict-capabilities', requestId);

  try {
    logger.info('Processing capability prediction request');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    logger.info('Analyzing usage patterns');

    // Get recent interactions
    const { data: interactions } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get current capabilities
    const { data: currentCapabilities } = await supabase
      .from('capability_modules')
      .select('capability_key')
      .eq('user_id', user.id)
      .eq('enabled', true);

    const currentKeys = currentCapabilities?.map(c => c.capability_key) || [];

    // Analyze patterns using AI
    const analysisPrompt = `Analyze these user interactions and predict what capabilities they might need next:

Recent Activity:
${interactions?.slice(0, 20).map(i => `- ${i.user_query}`).join('\n')}

Current Capabilities: ${currentKeys.join(', ')}

Predict 3-5 capabilities this user is likely to need soon. For each:
1. Capability name (short, descriptive)
2. Confidence score (0.0-1.0)
3. Reasoning (why they'll need it)

Format as JSON array:
[
  {
    "capability": "capability_name",
    "confidence": 0.85,
    "reasoning": "explanation"
  }
]`;

    logger.info('Analyzing with AI');

    const aiResponse = await lovableAIFetch('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a predictive AI analyzing usage patterns.' },
          { role: 'user', content: analysisPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to analyze patterns');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const predictions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Store predictions
    const stored = [];
    for (const pred of predictions) {
      const { data, error } = await supabase
        .from('capability_predictions')
        .insert({
          user_id: user.id,
          predicted_capability: pred.capability,
          confidence_score: pred.confidence,
          reasoning: pred.reasoning,
          status: 'predicted',
        })
        .select()
        .single();

      if (!error) stored.push(data);
    }

    // Log prediction event
    await supabase.from('evolution_logs').insert({
      user_id: user.id,
      log_type: 'capability_prediction',
      description: `Predicted ${predictions.length} capabilities`,
      metadata: { predictions },
    });

    logger.info('Capability predictions complete', { count: predictions.length });

    return successResponse({
      predictions: stored,
      analyzed_interactions: interactions?.length || 0,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'predict-capabilities',
      error,
      requestId
    });
  }
});
