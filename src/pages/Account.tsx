import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UsageHistory } from "@/components/pricing/UsageHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { CreditCard, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { formatDistance } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEO } from "@/components/SEO";

interface Subscription {
  tier_name: string;
  credits_remaining: number;
  credits_total: number;
  monthly_price: number;
  billing_cycle: string;
  renews_at: string;
  status: string;
}

const Account = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          credits_remaining,
          credits_total,
          billing_cycle,
          renews_at,
          status,
          subscription_tiers(
            tier_name,
            monthly_price,
            yearly_price
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSubscription({
          tier_name: data.subscription_tiers.tier_name,
          credits_remaining: data.credits_remaining,
          credits_total: data.credits_total,
          monthly_price: data.billing_cycle === "monthly" 
            ? data.subscription_tiers.monthly_price 
            : Math.round(data.subscription_tiers.yearly_price / 12),
          billing_cycle: data.billing_cycle,
          renews_at: data.renews_at,
          status: data.status,
        });
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const usagePercentage = subscription
    ? Math.round((subscription.credits_remaining / subscription.credits_total) * 100)
    : 0;

  return (
    <PageLayout title="Account" showBottomNav={true}>
      <SEO 
        title="Account Settings - Manage Subscription & Credits"
        description="View your subscription plan, monitor credit usage, and manage your Oneiros.me account. Track usage history and upgrade your plan for more AI capabilities."
        keywords="account settings, subscription management, credit usage, AI plan"
        canonical="https://oneiros.me/account"
      />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Account Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your subscription and monitor credit usage
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Subscription Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-2">
                      <Badge variant="default" className="text-lg capitalize">
                        {subscription.tier_name}
                      </Badge>
                      <p className="text-2xl font-bold mt-2">
                        ${subscription.monthly_price}/mo
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Billed {subscription.billing_cycle}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => navigate("/pricing")}
                      >
                        Change Plan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="secondary">Free Tier</Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        5 daily credits
                      </p>
                      <Button
                        className="w-full mt-4"
                        onClick={() => navigate("/pricing")}
                      >
                        Upgrade Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Credits Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">
                      {subscription?.credits_remaining || 5}
                      <span className="text-muted-foreground text-xl">
                        {" "}/ {subscription?.credits_total || 5}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usagePercentage > 50
                            ? "bg-success"
                            : usagePercentage > 20
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                        style={{ width: `${usagePercentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {usagePercentage}% remaining
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Next Renewal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">
                        {formatDistance(new Date(subscription.renews_at), new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Credits will refill to {subscription.credits_total}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Credits reset daily at 00:00 UTC
                      </p>
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Upgrade for monthly credits that don't reset daily
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Low Credit Warning */}
            {subscription && usagePercentage < 20 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You're running low on credits. Consider upgrading to a higher tier to
                  avoid interruptions.{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => navigate("/pricing")}
                  >
                    View plans
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Usage History */}
            <UsageHistory />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Account;
