import { corsHeaders } from '../_shared/cors.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { createLogger } from '../_shared/logger.ts';
import { optionalAuth } from '../_shared/auth.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { validateRequiredFields } from '../_shared/validators.ts';
import { lovableAIFetch } from '../_shared/api-client.ts';

interface GenerateImageRequest {
  prompt: string;
  style?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('generate-image', requestId);
  const startTime = Date.now();

  try {
    const supabase = initSupabaseClient();
    const user = await optionalAuth(req, supabase);
    const isAnonymous = !user;

    const body: GenerateImageRequest = await req.json();
    validateRequiredFields(body, ['prompt']);
    const { prompt, style } = body;

    logger.info('Generating image', { 
      userId: user?.id || 'anonymous',
      isAnonymous,
      promptPreview: prompt.substring(0, 100) 
    });

    // Enhance prompt with style if provided
    const enhancedPrompt = style 
      ? `${prompt}. Style: ${style}. Ultra high resolution, professional quality.`
      : `${prompt}. Ultra high resolution, professional quality.`;

    // Use Lovable AI Gateway for image generation
    const response = await lovableAIFetch('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt,
          }
        ],
        modalities: ['image', 'text'],
      }),
    }, {
      timeout: 60000, // 60s for image generation
      maxRetries: 2,
    });

    if (!response.ok) {
      logger.error('AI API error', { status: response.status });
      throw response;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    const generationTime = Date.now() - startTime;

    // Save to database only for authenticated users
    let savedImage = null;
    if (!isAnonymous) {
      const { data, error: dbError } = await supabase
        .from('generated_images')
        .insert({
          user_id: user.id,
          prompt,
          image_data: imageUrl,
          model_used: 'google/gemini-2.5-flash-image-preview',
          generation_time_ms: generationTime,
          metadata: { style: style || null },
        })
        .select()
        .single();

      if (dbError) {
        logger.error('Database error', dbError);
      } else {
        savedImage = data;
      }
    }

    logger.info('Image generated successfully', { generationTime, imageId: savedImage?.id });

    return successResponse({
      image: imageUrl,
      id: savedImage?.id,
      generationTime,
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'generate-image',
      error,
      requestId,
      userId: undefined,
    });
  }
});
