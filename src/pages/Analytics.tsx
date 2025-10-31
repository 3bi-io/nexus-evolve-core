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
import { SEO } from "@/components/SEO";

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
      // Placeholder - original implementation had incompatible queries
      setData({
        totalInteractions: 0,
        totalSessions: 0,
        knowledgeItems: 0,
        memories: 0,
        avgQualityRating: 0,
        achievementProgress: 0,
        topAgents: [],
        activityByDay: [],
        qualityTrend: [],
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

  return (
    <PageLayout>
      <SEO 
        title="Analytics Dashboard - AI Usage Insights & Performance"
        description="Track your AI usage, conversation quality, agent performance, and system insights. View detailed analytics on interactions, sessions, and knowledge base growth."
        keywords="AI analytics, usage dashboard, performance metrics, conversation analytics, AI insights"
        canonical="https://oneiros.me/analytics"
      />
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your AI journey and system performance
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : !data ? (
          <div className="text-center py-12">
            <p>No analytics data available</p>
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
                  <div className="text-2xl font-bold">{data.totalInteractions}</div>
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
                  <div className="text-2xl font-bold">{data.totalSessions}</div>
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
                  <div className="text-2xl font-bold">{data.knowledgeItems}</div>
                  <p className="text-xs text-muted-foreground">Items stored</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.avgQualityRating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">Average rating</p>
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
                  <CardTitle>Top Agents</CardTitle>
                  <CardDescription>Most frequently used agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.topAgents}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {data.topAgents.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default Analytics;
