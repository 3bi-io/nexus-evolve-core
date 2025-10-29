import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting subscription renewal process...');

    // Find subscriptions due for renewal (renews_at <= now and status = active)
    const now = new Date().toISOString();
    const { data: dueSubscriptions, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_tiers(*)')
      .eq('status', 'active')
      .lte('renews_at', now);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${dueSubscriptions?.length || 0} subscriptions due for renewal`);

    let renewed = 0;
    let failed = 0;
    const errors: any[] = [];

    for (const subscription of dueSubscriptions || []) {
      try {
        // Calculate next renewal date based on billing cycle
        const currentRenewalDate = new Date(subscription.renews_at);
        let nextRenewalDate: Date;

        if (subscription.billing_cycle === 'monthly') {
          nextRenewalDate = new Date(currentRenewalDate);
          nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
        } else if (subscription.billing_cycle === 'yearly') {
          nextRenewalDate = new Date(currentRenewalDate);
          nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
        } else {
          throw new Error(`Invalid billing cycle: ${subscription.billing_cycle}`);
        }

        // TODO: If Stripe integration exists, process payment here
        // For now, we assume payment is successful or handled externally

        // Refill credits to tier total
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            credits_remaining: subscription.credits_total,
            renews_at: nextRenewalDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        if (updateError) {
          throw updateError;
        }

        // Log credit refill transaction
        await supabase.from('credit_transactions').insert({
          user_id: subscription.user_id,
          transaction_type: 'refill',
          credits_amount: subscription.credits_total,
          balance_after: subscription.credits_total,
          metadata: {
            renewal: true,
            tier: subscription.subscription_tiers.tier_name,
            billing_cycle: subscription.billing_cycle,
            previous_renewal: subscription.renews_at,
            next_renewal: nextRenewalDate.toISOString()
          }
        });

        console.log(`Renewed subscription ${subscription.id} for user ${subscription.user_id}`);
        renewed++;

      } catch (error) {
        console.error(`Failed to renew subscription ${subscription.id}:`, error);
        failed++;
        errors.push({
          subscription_id: subscription.id,
          user_id: subscription.user_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Mark subscription as expired if renewal fails
        await supabase
          .from('user_subscriptions')
          .update({ 
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        // TODO: Send email notification to user about failed renewal
      }
    }

    // Log the cron job execution
    await supabase.from('cron_job_logs').insert({
      job_name: 'process-subscription-renewals',
      status: failed === 0 ? 'success' : 'partial_failure',
      metrics: {
        total_checked: dueSubscriptions?.length || 0,
        renewed,
        failed,
        errors: errors.length > 0 ? errors : undefined
      }
    });

    console.log(`Renewal process complete. Renewed: ${renewed}, Failed: ${failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        renewed,
        failed,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-subscription-renewals:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
