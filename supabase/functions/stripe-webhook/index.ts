import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Oneiros product IDs to tier mapping
const PRODUCT_TIERS: Record<string, { tier: string; credits: number }> = {
  "prod_TesCNFzJKIiWJy": { tier: "pro", credits: 500 },
  "prod_TesDcc7CpEAPyA": { tier: "pro_annual", credits: 500 },
  "prod_TesDFtBSqeaQL7": { tier: "enterprise", credits: 10000 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!stripeKey) {
    logStep("ERROR", { message: "STRIPE_SECRET_KEY not set" });
    return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        logStep("ERROR", { message: "No stripe-signature header" });
        return new Response(JSON.stringify({ error: "No signature" }), { status: 400 });
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For development without webhook secret
      event = JSON.parse(body);
      logStep("WARNING", { message: "Webhook secret not configured, skipping signature verification" });
    }

    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        
        logStep("Checkout completed", { sessionId: session.id, userId, customerId });
        
        if (userId) {
          // Fetch subscription details
          const subscriptionId = session.subscription as string;
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const productId = subscription.items.data[0]?.price.product as string;
            const tierInfo = PRODUCT_TIERS[productId] || { tier: "pro", credits: 500 };
            
            // Update user subscription in database
            const { error: updateError } = await supabase
              .from("user_subscriptions")
              .upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                status: "active",
                tier_name: tierInfo.tier,
                credits_total: tierInfo.credits,
                credits_remaining: tierInfo.credits,
                started_at: new Date().toISOString(),
                renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
              }, { onConflict: "user_id" });

            if (updateError) {
              logStep("Database update error", { error: updateError.message });
            } else {
              logStep("Subscription activated", { userId, tier: tierInfo.tier });
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });

        // Find user by customer ID
        const { data: subData } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (subData) {
          const productId = subscription.items.data[0]?.price.product as string;
          const tierInfo = PRODUCT_TIERS[productId] || { tier: "pro", credits: 500 };

          await supabase
            .from("user_subscriptions")
            .update({
              status: subscription.status,
              tier_name: tierInfo.tier,
              renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", subData.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        logStep("Subscription canceled", { subscriptionId: subscription.id });

        const { data: subData } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (subData) {
          await supabase
            .from("user_subscriptions")
            .update({
              status: "canceled",
              tier_name: "free",
            })
            .eq("user_id", subData.user_id);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice paid", { invoiceId: invoice.id, amount: invoice.amount_paid });
        
        // Reset credits on successful payment
        if (invoice.subscription) {
          const { data: subData } = await supabase
            .from("user_subscriptions")
            .select("user_id, credits_total")
            .eq("stripe_subscription_id", invoice.subscription)
            .single();

          if (subData) {
            await supabase
              .from("user_subscriptions")
              .update({ credits_remaining: subData.credits_total })
              .eq("user_id", subData.user_id);
            
            logStep("Credits reset", { userId: subData.user_id, credits: subData.credits_total });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { invoiceId: invoice.id });
        
        if (invoice.subscription) {
          await supabase
            .from("user_subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription);
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
