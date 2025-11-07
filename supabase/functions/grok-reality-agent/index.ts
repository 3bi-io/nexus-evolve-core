import { performReasoning, performSearch } from './reasoning.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { xAIFetch } from '../_shared/api-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { requireAuth } from '../_shared/auth.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { validateRequiredFields } from '../_shared/validators.ts';

interface GrokRequest {
  action: 'trends' | 'sentiment' | 'generate' | 'predict' | 'reasoning' | 'search';
  topic?: string;
  content?: string;
  context?: any;
  model?: 'grok-4' | 'grok-3' | 'grok-3-mini' | 'grok-beta' | 'auto';
  searchMode?: 'auto' | 'on' | 'off';
  returnCitations?: boolean;
  returnImages?: boolean;
  sources?: Array<{ type: 'web' | 'x'; xHandles?: string[] }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('grok-reality-agent', requestId);

  try {
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      throw new Error('GROK_API_KEY not configured');
    }

    const supabase = initSupabaseClient();
    const user = await requireAuth(req, supabase);
    
    logger.info('Processing Grok request', { userId: user.id });

    const body: GrokRequest = await req.json();
    const {
      action,
      topic,
      content,
      context,
      model = 'auto',
      searchMode = 'on',
      returnCitations = true,
      returnImages = false,
      sources = [{ type: 'x', xHandles: ['applyai', 'grok', 'xai'] }, { type: 'web' }],
    } = body;

    // Auto-select model based on action
    let selectedModel = model;
    if (model === 'auto') {
      switch (action) {
        case 'reasoning':
          selectedModel = 'grok-4';
          break;
        case 'predict':
        case 'sentiment':
          selectedModel = 'grok-3';
          break;
        default:
          selectedModel = 'grok-3-mini';
      }
    }

    // Validate required fields based on action
    if (action === 'sentiment' || action === 'generate' || action === 'predict') {
      validateRequiredFields({ topic }, ['topic']);
    } else if (action === 'reasoning') {
      validateRequiredFields({ content }, ['content']);
    } else if (action === 'search') {
      validateRequiredFields({ topic }, ['topic']);
    }

    logger.info('Processing Grok action', { action, topic: topic || 'N/A', model: selectedModel });

    let result: any;

    const searchParams = {
      mode: searchMode,
      return_citations: returnCitations,
      return_images: returnImages,
      return_videos: false,
      sources,
    };

    switch (action) {
      case 'trends':
        result = await getTrendingTopics(supabase, user.id, selectedModel, searchParams, logger);
        break;
      
      case 'sentiment':
        result = await analyzeSentiment(supabase, user.id, topic!, selectedModel, searchParams, logger);
        break;
      
      case 'generate':
        result = await generateViralContent(supabase, user.id, topic!, context, selectedModel, searchParams, logger);
        break;
      
      case 'predict':
        result = await predictTrend(supabase, user.id, topic!, selectedModel, searchParams, logger);
        break;
      
      case 'reasoning':
        result = await performReasoning(grokApiKey, supabase, user.id, content!, context, selectedModel, searchParams);
        break;
      
      case 'search':
        result = await performSearch(grokApiKey, supabase, user.id, topic!, selectedModel, searchParams);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    logger.info('Grok action completed successfully', { action });
    return successResponse(result, requestId);

  } catch (error) {
    return handleError({
      functionName: 'grok-reality-agent',
      error,
      requestId,
    });
  }
});

async function getTrendingTopics(supabase: any, userId: string, model: string, searchParams: any, logger: any) {
  // Check cache first
  const { data: cached } = await supabase
    .from('social_intelligence')
    .select('*')
    .eq('user_id', userId)
    .eq('intelligence_type', 'trend')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  if (cached && cached.length > 0) {
    logger.info('Returning cached trends', { count: cached.length });
    return { trends: cached, cached: true };
  }

  logger.debug('Fetching real-time trends from Grok API');
  // Call Grok API for real-time trends
  const response = await xAIFetch('/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are Grok with real-time access to X (Twitter). Analyze current trending topics and return them as structured data with citations.'
        },
        {
          role: 'user',
          content: 'What are the top 10 trending topics right now on X/Twitter? For each topic, provide: topic name, tweet volume estimate, sentiment (positive/negative/neutral), and a brief description. Return as JSON array.'
        }
      ],
      temperature: 0.7,
      search_parameters: searchParams,
    }),
  }, {
    timeout: 60000,
    maxRetries: 2,
  });

  if (!response.ok) {
    throw response; // Will be handled by error handler
  }

  const data = await response.json();
  const trendsText = data.choices[0].message.content;
  const citations = data.citations || [];
  
  // Parse trends from Grok response
  let trends: any[];
  try {
    const jsonMatch = trendsText.match(/\[[\s\S]*\]/);
    trends = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    // Fallback parsing if JSON extraction fails
    trends = [];
  }

  // Store trends in cache with citations
  for (const trend of trends) {
    await supabase.from('social_intelligence').insert({
      user_id: userId,
      intelligence_type: 'trend',
      topic: trend.topic || trend.name || 'Unknown',
      data: trend,
      score: trend.volume || 0.5,
      metadata: { sentiment: trend.sentiment },
      citations,
      model_used: model,
      confidence_score: 0.9,
    });
  }

  logger.info('Stored trends in cache', { count: trends.length });

  return { trends, cached: false, raw: trendsText, citations, model };
}

