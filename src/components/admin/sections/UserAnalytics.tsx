import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Activity, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function UserAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    try {
      const { data: subscriptionData } = await supabase
        .from("user_subscriptions")
        .select("user_id, status");

      const totalUsers = subscriptionData?.length || 0;
      const activeUsers = subscriptionData?.filter(s => s.status === "active").length || 0;
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentSessions } = await supabase
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      setStats({
        totalUsers,
        activeUsers,
        recentSessions: recentSessions || 0,
        newToday: 0,
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-mobile">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">User Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Growth and retention metrics</p>
        </div>
        <div className={cn("grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-mobile">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">User Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Growth and retention metrics</p>
      </div>

      <div className={cn("grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}>
        <Card className="card-mobile">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-5 h-5" />
              Total Users
            </CardTitle>
            <CardDescription>Registered accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">{stats?.totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Activity className="w-5 h-5" />
              Active Users
            </CardTitle>
            <CardDescription>With active subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">{stats?.activeUsers || 0}</p>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="w-5 h-5" />
              Recent Sessions
            </CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">{stats?.recentSessions || 0}</p>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <UserPlus className="w-5 h-5" />
              New Today
            </CardTitle>
            <CardDescription>Registered today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">{stats?.newToday || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 card-mobile">
        <CardHeader>
          <CardTitle>User Growth Trends</CardTitle>
          <CardDescription>Detailed analytics coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Advanced user analytics with cohort analysis, retention curves, and growth charts will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
