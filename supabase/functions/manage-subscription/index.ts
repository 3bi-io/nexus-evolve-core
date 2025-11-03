import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, tierId, billingCycle, stripeSubscriptionId } = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CREATE SUBSCRIPTION
    if (action === 'create') {
      if (!tierId || !billingCycle) {
        return new Response(
          JSON.stringify({ error: 'tierId and billingCycle are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Phase 6.1: Check if professional_unlimited tier (for founder rate validation)
      const { data: tierCheck, error: tierCheckError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('id', tierId)
        .single();

      if (tierCheckError || !tierCheck) {
        return new Response(
          JSON.stringify({ error: 'Invalid tier' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (tierCheck.tier_name === 'professional_unlimited') {
        // Check if founder slots are still available (first 100 users)
        const { count: professionalCount } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('tier_id', tierId)
          .eq('is_grandfathered', true);

        if (professionalCount && professionalCount >= 100) {
          return new Response(
            JSON.stringify({ 
              error: 'Founder rate slots are full. Please select the standard Professional tier.',
              founder_slots_full: true
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Check if user already has a subscription
      const { data: existing } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        return new Response(
          JSON.stringify({ error: 'User already has a subscription. Use upgrade or cancel first.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate renewal date
      const renewsAt = new Date();
      if (billingCycle === 'monthly') {
        renewsAt.setMonth(renewsAt.getMonth() + 1);
      } else {
        renewsAt.setFullYear(renewsAt.getFullYear() + 1);
      }

      // Phase 6.2: Create subscription with grandfathering support
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

      if (subError) {
        throw subError;
      }

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

      return new Response(
        JSON.stringify({ success: true, subscription }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // UPGRADE SUBSCRIPTION
    if (action === 'upgrade') {
      if (!tierId) {
        return new Response(
          JSON.stringify({ error: 'tierId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get current subscription
      const { data: currentSub, error: currentError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_tiers(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (currentError || !currentSub) {
        return new Response(
          JSON.stringify({ error: 'No active subscription found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get new tier
      const { data: newTier, error: newTierError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('id', tierId)
        .single();

      if (newTierError || !newTier) {
        return new Response(
          JSON.stringify({ error: 'Invalid tier' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate prorated credits
      const creditDifference = newTier.monthly_credits - currentSub.subscription_tiers.monthly_credits;
      const newCreditsRemaining = currentSub.credits_remaining + creditDifference;

      // Update subscription
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

      if (updateError) {
        throw updateError;
      }

      // Log credit adjustment
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

      return new Response(
        JSON.stringify({ success: true, subscription: updatedSub }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

      if (subError) {
        throw subError;
      }

      return new Response(
        JSON.stringify({ success: true, subscription }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // RENEW SUBSCRIPTION (called by cron)
    if (action === 'renew') {
      const { data: subscriptions, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_tiers(*)')
        .eq('status', 'active')
        .lte('renews_at', new Date().toISOString());

      if (subsError) {
        throw subsError;
      }

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

      return new Response(
        JSON.stringify({ success: true, renewed: results.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in manage-subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
