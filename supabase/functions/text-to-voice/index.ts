import { corsHeaders } from '../_shared/cors.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { createLogger } from '../_shared/logger.ts';
import { requireAuth } from '../_shared/auth.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { validateRequiredFields } from '../_shared/validators.ts';
import { elevenLabsFetch } from '../_shared/api-client.ts';

interface TextToVoiceRequest {
  text: string;
  voice?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('text-to-voice', requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await requireAuth(req, supabase);
    
    logger.info('Processing text-to-speech request', { userId: user.id });

    const body: TextToVoiceRequest = await req.json();
    const { text, voice } = body;

    validateRequiredFields(body, ['text']);

    logger.debug('Converting text to speech', { 
      textLength: text.length,
      voice: voice || 'default' 
    });

    // Use ElevenLabs Turbo v2.5 for fast, high-quality text-to-speech
    const response = await elevenLabsFetch(
      `/v1/text-to-speech/${voice || '9BWtsMINqrJLrRacOk9x'}`,
      {
        method: 'POST',
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      },
      {
        timeout: 30000,
        maxRetries: 2
      }
    );

    if (!response.ok) throw response;

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    // Save to database
    await supabase.from('voice_interactions').insert({
      user_id: user.id,
      interaction_type: 'text_to_speech',
      input_text: text,
      audio_data: base64Audio.substring(0, 1000), // Store preview only
      model_used: 'eleven_turbo_v2_5',
    });

    logger.info('Text-to-speech completed', { audioSizeKB: Math.round(base64Audio.length / 1024) });

    return successResponse({ audioContent: base64Audio }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'text-to-voice',
      error,
      requestId,
    });
  }
});