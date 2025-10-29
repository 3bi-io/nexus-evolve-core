import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { 
  MessageSquare, Brain, TrendingUp, Star, 
  Calendar, Zap, Trophy, Target 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  totalInteractions: number;
  totalSessions: number;
  knowledgeItems: number;
  memories: number;
  avgQualityRating: number;
  achievementProgress: number;
  topAgents: { name: string; count: number }[];
  activityByDay: { day: string; count: number }[];
  qualityTrend: { date: string; rating: number }[];
}

const Analytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    try {
      // Fetch all analytics data in parallel
      const [interactions, sessions, knowledge, memories, achievements] = await Promise.all([
        supabase.from("interactions").select("*").eq("user_id", user!.id),
        supabase.from("sessions").select("*").eq("user_id", user!.id),
        supabase.from("knowledge_base").select("*").eq("user_id", user!.id),
        supabase.from("agent_memory").select("*").eq("user_id", user!.id),
        supabase.from("user_achievements").select("*, achievement_definitions(*)").eq("user_id", user!.id),
      ]);

      const interactionData = interactions.data || [];
      const sessionData = sessions.data || [];

      // Calculate average quality rating
      const ratedInteractions = interactionData.filter(i => i.quality_rating);
      const avgRating = ratedInteractions.length > 0
        ? ratedInteractions.reduce((sum, i) => sum + i.quality_rating, 0) / ratedInteractions.length
        : 0;

      // Group by model used
      const agentCounts = interactionData.reduce((acc, i) => {
        const agent = i.model_used || 'auto';
        acc[agent] = (acc[agent] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topAgents = Object.entries(agentCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Activity by day (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      const activityByDay = last7Days.map(day => {
        const count = interactionData.filter(i => 
          i.created_at.startsWith(day)
        ).length;
        return { day: new Date(day).toLocaleDateString('en', { weekday: 'short' }), count };
      });

      // Quality trend (last 10 rated interactions)
      const qualityTrend = ratedInteractions
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .reverse()
        .map((i, idx) => ({
          date: `#${idx + 1}`,
          rating: i.quality_rating,
        }));

      // Achievement progress
      const totalAchievements = achievements.data?.length || 0;
      const completedAchievements = achievements.data?.filter(a => a.completed_at).length || 0;
      const achievementProgress = totalAchievements > 0 
        ? Math.round((completedAchievements / totalAchievements) * 100)
        : 0;

      setData({
        totalInteractions: interactionData.length,
        totalSessions: sessionData.length,
        knowledgeItems: knowledge.data?.length || 0,
        memories: memories.data?.length || 0,
        avgQualityRating: Math.round(avgRating * 10) / 10,
        achievementProgress,
        topAgents,
        activityByDay,
        qualityTrend,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <PageLayout title="Analytics" showBottomNav={true}>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Usage Analytics</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your AI interactions, learning progress, and engagement patterns
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalInteractions}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {data.totalSessions} sessions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
                  <Brain className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.knowledgeItems}</div>
                  <p className="text-xs text-muted-foreground">
                    {data.memories} memories stored
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
                  <Star className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.avgQualityRating}/5</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.round(data.avgQualityRating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.achievementProgress}%</div>
                  <p className="text-xs text-muted-foreground">
                    Progress unlocked
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Activity (Last 7 Days)
                  </CardTitle>
                  <CardDescription>Your daily interaction patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.activityByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Top Agents Used
                  </CardTitle>
                  <CardDescription>Your most used AI agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.topAgents}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.topAgents.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {data.qualityTrend.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Quality Trend
                    </CardTitle>
                    <CardDescription>Your recent response ratings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={data.qualityTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="rating"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Personalized Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.totalInteractions > 50 && (
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Badge variant="secondary">🔥</Badge>
                    <div>
                      <p className="font-medium">Power User Status</p>
                      <p className="text-sm text-muted-foreground">
                        You've had {data.totalInteractions} interactions! You're in the top 10% of users.
                      </p>
                    </div>
                  </div>
                )}
                {data.avgQualityRating >= 4 && (
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Badge variant="secondary">⭐</Badge>
                    <div>
                      <p className="font-medium">High Satisfaction</p>
                      <p className="text-sm text-muted-foreground">
                        Your average rating of {data.avgQualityRating}/5 shows great satisfaction with responses.
                      </p>
                    </div>
                  </div>
                )}
                {data.knowledgeItems > 20 && (
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Badge variant="secondary">🧠</Badge>
                    <div>
                      <p className="font-medium">Knowledge Builder</p>
                      <p className="text-sm text-muted-foreground">
                        You've built an impressive knowledge base with {data.knowledgeItems} items!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No analytics data available yet. Start chatting to see your stats!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default Analytics;
