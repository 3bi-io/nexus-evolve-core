import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TierName, TIERS, canAccessFeature, formatCredits } from "@/config/tiers";

interface SubscriptionState {
  // Core subscription data
  subscribed: boolean;
  tier: TierName;
  productId: string | null;
  subscriptionEnd: string | null;
  
  // Credit data from database
  creditsRemaining: number;
  creditsTotal: number;
  
  // Status
  loading: boolean;
  error: string | null;
  
  // Computed helpers
  isFreeTier: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  creditsPercentage: number;
  isLowCredits: boolean;
  formattedCreditsRemaining: string;
  formattedCreditsTotal: string;
}

interface SubscriptionContextType extends SubscriptionState {
  checkSubscription: () => Promise<void>;
  createCheckout: (priceId: string) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  canAccess: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    tier: "starter",
    productId: null,
    subscriptionEnd: null,
    creditsRemaining: 500,
    creditsTotal: 500,
    loading: true,
    error: null,
    isFreeTier: true,
    isPro: false,
    isEnterprise: false,
    creditsPercentage: 100,
    isLowCredits: false,
    formattedCreditsRemaining: "500",
    formattedCreditsTotal: "500",
  });

  const calculateComputedState = (
    tier: TierName,
    creditsRemaining: number,
    creditsTotal: number
  ) => {
    const percentage = creditsTotal > 0 ? Math.round((creditsRemaining / creditsTotal) * 100) : 0;
    return {
      isFreeTier: tier === "starter",
      isPro: tier === "professional",
      isEnterprise: tier === "enterprise",
      creditsPercentage: percentage,
      isLowCredits: percentage < 20,
      formattedCreditsRemaining: formatCredits(creditsRemaining),
      formattedCreditsTotal: formatCredits(creditsTotal),
    };
  };

  const checkSubscription = useCallback(async () => {
    if (!user) {
      const defaultTier = TIERS.starter;
      setState({
        subscribed: false,
        tier: "starter",
        productId: null,
        subscriptionEnd: null,
        creditsRemaining: defaultTier.credits,
        creditsTotal: defaultTier.credits,
        loading: false,
        error: null,
        ...calculateComputedState("starter", defaultTier.credits, defaultTier.credits),
      });
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch from both Stripe (via edge function) and database
      const [stripeResponse, dbResponse] = await Promise.all([
        supabase.functions.invoke("check-subscription"),
        supabase
          .from("user_subscriptions")
          .select(`
            credits_remaining,
            credits_total,
            billing_cycle,
            renews_at,
            status,
            subscription_tiers(tier_name)
          `)
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle(),
      ]);

      if (stripeResponse.error) throw stripeResponse.error;

      const stripeData = stripeResponse.data;
      const dbData = dbResponse.data;

      // Determine tier - prefer Stripe data as source of truth for subscription status
      let tier: TierName = "starter";
      let creditsRemaining = TIERS.starter.credits;
      let creditsTotal = TIERS.starter.credits;

      if (stripeData.subscribed) {
        // Map Stripe tier names to our TierName type
        if (stripeData.tier === "pro" || stripeData.tier === "pro_annual") {
          tier = "professional";
        } else if (stripeData.tier === "enterprise") {
          tier = "enterprise";
        }
      }

      // Use database for credit info if available
      if (dbData) {
        creditsRemaining = dbData.credits_remaining || TIERS[tier].credits;
        creditsTotal = dbData.credits_total || TIERS[tier].credits;
        
        // Also use database tier if Stripe doesn't have subscription
        if (!stripeData.subscribed && dbData.subscription_tiers) {
          const dbTier = (dbData.subscription_tiers as any).tier_name as TierName;
          if (dbTier && TIERS[dbTier]) {
            tier = dbTier;
          }
        }
      } else {
        // No database record, use tier defaults
        creditsRemaining = TIERS[tier].credits;
        creditsTotal = TIERS[tier].credits;
      }

      setState({
        subscribed: stripeData.subscribed,
        tier,
        productId: stripeData.product_id || null,
        subscriptionEnd: stripeData.subscription_end || null,
        creditsRemaining,
        creditsTotal,
        loading: false,
        error: null,
        ...calculateComputedState(tier, creditsRemaining, creditsTotal),
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to check subscription",
      }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Periodic refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const createCheckout = async (priceId: string) => {
    if (!user) {
      throw new Error("You must be logged in to subscribe");
    }

    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
    });

    if (error) throw error;
    if (!data?.url) throw new Error("No checkout URL returned");

    window.open(data.url, "_blank");
  };

  const openCustomerPortal = async () => {
    if (!user) {
      throw new Error("You must be logged in to manage subscription");
    }

    const { data, error } = await supabase.functions.invoke("customer-portal");

    if (error) throw error;
    if (!data?.url) throw new Error("No portal URL returned");

    window.open(data.url, "_blank");
  };

  const canAccess = (feature: string): boolean => {
    return canAccessFeature(state.tier, feature);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        checkSubscription,
        createCheckout,
        openCustomerPortal,
        canAccess,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscriptionContext must be used within SubscriptionProvider");
  }
  return context;
}
