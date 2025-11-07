import { corsHeaders } from '../_shared/cors.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('process-referral-conversion', requestId);

  try {
    const supabase = initSupabaseClient();
    const body = await req.json();

    validateRequiredFields(body, ['userId']);
    validateString(body.userId, 'userId');

    const { userId } = body;

    logger.info('Processing referral conversion', { userId });

    // Check if user has sufficient activity (3+ interactions)
    const { count: interactionCount } = await supabase
      .from('interactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (!interactionCount || interactionCount < 3) {
      logger.info('Insufficient activity for conversion', { userId, interactions: interactionCount });
      return successResponse({ 
        converted: false, 
        reason: 'Insufficient activity' 
      }, requestId);
    }

    // Find referral for this user
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('id, referrer_id, status')
      .eq('referred_user_id', userId)
      .eq('status', 'signed_up')
      .single();

    if (referralError || !referral) {
      logger.info('No pending referral found', { userId });
      return successResponse({ 
        converted: false, 
        reason: 'No pending referral found' 
      }, requestId);
    }

    // Update referral to converted
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ 
        status: 'converted',
        converted_at: new Date().toISOString()
      })
      .eq('id', referral.id);

    if (updateError) throw updateError;

    // Give referrer bonus 50 credits for conversion
    const { error: rewardError } = await supabase
      .from('referral_rewards')
      .insert({
        user_id: referral.referrer_id,
        referral_id: referral.id,
        reward_type: 'credits',
        reward_value: 50
      });

    if (rewardError) throw rewardError;

    logger.info('Referral converted successfully', { userId, referralId: referral.id });

    return successResponse({ 
      converted: true,
      referralId: referral.id
    }, requestId);
  } catch (error) {
    logger.error('Referral conversion failed', error);
    return handleError({ functionName: 'process-referral-conversion', error, requestId });
  }
});
