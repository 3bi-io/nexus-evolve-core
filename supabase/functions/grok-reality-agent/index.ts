import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GrokRequest {
  action: 'trends' | 'sentiment' | 'generate' | 'predict';
  topic?: string;
  content?: string;
  context?: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const grokApiKey = Deno.env.get('GROK_API_KEY');

    if (!grokApiKey) {
      throw new Error('GROK_API_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: GrokRequest = await req.json();
    const { action, topic, content, context } = body;

    console.log('Grok Reality Agent request:', { action, topic, user: user.id });

    let result: any;

    switch (action) {
      case 'trends':
        result = await getTrendingTopics(grokApiKey, supabase, user.id);
        break;
      
      case 'sentiment':
        if (!topic) throw new Error('Topic required for sentiment analysis');
        result = await analyzeSentiment(grokApiKey, supabase, user.id, topic);
        break;
      
      case 'generate':
        if (!topic) throw new Error('Topic required for content generation');
        result = await generateViralContent(grokApiKey, supabase, user.id, topic, context);
        break;
      
      case 'predict':
        if (!topic) throw new Error('Topic required for prediction');
        result = await predictTrend(grokApiKey, supabase, user.id, topic);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Grok Reality Agent error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getTrendingTopics(apiKey: string, supabase: any, userId: string) {
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
    console.log('Returning cached trends');
    return { trends: cached, cached: true };
  }

  // Call Grok API for real-time trends
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-3-20260418',
      messages: [
        {
          role: 'system',
          content: 'You are Grok with real-time access to X (Twitter). Analyze current trending topics and return them as structured data.'
        },
        {
          role: 'user',
          content: 'What are the top 10 trending topics right now on X/Twitter? For each topic, provide: topic name, tweet volume estimate, sentiment (positive/negative/neutral), and a brief description. Return as JSON array.'
        }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Grok API error:', response.status, errorText);
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  const trendsText = data.choices[0].message.content;
  
  // Parse trends from Grok response
  let trends: any[];
  try {
    const jsonMatch = trendsText.match(/\[[\s\S]*\]/);
    trends = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    // Fallback parsing if JSON extraction fails
    trends = [];
  }

  // Store trends in cache
  for (const trend of trends) {
    await supabase.from('social_intelligence').insert({
      user_id: userId,
      intelligence_type: 'trend',
      topic: trend.topic || trend.name || 'Unknown',
      data: trend,
      score: trend.volume || 0.5,
      metadata: { sentiment: trend.sentiment },
    });
  }

  console.log(`Stored ${trends.length} trends in cache`);

  return { trends, cached: false, raw: trendsText };
}

async function analyzeSentiment(apiKey: string, supabase: any, userId: string, topic: string) {
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
    console.log('Returning cached sentiment');
    return { sentiment: cached.data, cached: true };
  }

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-3-20260418',
      messages: [
        {
          role: 'system',
          content: 'You analyze sentiment on X (Twitter) with real-time data access. Provide detailed sentiment analysis.'
        },
        {
          role: 'user',
          content: `Analyze the current sentiment around "${topic}" on X/Twitter. Provide: overall sentiment (positive/negative/neutral with %), key themes, influencer opinions, and sentiment trend (rising/falling). Return as JSON.`
        }
      ],
      temperature: 0.5,
    }),
  });

  const data = await response.json();
  const sentimentText = data.choices[0].message.content;
  
  let sentimentData: any;
  try {
    const jsonMatch = sentimentText.match(/\{[\s\S]*\}/);
    sentimentData = jsonMatch ? JSON.parse(jsonMatch[0]) : { text: sentimentText };
  } catch {
    sentimentData = { text: sentimentText };
  }

  // Store in cache
  await supabase.from('social_intelligence').insert({
    user_id: userId,
    intelligence_type: 'sentiment',
    topic,
    data: sentimentData,
    score: sentimentData.positive_percentage || 0.5,
  });

  return { sentiment: sentimentData, cached: false };
}

async function generateViralContent(apiKey: string, supabase: any, userId: string, topic: string, context: any) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-3-20260418',
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
    }),
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

async function predictTrend(apiKey: string, supabase: any, userId: string, topic: string) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-3-20260418',
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
    }),
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
