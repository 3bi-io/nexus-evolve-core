import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Bot, TrendingUp, Users, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AgentAnalyticsOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    const { data: agents } = await supabase
      .from("custom_agents")
      .select("*");

    const totalAgents = agents?.length || 0;
    const publicAgents = agents?.filter(a => a.is_public).length || 0;
    const totalUsage = agents?.reduce((sum, a) => sum + (a.usage_count || 0), 0) || 0;
    const avgRating = agents && agents.length > 0
      ? agents.reduce((sum, a) => sum + (a.rating_avg || 0), 0) / agents.length
      : 0;

    setStats({
      totalAgents,
      publicAgents,
      totalUsage,
      avgRating: avgRating.toFixed(2),
    });
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-mobile">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Agent Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Aggregate agent metrics</p>
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Agent Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Aggregate agent metrics</p>
      </div>

      <div className={cn("grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}>
        <Card className="card-mobile">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Bot className="w-5 h-5" />
              Total Agents
            </CardTitle>
            <CardDescription>All created agents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">{stats?.totalAgents || 0}</p>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-5 h-5" />
              Public Agents
            </CardTitle>
            <CardDescription>Marketplace agents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">{stats?.publicAgents || 0}</p>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="w-5 h-5" />
              Total Executions
            </CardTitle>
            <CardDescription>All-time usage</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">{stats?.totalUsage || 0}</p>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Star className="w-5 h-5" />
              Average Rating
            </CardTitle>
            <CardDescription>Platform-wide</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold">{stats?.avgRating || "0.00"}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 card-mobile">
        <CardHeader>
          <CardTitle>Top Performing Agents</CardTitle>
          <CardDescription>Most used and highest rated agents</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Detailed agent performance rankings and analytics will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
