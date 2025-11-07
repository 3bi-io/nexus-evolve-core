import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';
import { createLogger } from '../_shared/logger.ts';
import { requireAuth } from '../_shared/auth.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { validateRequiredFields } from '../_shared/validators.ts';

function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('voice-to-text', requestId);

  try {
    const supabase = initSupabaseClient();
    const user = await requireAuth(req, supabase);
    
    logger.info('Processing speech-to-text request', { userId: user.id });

    const body = await req.json();
    const { audio } = body;
    
    validateRequiredFields(body, ['audio']);

    logger.debug('Processing audio data', { audioLength: audio.length });

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    // Send to OpenAI Whisper
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    logger.debug('Calling OpenAI Whisper API');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const result = await response.json();

    // Save to database
    await supabase.from('voice_interactions').insert({
      user_id: user.id,
      interaction_type: 'speech_to_text',
      output_text: result.text,
      model_used: 'whisper-1',
    });

    logger.info('Speech-to-text completed', { textLength: result.text.length });

    return successResponse({ text: result.text }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'voice-to-text',
      error,
      requestId,
    });
  }
});