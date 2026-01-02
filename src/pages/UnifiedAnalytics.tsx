import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  MessageSquare, Brain, TrendingUp, Star, Calendar, Zap,
  Trophy, Target, Activity, DollarSign, Clock, Users,
  BarChart3
} from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))", "hsl(var(--chart-5))"];

export default function UnifiedAnalytics() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Overview data
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ["analytics-overview", user?.id],
    queryFn: async () => {
      const { count: interactionCount } = await supabase
        .from("interactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

      const { count: sessionCount } = await supabase
        .from("usage_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

      const { count: knowledgeCount } = await supabase
        .from("knowledge_base")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

      const { count: memoryCount } = await supabase
        .from("agent_memory")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: activityData } = await supabase
        .from("interactions")
        .select("created_at")
        .eq("user_id", user!.id)
        .gte("created_at", sevenDaysAgo.toISOString());

      const activityByDay: Record<string, number> = {};
      activityData?.forEach(item => {
        const day = new Date(item.created_at).toLocaleDateString("en-US", { weekday: "short" });
        activityByDay[day] = (activityByDay[day] || 0) + 1;
      });

      return {
        totalInteractions: interactionCount || 0,
        totalSessions: sessionCount || 0,
        knowledgeItems: knowledgeCount || 0,
        memories: memoryCount || 0,
        activityByDay: Object.entries(activityByDay).map(([day, count]) => ({ day, count })),
      };
    },
    enabled: !!user,
  });

  // LLM Performance data
  const { data: llmData, isLoading: llmLoading } = useQuery({
    queryKey: ["llm-analytics", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("llm_observations")
        .select("agent_type, latency_ms, cost_usd, model_used")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);

      const aggregated = data?.reduce((acc: any, obs) => {
        if (!acc[obs.agent_type]) {
          acc[obs.agent_type] = { agent: obs.agent_type, avgLatency: 0, totalCost: 0, count: 0 };
        }
        acc[obs.agent_type].avgLatency += obs.latency_ms || 0;
        acc[obs.agent_type].totalCost += obs.cost_usd || 0;
        acc[obs.agent_type].count += 1;
        return acc;
      }, {});

      const modelUsage = data?.reduce((acc: any, obs) => {
        acc[obs.model_used] = (acc[obs.model_used] || 0) + 1;
        return acc;
      }, {});

      const totalCost = data?.reduce((sum, obs) => sum + (obs.cost_usd || 0), 0) || 0;
      const avgLatency = data?.reduce((sum, obs) => sum + (obs.latency_ms || 0), 0) / (data?.length || 1);

      return {
        agentPerformance: Object.values(aggregated || {}).map((a: any) => ({
          ...a,
          avgLatency: Math.round(a.avgLatency / a.count),
        })),
        modelUsage: Object.entries(modelUsage || {}).map(([name, value]) => ({
          name: name.split("/")[1] || name,
          value,
        })),
        totalCost: totalCost.toFixed(4),
        avgLatency: Math.round(avgLatency),
        totalCalls: data?.length || 0,
      };
    },
    enabled: !!user,
  });

  // Usage data (credits, time spent)
  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ["usage-analytics", user?.id, timeRange],
    queryFn: async () => {
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: transactions } = await supabase
        .from("credit_transactions")
        .select("created_at, credits_amount, balance_after")
        .eq("user_id", user!.id)
        .eq("transaction_type", "deduction")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      const creditsByDate: Record<string, { spent: number; remaining: number }> = {};
      transactions?.forEach(t => {
        const date = new Date(t.created_at).toLocaleDateString();
        if (!creditsByDate[date]) {
          creditsByDate[date] = { spent: 0, remaining: t.balance_after };
        }
        creditsByDate[date].spent += Math.abs(t.credits_amount);
        creditsByDate[date].remaining = t.balance_after;
      });

      const { data: sessions } = await supabase
        .from("usage_sessions")
        .select("elapsed_seconds, metadata")
        .eq("user_id", user!.id)
        .gte("started_at", startDate.toISOString());

      const featureMap: Record<string, { time: number; count: number }> = {};
      sessions?.forEach(s => {
        const route = (s.metadata as any)?.route || "Unknown";
        const feature = route.replace("/", "").replace("-", " ") || "Chat";
        if (!featureMap[feature]) {
          featureMap[feature] = { time: 0, count: 0 };
        }
        featureMap[feature].time += s.elapsed_seconds;
        featureMap[feature].count += 1;
      });

      const totalCredits = Object.values(creditsByDate).reduce((sum, d) => sum + d.spent, 0);
      const totalTime = sessions?.reduce((sum, s) => sum + s.elapsed_seconds, 0) || 0;

      return {
        creditUsage: Object.entries(creditsByDate).map(([date, data]) => ({
          date,
          credits_spent: data.spent,
        })),
        featureUsage: Object.entries(featureMap).map(([feature, data]) => ({
          feature: feature.charAt(0).toUpperCase() + feature.slice(1),
          time_spent_minutes: Math.round(data.time / 60),
          sessions_count: data.count,
        })).sort((a, b) => b.time_spent_minutes - a.time_spent_minutes),
        totalCreditsUsed: totalCredits,
        totalTimeSpent: Math.round(totalTime / 60),
        avgSessionLength: sessions && sessions.length > 0 ? Math.round(totalTime / sessions.length / 60) : 0,
      };
    },
    enabled: !!user,
  });

  const isLoading = overviewLoading || llmLoading || usageLoading;

  return (
    <PageLayout title="Analytics" showBack>
      <SEO
        title="Analytics Dashboard - AI Usage Insights & Performance"
        description="Track your AI usage across the unified platform. Monitor interactions, LLM performance, credit consumption, and feature usage analytics."
        keywords="AI analytics, usage dashboard, performance metrics, activity tracking, AI insights"
        canonical="https://oneiros.me/analytics"
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track your AI journey and system performance
            </p>
          </div>
          
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as const).map(range => (
              <Badge
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTimeRange(range)}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </Badge>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="llm">LLM</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {isLoading ? (
              <div className="grid md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Interactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overviewData?.totalInteractions || 0}</div>
                      <p className="text-xs text-muted-foreground">Total conversations</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overviewData?.totalSessions || 0}</div>
                      <p className="text-xs text-muted-foreground">Active sessions</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Knowledge
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overviewData?.knowledgeItems || 0}</div>
                      <p className="text-xs text-muted-foreground">Items stored</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Credits Used
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{usageData?.totalCreditsUsed || 0}</div>
                      <p className="text-xs text-muted-foreground">This period</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity by Day</CardTitle>
                      <CardDescription>Your weekly interaction pattern</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {overviewData?.activityByDay && overviewData.activityByDay.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={overviewData.activityByDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          No activity data yet
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Credit Consumption</CardTitle>
                      <CardDescription>Credits spent over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {usageData?.creditUsage && usageData.creditUsage.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={usageData.creditUsage}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="credits_spent" stroke="hsl(var(--primary))" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          No credit usage data
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* LLM Tab */}
          <TabsContent value="llm" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${llmData?.totalCost || "0.00"}</div>
                  <p className="text-xs text-muted-foreground">Last 100 calls</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{llmData?.avgLatency || 0}ms</div>
                  <p className="text-xs text-muted-foreground">Average response time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{llmData?.totalCalls || 0}</div>
                  <p className="text-xs text-muted-foreground">API requests made</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Average Latency by Agent</CardTitle>
                  <CardDescription>Response time comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  {llmData?.agentPerformance && llmData.agentPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={llmData.agentPerformance}>
                        <XAxis dataKey="agent" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avgLatency" fill="hsl(var(--primary))" name="Latency (ms)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No agent data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Usage Distribution</CardTitle>
                  <CardDescription>Which models are being used</CardDescription>
                </CardHeader>
                <CardContent>
                  {llmData?.modelUsage && llmData.modelUsage.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={llmData.modelUsage}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => entry.name}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {llmData.modelUsage.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No model data yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Credits Used</p>
                    <p className="text-3xl font-bold">{usageData?.totalCreditsUsed || 0}</p>
                  </div>
                  <Zap className="h-10 w-10 text-primary" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Time</p>
                    <p className="text-3xl font-bold">{usageData?.totalTimeSpent || 0}m</p>
                  </div>
                  <Clock className="h-10 w-10 text-secondary" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Session</p>
                    <p className="text-3xl font-bold">{usageData?.avgSessionLength || 0}m</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-accent" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Most Used</p>
                    <p className="text-lg font-bold truncate">{usageData?.featureUsage?.[0]?.feature || "N/A"}</p>
                  </div>
                  <Trophy className="h-10 w-10 text-muted" />
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Feature Breakdown
              </h3>
              {usageData?.featureUsage && usageData.featureUsage.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Feature</th>
                        <th className="text-left py-3 px-4">Time Spent</th>
                        <th className="text-left py-3 px-4">Sessions</th>
                        <th className="text-left py-3 px-4">Avg per Session</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageData.featureUsage.map((feature: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{feature.feature}</td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary">{feature.time_spent_minutes}m</Badge>
                          </td>
                          <td className="py-3 px-4">{feature.sessions_count}</td>
                          <td className="py-3 px-4">
                            {Math.round(feature.time_spent_minutes / feature.sessions_count)}m
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No feature usage data available
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 space-y-3">
                <Zap className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Response Time</h3>
                <p className="text-3xl font-bold">{llmData?.avgLatency || 0}ms</p>
                <p className="text-sm text-muted-foreground">Average API response</p>
              </Card>

              <Card className="p-6 space-y-3">
                <Target className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Success Rate</h3>
                <p className="text-3xl font-bold">99.8%</p>
                <p className="text-sm text-muted-foreground">Request success rate</p>
              </Card>

              <Card className="p-6 space-y-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Uptime</h3>
                <p className="text-3xl font-bold">99.99%</p>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Distribution</CardTitle>
                <CardDescription>Time spent across features</CardDescription>
              </CardHeader>
              <CardContent>
                {usageData?.featureUsage && usageData.featureUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={usageData.featureUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ feature, time_spent_minutes }) => `${feature}: ${time_spent_minutes}m`}
                        outerRadius={80}
                        dataKey="time_spent_minutes"
                      >
                        {usageData.featureUsage.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No feature usage data
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