async function analyzeSentiment(supabase: any, userId: string, topic: string, model: string, searchParams: any, logger: any) {
  // Check cache
  const { data: cached } = await supabase
    .from('social_intelligence')
    .select('*')
    .eq('user_id', userId)
    .eq('intelligence_type', 'sentiment')
    .eq('topic', topic)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (cached) {
    logger.info('Returning cached sentiment', { topic });
    return { sentiment: cached.data, cached: true };
  }

  logger.debug('Analyzing sentiment with Grok API', { topic });

  const response = await xAIFetch('/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You analyze sentiment on X (Twitter) with real-time data access. Provide detailed sentiment analysis with citations.'
        },
        {
          role: 'user',
          content: `Analyze the current sentiment around "${topic}" on X/Twitter. Provide: overall sentiment (positive/negative/neutral with %), key themes, influencer opinions, and sentiment trend (rising/falling). Return as JSON.`
        }
      ],
      temperature: 0.5,
      search_parameters: searchParams,
    }),
  }, {
    timeout: 60000,
    maxRetries: 2,
  });

  const data = await response.json();
  const sentimentText = data.choices[0].message.content;
  const citations = data.citations || [];
  
  let sentimentData: any;
  try {
    const jsonMatch = sentimentText.match(/\{[\s\S]*\}/);
    sentimentData = jsonMatch ? JSON.parse(jsonMatch[0]) : { text: sentimentText };
  } catch {
    sentimentData = { text: sentimentText };
  }

  // Store in cache with citations
  await supabase.from('social_intelligence').insert({
    user_id: userId,
    intelligence_type: 'sentiment',
    topic,
    data: sentimentData,
    score: sentimentData.positive_percentage || 0.5,
    citations,
    model_used: model,
    confidence_score: sentimentData.confidence || 0.85,
  });

  return { sentiment: sentimentData, cached: false, citations, model };
}

async function generateViralContent(supabase: any, userId: string, topic: string, context: any, model: string, searchParams: any, logger: any) {
  logger.debug('Generating viral content', { topic, style: context?.style });
  const response = await xAIFetch('/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a viral content strategist with access to real-time X (Twitter) data. Create engaging, shareable content.'
        },
        {
          role: 'user',
          content: `Create 3 viral tweet variations about "${topic}". Make them engaging, timely based on current trends, and optimized for engagement. Include relevant hashtags. ${context?.style ? `Style: ${context.style}` : ''}`
        }
      ],
      temperature: 0.9,
      search_parameters: searchParams,
    }),
  }, {
    timeout: 60000,
    maxRetries: 2,
  });

  const data = await response.json();
  const contentText = data.choices[0].message.content;

  // Store generated content
  const { data: viralContent, error } = await supabase
    .from('viral_content')
    .insert({
      user_id: userId,
      content_type: 'tweet',
      content: contentText,
      platform: 'twitter',
      generated_by: 'grok',
      metadata: { topic, context },
    })
    .select()
    .single();

  return { 
    content: contentText, 
    contentId: viralContent?.id,
    variations: contentText.split('\n\n').filter((v: string) => v.trim())
  };
}

async function predictTrend(supabase: any, userId: string, topic: string, model: string, searchParams: any, logger: any) {
  logger.debug('Predicting trend', { topic });
  const response = await xAIFetch('/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You predict trends using real-time X (Twitter) data and historical patterns.'
        },
        {
          role: 'user',
          content: `Predict the trend trajectory for "${topic}" over the next 24 hours on X/Twitter. Will it rise, peak, or decline? Provide confidence score, reasoning, and key factors. Return as JSON.`
        }
      ],
      temperature: 0.6,
      search_parameters: searchParams,
    }),
  }, {
    timeout: 60000,
    maxRetries: 2,
  });

  const data = await response.json();
  const predictionText = data.choices[0].message.content;
  
  let predictionData: any;
  try {
    const jsonMatch = predictionText.match(/\{[\s\S]*\}/);
    predictionData = jsonMatch ? JSON.parse(jsonMatch[0]) : { text: predictionText };
  } catch {
    predictionData = { text: predictionText };
  }

  // Store prediction
  const targetDate = new Date();
  targetDate.setHours(targetDate.getHours() + 24);

  await supabase.from('trend_predictions').insert({
    user_id: userId,
    topic,
    prediction_type: predictionData.trajectory || 'unknown',
    confidence_score: predictionData.confidence || 0.5,
    predicted_data: predictionData,
    target_date: targetDate.toISOString(),
  });

  return { prediction: predictionData };
}
