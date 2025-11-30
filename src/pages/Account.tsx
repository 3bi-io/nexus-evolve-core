import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UsageHistory } from "@/components/pricing/UsageHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { CreditCard, TrendingUp, Calendar, AlertCircle, Brain, Trash2 } from "lucide-react";
import { formatDistance } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEO } from "@/components/SEO";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Subscription {
  tier_name: string;
  credits_remaining: number;
  credits_total: number;
  monthly_price: number;
  billing_cycle: string;
  renews_at: string;
  status: string;
}

interface MemoryPreferences {
  auto_pruning_enabled: boolean;
  pruning_aggressiveness: "conservative" | "moderate" | "aggressive";
  min_age_days: number;
  relevance_threshold: number;
}

interface PruningStats {
  total_pruned: number;
  last_pruned_at: string | null;
  storage_saved_kb: number;
}

const Account = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [memoryPrefs, setMemoryPrefs] = useState<MemoryPreferences>({
    auto_pruning_enabled: true,
    pruning_aggressiveness: "moderate",
    min_age_days: 90,
    relevance_threshold: 0.3,
  });
  const [pruningStats, setPruningStats] = useState<PruningStats>({
    total_pruned: 0,
    last_pruned_at: null,
    storage_saved_kb: 0,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchMemoryPreferences();
    fetchPruningStats();
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

  const fetchMemoryPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_memory_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const aggressiveness = data.pruning_aggressiveness as "conservative" | "moderate" | "aggressive";
        setMemoryPrefs({
          auto_pruning_enabled: data.auto_pruning_enabled,
          pruning_aggressiveness: aggressiveness,
          min_age_days: data.min_age_days,
          relevance_threshold: data.relevance_threshold,
        });
      }
    } catch (error) {
      console.error("Error fetching memory preferences:", error);
    }
  };

  const fetchPruningStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("memory_pruning_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const totalPruned = data.reduce((sum, log) => sum + log.pruned_count, 0);
        const totalStorage = data.reduce((sum, log) => sum + log.storage_saved_kb, 0);
        setPruningStats({
          total_pruned: totalPruned,
          last_pruned_at: data[0].created_at,
          storage_saved_kb: totalStorage,
        });
      }
    } catch (error) {
      console.error("Error fetching pruning stats:", error);
    }
  };

  const saveMemoryPreferences = async () => {
    if (!user) return;

    setSavingPrefs(true);
    try {
      const { error } = await supabase
        .from("user_memory_preferences")
        .upsert({
          user_id: user.id,
          ...memoryPrefs,
        });

      if (error) throw error;

      toast.success("Memory preferences saved");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  const manualPrune = async () => {
    if (!user) return;

    try {
      toast.info("Starting memory pruning...");
      
      const { error } = await supabase.functions.invoke("auto-prune-memories", {
        body: { user_id: user.id },
      });

      if (error) throw error;

      toast.success("Memory pruning completed");
      fetchPruningStats();
    } catch (error) {
      console.error("Error pruning memories:", error);
      toast.error("Failed to prune memories");
    }
  };

  const usagePercentage = subscription
    ? Math.round((subscription.credits_remaining / subscription.credits_total) * 100)
    : 0;

  return (
    <AuthGuard featureName="account settings">
    <PageLayout title="Account" showBottomNav={true}>
      <SEO
        title="Account Settings - Manage Subscription & Credits"
        description="View your subscription plan, monitor credit usage, and manage your Oneiros.me account. Track usage history and upgrade your plan for more AI capabilities."
        keywords="account settings, subscription management, credit usage, AI plan"
        canonical="https://oneiros.me/account"
      />
      <div className="container-mobile mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Account Settings</h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            Manage your subscription and monitor credit usage
          </p>
        </div>

        {loading ? (
          <div className="space-y-4 sm:space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-mobile">
            {/* Subscription Overview */}
            <div className="grid-mobile">
              <Card className="card-mobile">
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

              <Card className="card-mobile">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Credits Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl sm:text-4xl font-bold">
                      {subscription?.credits_remaining || 5}
                      <span className="text-muted-foreground text-xl sm:text-2xl">
                        {" "}/ {subscription?.credits_total || 5}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          usagePercentage > 50
                            ? "bg-success"
                            : usagePercentage > 20
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                        style={{ width: `${usagePercentage}%` }}
                      />
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {usagePercentage}% remaining
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-mobile">
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

            <Card className="card-mobile">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                  Memory Management
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Configure automatic memory pruning to optimize storage and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-mobile">
                {/* Auto-pruning Toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <Label className="text-sm sm:text-base">Auto-Pruning</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Automatically remove low-relevance memories
                    </p>
                  </div>
                  <Switch
                    checked={memoryPrefs.auto_pruning_enabled}
                    onCheckedChange={(checked) =>
                      setMemoryPrefs({ ...memoryPrefs, auto_pruning_enabled: checked })
                    }
                    className="scale-110"
                  />
                </div>

                {/* Aggressiveness */}
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Pruning Aggressiveness</Label>
                  <Select
                    value={memoryPrefs.pruning_aggressiveness}
                    onValueChange={(value) => {
                      if (value === "conservative" || value === "moderate" || value === "aggressive") {
                        setMemoryPrefs({ ...memoryPrefs, pruning_aggressiveness: value });
                      }
                    }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative" className="text-base">Conservative (Keep more)</SelectItem>
                      <SelectItem value="moderate" className="text-base">Moderate (Balanced)</SelectItem>
                      <SelectItem value="aggressive" className="text-base">Aggressive (Keep less)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pruned</p>
                    <p className="text-2xl sm:text-3xl font-bold">{pruningStats.total_pruned}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Storage Saved</p>
                    <p className="text-2xl sm:text-3xl font-bold">{pruningStats.storage_saved_kb} KB</p>
                  </div>
                </div>

                {pruningStats.last_pruned_at && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Last pruned: {formatDistance(new Date(pruningStats.last_pruned_at), new Date(), { addSuffix: true })}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                  <Button
                    onClick={saveMemoryPreferences}
                    disabled={savingPrefs}
                    className="flex-1 h-12 touch-feedback text-base"
                  >
                    {savingPrefs ? "Saving..." : "Save Preferences"}
                  </Button>
                  <Button
                    onClick={manualPrune}
                    variant="outline"
                    className="flex-1 h-12 touch-feedback text-base"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Prune Now
                  </Button>
                  <Button
                    onClick={() => navigate("/memory-graph")}
                    variant="outline"
                    className="h-12 touch-feedback text-base"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    View Graph
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage History */}
            <UsageHistory />
          </div>
        )}
      </div>
    </PageLayout>
    </AuthGuard>
  );
};

export default Account;
