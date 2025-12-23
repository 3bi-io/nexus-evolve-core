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

// Map Stripe product IDs to database tier names
const STRIPE_PRODUCT_TO_TIER: Record<string, { tierName: string; credits: number; billingCycle: string }> = {
  "prod_TesCNFzJKIiWJy": { tierName: "professional", credits: 10000, billingCycle: "monthly" },
  "prod_TesDcc7CpEAPyA": { tierName: "professional", credits: 10000, billingCycle: "yearly" },
  "prod_TesDFtBSqeaQL7": { tierName: "enterprise", credits: 999999, billingCycle: "monthly" },
};

async function getTierIdByName(supabase: any, tierName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("subscription_tiers")
    .select("id")
    .eq("tier_name", tierName)
    .eq("active", true)
    .single();
  
  if (error || !data) {
    logStep("Error finding tier", { tierName, error: error?.message });
    return null;
  }
  return data.id;
}

async function getUserIdByEmail(supabase: any, email: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    logStep("Error listing users", { error: error.message });
    return null;
  }
  
  const user = data.users.find((u: any) => u.email === email);
  return user?.id || null;
}

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
      logStep("Webhook signature verified");
    } else {
      // For development without webhook secret
      event = JSON.parse(body);
      logStep("WARNING", { message: "Webhook secret not configured, skipping signature verification" });
    }

    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const subscriptionId = session.subscription as string;
        
        logStep("Checkout completed", { sessionId: session.id, customerEmail, subscriptionId });
        
        if (!customerEmail || !subscriptionId) {
          logStep("Missing customer email or subscription ID");
          break;
        }

        // Get user ID from email
        const userId = await getUserIdByEmail(supabase, customerEmail);
        if (!userId) {
          logStep("User not found for email", { customerEmail });
          break;
        }

        // Fetch subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const productId = subscription.items.data[0]?.price.product as string;
        const tierMapping = STRIPE_PRODUCT_TO_TIER[productId];
        
        if (!tierMapping) {
          logStep("Unknown product ID", { productId });
          break;
        }

        // Get tier ID from database
        const tierId = await getTierIdByName(supabase, tierMapping.tierName);
        if (!tierId) {
          logStep("Tier not found in database", { tierName: tierMapping.tierName });
          break;
        }

        // Upsert user subscription
        const { error: upsertError } = await supabase
          .from("user_subscriptions")
          .upsert({
            user_id: userId,
            tier_id: tierId,
            credits_total: tierMapping.credits,
            credits_remaining: tierMapping.credits,
            billing_cycle: tierMapping.billingCycle,
            status: "active",
            started_at: new Date().toISOString(),
            renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_subscription_id: subscriptionId,
          }, { onConflict: "user_id" });

        if (upsertError) {
          logStep("Database upsert error", { error: upsertError.message });
        } else {
          logStep("Subscription activated", { userId, tierName: tierMapping.tierName });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        
        logStep("Subscription updated", { subscriptionId, status: subscription.status });

        // Find user by subscription ID
        const { data: subData } = await supabase
          .from("user_subscriptions")
          .select("user_id, tier_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (subData) {
          const productId = subscription.items.data[0]?.price.product as string;
          const tierMapping = STRIPE_PRODUCT_TO_TIER[productId];

          const updateData: any = {
            status: subscription.status === "active" ? "active" : subscription.status,
            renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
          };

          // If product changed, update tier
          if (tierMapping) {
            const newTierId = await getTierIdByName(supabase, tierMapping.tierName);
            if (newTierId) {
              updateData.tier_id = newTierId;
              updateData.credits_total = tierMapping.credits;
              updateData.billing_cycle = tierMapping.billingCycle;
            }
          }

          await supabase
            .from("user_subscriptions")
            .update(updateData)
            .eq("user_id", subData.user_id);

          logStep("Subscription updated in database", { userId: subData.user_id });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        
        logStep("Subscription canceled", { subscriptionId });

        // Get starter tier for downgrade
        const starterTierId = await getTierIdByName(supabase, "starter");
        
        const { data: subData } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (subData && starterTierId) {
          await supabase
            .from("user_subscriptions")
            .update({
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
              tier_id: starterTierId,
              credits_total: 500,
              stripe_subscription_id: null,
            })
            .eq("user_id", subData.user_id);

          logStep("User downgraded to starter", { userId: subData.user_id });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice paid", { invoiceId: invoice.id, amount: invoice.amount_paid });
        
        // Reset credits on successful payment (renewal)
        if (invoice.subscription && invoice.billing_reason === "subscription_cycle") {
          const { data: subData } = await supabase
            .from("user_subscriptions")
            .select("user_id, credits_total")
            .eq("stripe_subscription_id", invoice.subscription)
            .single();

          if (subData) {
            await supabase
              .from("user_subscriptions")
              .update({ 
                credits_remaining: subData.credits_total,
                status: "active"
              })
              .eq("user_id", subData.user_id);
            
            logStep("Credits reset on renewal", { userId: subData.user_id, credits: subData.credits_total });
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
