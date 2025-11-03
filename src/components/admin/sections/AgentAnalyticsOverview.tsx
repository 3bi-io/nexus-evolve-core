import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Bot, TrendingUp, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Agent Analytics</h1>
          <p className="text-muted-foreground">Aggregate agent metrics</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Agent Analytics</h1>
        <p className="text-muted-foreground">Aggregate agent metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Total Agents
            </CardTitle>
            <CardDescription>All created agents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.totalAgents || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Public Agents
            </CardTitle>
            <CardDescription>Marketplace agents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.publicAgents || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Total Executions
            </CardTitle>
            <CardDescription>All-time usage</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.totalUsage || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Average Rating
            </CardTitle>
            <CardDescription>Platform-wide</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.avgRating || "0.00"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
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
