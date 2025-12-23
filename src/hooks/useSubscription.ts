import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionState {
  subscribed: boolean;
  tier: string;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  error: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    tier: "free",
    productId: null,
    subscriptionEnd: null,
    loading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({
        subscribed: false,
        tier: "free",
        productId: null,
        subscriptionEnd: null,
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) throw error;

      setState({
        subscribed: data.subscribed,
        tier: data.tier || "free",
        productId: data.product_id || null,
        subscriptionEnd: data.subscription_end || null,
        loading: false,
        error: null,
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

    // Open in new tab
    window.open(data.url, "_blank");
  };

  const openCustomerPortal = async () => {
    if (!user) {
      throw new Error("You must be logged in to manage subscription");
    }

    const { data, error } = await supabase.functions.invoke("customer-portal");

    if (error) throw error;
    if (!data?.url) throw new Error("No portal URL returned");

    // Open in new tab
    window.open(data.url, "_blank");
  };

  return {
    ...state,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
}
