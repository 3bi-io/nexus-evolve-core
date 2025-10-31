import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useClientIP } from "@/hooks/useClientIP";
import { AnimatedCreditDisplay } from "@/components/credits/AnimatedCreditDisplay";
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
  const { ipAddress } = useClientIP();
  const [credits, setCredits] = useState<CreditBalanceData>({
    remaining: 0,
    total: 5,
    tier: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, [user, ipAddress]);

  const fetchCredits = async () => {
    if (!user) {
      // For anonymous users, use check_credits_only action
      if (ipAddress) {
        try {
          const response = await supabase.functions.invoke('manage-usage-session', {
            body: { 
              action: 'check_credits_only', 
              ipAddress 
            }
          });
          
          if (response.data?.success) {
            const remaining = response.data.remainingCredits || 0;
            setCredits({
              remaining,
              total: 5,
              tier: 'Visitor'
            });
          } else {
            setCredits({ remaining: 0, total: 5, tier: 'Visitor' });
          }
        } catch (error) {
          console.error('Failed to fetch visitor credits:', error);
          setCredits({ remaining: 0, total: 5, tier: 'Visitor' });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
      return;
    }

    // Authenticated users - use check_credits_only for consistency
    try {
      const response = await supabase.functions.invoke('manage-usage-session', {
        body: { 
          action: 'check_credits_only', 
          userId: user.id
        }
      });
      
      if (response.data?.success) {
        const remaining = response.data.remainingCredits || 0;
        
        // Also fetch tier info
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("credits_total, subscription_tiers(tier_name)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        setCredits({
          remaining,
          total: subscription?.credits_total || 5,
          tier: subscription?.subscription_tiers?.tier_name || null,
        });
      } else {
        setCredits({ remaining: 0, total: 5, tier: null });
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      setCredits({ remaining: 0, total: 5, tier: null });
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
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div onClick={() => navigate("/account")} className="cursor-pointer">
            <AnimatedCreditDisplay credits={credits.remaining} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">
            {credits.remaining} credits remaining
          </p>
          <p className="text-xs text-muted-foreground">
            ≈ {Math.floor((credits.remaining * 300) / 60)} minutes of usage
          </p>
          {!credits.tier && (
            <p className="text-xs text-muted-foreground">
              Free tier: 5 daily credits (25 min/day)
            </p>
          )}
          {credits.tier && (
            <Badge variant="secondary" className="mt-1 capitalize">
              {credits.tier}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            1 credit = 5 minutes • Click for history
          </p>
        </TooltipContent>
      </Tooltip>
      {(credits.remaining <= 5 || !user) && (
        <Button 
          size="sm" 
          variant={user ? "default" : "outline"}
          onClick={() => navigate(user ? '/pricing' : '/auth')}
        >
          {user ? 'Upgrade' : 'Sign Up Free'}
        </Button>
      )}
    </div>
  );
};
