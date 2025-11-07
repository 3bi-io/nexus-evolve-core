/**
 * Extract Learnings Function
 * Analyzes conversation sessions to extract facts, topics, solutions, and patterns
 */

import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { lovableAIFetch } from '../_shared/api-client.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('extract-learnings', requestId);

  try {
    logger.info('Processing learning extraction request');

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    logger.info('User authenticated', { userId: user.id });

    // Parse and validate request body
    const body = await req.json();
    validateRequiredFields(body, ['sessionId']);
    validateString(body.sessionId, 'sessionId');

    const { sessionId } = body;

    // Fetch interactions for the session
    const { data: interactions, error: interactionsError } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (interactionsError || !interactions || interactions.length === 0) {
      throw new Error('No interactions found for this session');
    }

    logger.info('Fetched interactions', { count: interactions.length });

    // Calculate conversation quality metrics
    const ratingsGiven = interactions.filter(i => i.quality_rating !== null);
    const avgRating = ratingsGiven.length > 0 
      ? ratingsGiven.reduce((sum, i) => sum + (i.quality_rating || 0), 0) / ratingsGiven.length 
      : 3;
    
    const highQualityInteractions = interactions.filter(i => (i.quality_rating || 0) >= 4);
    const lowQualityInteractions = interactions.filter(i => i.quality_rating && i.quality_rating <= 2);

    // Build conversation text
    const conversationText = interactions
      .map(i => {
        const rating = i.quality_rating ? ` [Rating: ${i.quality_rating}/5]` : '';
        return `User: ${i.message}\nAssistant: ${i.response || '(no response)'}${rating}`;
      })
      .join('\n\n');

    // AI analysis prompt
    const analysisPrompt = `Analyze this conversation and extract intelligent learnings. Pay special attention to highly-rated interactions (4-5 stars) as they represent successful patterns.

Conversation Quality Metrics:
- Average Rating: ${avgRating.toFixed(2)}/5
- High Quality Interactions: ${highQualityInteractions.length}
- Low Quality Interactions: ${lowQualityInteractions.length}
- Total Interactions: ${interactions.length}

Conversation:
${conversationText}

Extract the following in JSON format:
{
  "facts": [
    {
      "content": "specific fact learned",
      "importance": 0.0-1.0 (higher for facts from high-rated interactions),
      "context": "why this matters"
    }
  ],
  "topics": [
    {
      "topic": "main topic discussed",
      "content": "key insights about this topic",
      "importance": 0.0-1.0,
      "tags": ["relevant", "tags"]
    }
  ],
  "solutions": [
    {
      "problem": "problem that was addressed",
      "solution": "how it was solved",
      "success_score": 0.0-1.0 (based on user rating),
      "solution_path": ["step 1", "step 2", ...],
      "reasoning_steps": ["reasoning 1", "reasoning 2", ...]
    }
  ],
  "patterns": [
    {
      "pattern_type": "communication_style|reasoning_approach|user_preference|knowledge_gap",
      "description": "pattern observed",
      "importance": 0.0-1.0,
      "evidence": "what indicates this pattern"
    }
  ],
  "user_preferences": {
    "communication_style": "observed preferences",
    "topic_interests": ["topics user engaged with"],
    "response_preferences": "what kind of responses got high ratings"
  }
}

Focus on extracting actionable patterns from high-rated interactions, identifying what makes responses successful, and documenting successful problem-solving approaches.`;

    logger.info('Analyzing conversation with AI');

    const aiResponse = await lovableAIFetch('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert at analyzing conversations and extracting meaningful learnings.' },
          { role: 'user', content: analysisPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      logger.error('AI analysis error', { status: aiResponse.status, error: errorText });
      throw new Error('Failed to analyze conversation');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }
    
    const learnings = JSON.parse(jsonMatch[0]);
    logger.info('AI analysis complete', { learnings });

    // Store learnings
    let storedCount = 0;

    // Store facts
    if (learnings.facts && Array.isArray(learnings.facts)) {
      for (const fact of learnings.facts) {
        await supabase.from('agent_memory').insert({
          user_id: user.id,
          session_id: sessionId,
          memory_type: 'fact',
          context_summary: fact.content,
          content: { 
            fact: fact.content,
            context: fact.context,
            source: 'conversation_analysis',
            session_quality: avgRating
          },
          importance_score: fact.importance || 0.5,
          metadata: { extracted_at: new Date().toISOString() }
        });
        storedCount++;
      }
    }

    // Store topics
    if (learnings.topics && Array.isArray(learnings.topics)) {
      for (const topicData of learnings.topics) {
        await supabase.from('knowledge_base').insert({
          user_id: user.id,
          topic: topicData.topic,
          content: topicData.content,
          source_type: 'conversation',
          source_reference: sessionId,
          tags: topicData.tags || [],
          importance_score: topicData.importance || 0.5,
          metadata: { 
            extracted_at: new Date().toISOString(),
            session_quality: avgRating
          }
        });
        storedCount++;
      }
    }

    // Store solutions
    if (learnings.solutions && Array.isArray(learnings.solutions)) {
      for (const solution of learnings.solutions) {
        await supabase.from('problem_solutions').insert({
          user_id: user.id,
          problem_description: solution.problem,
          solution: solution.solution,
          success_score: solution.success_score || 0.5,
          solution_path: solution.solution_path || [],
          reasoning_steps: solution.reasoning_steps || [],
          metadata: { 
            extracted_at: new Date().toISOString(),
            session_id: sessionId,
            session_quality: avgRating
          }
        });
        storedCount++;
      }
    }

    // Store patterns
    if (learnings.patterns && Array.isArray(learnings.patterns)) {
      for (const pattern of learnings.patterns) {
        await supabase.from('agent_memory').insert({
          user_id: user.id,
          session_id: sessionId,
          memory_type: pattern.pattern_type,
          context_summary: pattern.description,
          content: { 
            pattern: pattern.description,
            evidence: pattern.evidence,
            source: 'pattern_analysis',
            session_quality: avgRating
          },
          importance_score: pattern.importance || 0.5,
          metadata: { extracted_at: new Date().toISOString() }
        });
        storedCount++;
      }
    }

    // Store user preferences
    if (learnings.user_preferences) {
      await supabase.from('agent_memory').insert({
        user_id: user.id,
        session_id: sessionId,
        memory_type: 'user_preference',
        context_summary: 'User communication and response preferences',
        content: learnings.user_preferences,
        importance_score: 0.8,
        metadata: { 
          extracted_at: new Date().toISOString(),
          session_quality: avgRating
        }
      });
      storedCount++;
    }

    // Log the learning extraction
    await supabase.from('evolution_logs').insert({
      user_id: user.id,
      log_type: 'learning_extraction',
      change_type: 'knowledge_acquired',
      description: `Extracted ${storedCount} learnings from session with avg rating ${avgRating.toFixed(2)}/5`,
      metrics: {
        learnings_count: storedCount,
        session_quality: avgRating,
        high_quality_count: highQualityInteractions.length,
        low_quality_count: lowQualityInteractions.length,
        facts_extracted: learnings.facts?.length || 0,
        topics_extracted: learnings.topics?.length || 0,
        solutions_extracted: learnings.solutions?.length || 0,
        patterns_extracted: learnings.patterns?.length || 0
      },
      success: true
    });

    logger.info('Learning extraction complete', { storedCount });

    return successResponse({ 
      success: true,
      learnings_stored: storedCount,
      session_quality: avgRating,
      summary: {
        total_learnings: storedCount,
        facts: learnings.facts?.length || 0,
        topics: learnings.topics?.length || 0,
        solutions: learnings.solutions?.length || 0,
        patterns: learnings.patterns?.length || 0,
        preferences: learnings.user_preferences ? 1 : 0
      }
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'extract-learnings',
      error,
      requestId,
    });
  }
});
