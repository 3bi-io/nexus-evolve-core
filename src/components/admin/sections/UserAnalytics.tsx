import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function UserAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    try {
      // Fetch subscription stats to count users
      const { data: subscriptionData } = await supabase
        .from("user_subscriptions")
        .select("user_id, status");

      const totalUsers = subscriptionData?.length || 0;
      const activeUsers = subscriptionData?.filter(s => s.status === "active").length || 0;
      
      // Fetch session activity (last 7 days)
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
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">User Analytics</h1>
          <p className="text-muted-foreground">Growth and retention metrics</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">User Analytics</h1>
        <p className="text-muted-foreground">Growth and retention metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Total Users
            </CardTitle>
            <CardDescription>Registered accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Active Users
            </CardTitle>
            <CardDescription>With active subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.activeUsers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Sessions
            </CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.recentSessions || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
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
