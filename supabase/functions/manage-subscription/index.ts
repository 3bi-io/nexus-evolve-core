import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString, validateEnum } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('manage-subscription', requestId);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    const body = await req.json();

    validateRequiredFields(body, ['action']);
    validateEnum(body.action, 'action', ['create', 'upgrade', 'cancel', 'renew']);

    const { action, tierId, billingCycle, stripeSubscriptionId } = body;

    logger.info('Managing subscription', { action, userId: user.id });

    // CREATE SUBSCRIPTION
    if (action === 'create') {
      validateRequiredFields(body, ['tierId', 'billingCycle']);
      validateString(tierId, 'tierId');
      validateEnum(billingCycle, 'billingCycle', ['monthly', 'annual']);

      // Check tier availability
      const { data: tierCheck, error: tierCheckError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('id', tierId)
        .single();

      if (tierCheckError || !tierCheck) {
        throw new Error('Invalid tier');
      }

      if (tierCheck.tier_name === 'professional_unlimited') {
        const { count: professionalCount } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('tier_id', tierId)
          .eq('is_grandfathered', true);

        if (professionalCount && professionalCount >= 100) {
          throw new Error('Founder rate slots are full');
        }
      }

      // Check existing subscription
      const { data: existing } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        throw new Error('User already has a subscription');
      }

      // Calculate renewal date
      const renewsAt = new Date();
      if (billingCycle === 'monthly') {
        renewsAt.setMonth(renewsAt.getMonth() + 1);
      } else {
        renewsAt.setFullYear(renewsAt.getFullYear() + 1);
      }

      const isFounderRate = tierCheck.tier_name === 'professional' && tierCheck.monthly_price === 29.00;
      
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          tier_id: tierId,
          credits_remaining: tierCheck.monthly_credits,
          credits_total: tierCheck.monthly_credits,
          billing_cycle: billingCycle,
          status: 'active',
          renews_at: renewsAt.toISOString(),
          stripe_subscription_id: stripeSubscriptionId,
          is_grandfathered: isFounderRate,
          original_price: isFounderRate ? 29.00 : null
        })
        .select()
        .single();

      if (subError) throw subError;

      // Log initial credit grant
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        transaction_type: 'purchase',
        credits_amount: tierCheck.monthly_credits,
        balance_after: tierCheck.monthly_credits,
        metadata: {
          tier: tierCheck.tier_name,
          billing_cycle: billingCycle,
          action: 'create'
        }
      });

      logger.info('Subscription created', { tierId, billingCycle });
      return successResponse({ subscription }, requestId);
    }

    // UPGRADE SUBSCRIPTION
    if (action === 'upgrade') {
      validateRequiredFields(body, ['tierId']);
      validateString(tierId, 'tierId');

      const { data: currentSub, error: currentError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_tiers(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (currentError || !currentSub) {
        throw new Error('No active subscription found');
      }

      const { data: newTier, error: newTierError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('id', tierId)
        .single();

      if (newTierError || !newTier) {
        throw new Error('Invalid tier');
      }

      const creditDifference = newTier.monthly_credits - currentSub.subscription_tiers.monthly_credits;
      const newCreditsRemaining = currentSub.credits_remaining + creditDifference;

      const { data: updatedSub, error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          tier_id: tierId,
          credits_remaining: newCreditsRemaining,
          credits_total: newTier.monthly_credits,
          stripe_subscription_id: stripeSubscriptionId || currentSub.stripe_subscription_id
        })
        .eq('id', currentSub.id)
        .select()
        .single();

      if (updateError) throw updateError;

      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        transaction_type: 'bonus',
        credits_amount: creditDifference,
        balance_after: newCreditsRemaining,
        metadata: {
          old_tier: currentSub.subscription_tiers.tier_name,
          new_tier: newTier.tier_name,
          action: 'upgrade'
        }
      });

      logger.info('Subscription upgraded', { newTier: newTier.tier_name });
      return successResponse({ subscription: updatedSub }, requestId);
    }

    // CANCEL SUBSCRIPTION
    if (action === 'cancel') {
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'active')
        .select()
        .single();

      if (subError) throw subError;

      logger.info('Subscription cancelled');
      return successResponse({ subscription }, requestId);
    }

    // RENEW SUBSCRIPTION (cron job)
    if (action === 'renew') {
      const { data: subscriptions, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_tiers(*)')
        .eq('status', 'active')
        .lte('renews_at', new Date().toISOString());

      if (subsError) throw subsError;

      const results = [];
      for (const sub of subscriptions || []) {
        const renewsAt = new Date(sub.renews_at);
        if (sub.billing_cycle === 'monthly') {
          renewsAt.setMonth(renewsAt.getMonth() + 1);
        } else {
          renewsAt.setFullYear(renewsAt.getFullYear() + 1);
        }

        const { data: renewed } = await supabase
          .from('user_subscriptions')
          .update({
            credits_remaining: sub.subscription_tiers.monthly_credits,
            renews_at: renewsAt.toISOString()
          })
          .eq('id', sub.id)
          .select()
          .single();

        if (renewed) {
          await supabase.from('credit_transactions').insert({
            user_id: sub.user_id,
            transaction_type: 'refill',
            credits_amount: sub.subscription_tiers.monthly_credits,
            balance_after: sub.subscription_tiers.monthly_credits,
            metadata: {
              tier: sub.subscription_tiers.tier_name,
              action: 'renew'
            }
          });
          results.push(renewed);
        }
      }

      logger.info('Subscriptions renewed', { count: results.length });
      return successResponse({ renewed: results.length }, requestId);
    }

    throw new Error('Invalid action');
  } catch (error) {
    logger.error('Subscription management failed', error);
    return handleError({ functionName: 'manage-subscription', error, requestId });
  }
});
