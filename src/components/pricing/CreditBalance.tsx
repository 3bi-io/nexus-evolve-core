import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreditBalanceData {
  remaining: number;
  total: number;
  tier: string | null;
}

export const CreditBalance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [credits, setCredits] = useState<CreditBalanceData>({
    remaining: 5,
    total: 5,
    tier: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, [user]);

  const fetchCredits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("credits_remaining, credits_total, subscription_tiers(tier_name)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (subscription) {
        setCredits({
          remaining: subscription.credits_remaining,
          total: subscription.credits_total,
          tier: subscription.subscription_tiers?.tier_name || null,
        });
      } else {
        // Free user - check daily usage
        const today = new Date().toISOString().split("T")[0];
        const { data: transactions } = await supabase
          .from("credit_transactions")
          .select("credits_amount")
          .eq("user_id", user.id)
          .gte("created_at", `${today}T00:00:00`)
          .eq("transaction_type", "usage");

        const used = transactions?.reduce(
          (sum, t) => sum + Math.abs(t.credits_amount),
          0
        ) || 0;
        
        setCredits({
          remaining: Math.max(0, 5 - used),
          total: 5,
          tier: null,
        });
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = () => {
    const percentage = (credits.remaining / credits.total) * 100;
    if (percentage > 50) return "text-success";
    if (percentage > 20) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate("/account")}
        >
          <Coins className={`w-4 h-4 ${getColorClass()}`} />
          <span className={getColorClass()}>
            {credits.remaining}
            {credits.tier && (
              <span className="text-muted-foreground"> / {credits.total}</span>
            )}
          </span>
          {credits.tier && (
            <Badge variant="secondary" className="ml-1 capitalize">
              {credits.tier}
            </Badge>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">
          {credits.remaining} credits remaining
        </p>
        {!credits.tier && (
          <p className="text-xs text-muted-foreground">
            Free tier: 5 daily credits
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Click to view usage history
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
