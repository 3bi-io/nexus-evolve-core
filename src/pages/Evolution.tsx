import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Activity, Brain, Star, Network, Sparkles, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type EvolutionLog = {
  id: string;
  log_type: string;
  description: string;
  created_at: string;
};

type Stats = {
  totalInteractions: number;
  avgRating: number;
  learningRate: number;
  activeCapabilities: number;
};

type AdaptiveBehavior = {
  id: string;
  behavior_type: string;
  description: string;
  effectiveness_score: number;
  application_count: number;
  created_at: string;
};

export default function Evolution() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<EvolutionLog[]>([]);
  const [stats, setStats] = useState<Stats>({ totalInteractions: 0, avgRating: 0, learningRate: 0, activeCapabilities: 0 });
  const [interactionTrend, setInteractionTrend] = useState<any[]>([]);
  const [qualityTrend, setQualityTrend] = useState<any[]>([]);
  const [behaviors, setBehaviors] = useState<AdaptiveBehavior[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load evolution logs
      const { data: logsData } = await supabase
        .from("evolution_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setLogs(logsData || []);

      // Load interactions for stats
      const { data: interactions } = await supabase
        .from("interactions")
        .select("quality_rating, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Calculate stats
      const totalInteractions = interactions?.length || 0;
      const ratings = interactions?.filter((i) => i.quality_rating !== null).map((i) => i.quality_rating) || [];
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a! + b!, 0)! / ratings.length : 0;

      // Load capabilities
      const { data: capabilities } = await supabase
        .from("capability_modules")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_enabled", true);

      // Load knowledge base for learning rate
      const { data: knowledge } = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("user_id", user.id);

      const learningRate = knowledge?.length || 0;

      setStats({
        totalInteractions,
        avgRating: Math.round(avgRating * 100),
        learningRate,
        activeCapabilities: capabilities?.length || 0,
      });

      // Process interaction trend (last 7 days)
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      const trendData = last7Days.map((date) => {
        const count = interactions?.filter((i) => i.created_at.startsWith(date)).length || 0;
        return { date: date.substring(5), count };
      });

      setInteractionTrend(trendData);

      // Process quality trend
      const qualityData = last7Days.map((date) => {
        const dayInteractions = interactions?.filter((i) => i.created_at.startsWith(date)) || [];
        const dayRatings = dayInteractions.filter((i) => i.quality_rating !== null).map((i) => i.quality_rating);
        const avg = dayRatings.length > 0 ? dayRatings.reduce((a, b) => a! + b!, 0)! / dayRatings.length : 0;
        return { date: date.substring(5), quality: Math.round(avg * 50 + 50) };
      });

      setQualityTrend(qualityData);

      // Load adaptive behaviors (PHASE 3B)
      const { data: behaviorsData } = await supabase
        .from("adaptive_behaviors")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("effectiveness_score", { ascending: false })
        .limit(10);

      setBehaviors(behaviorsData || []);

    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Failed to load dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFeedbackAnalysis = async () => {
    if (!user) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-feedback", {
        body: { timeframe: 30 },
      });

      if (error) throw error;

      toast({
        title: "Analysis complete",
        description: `Created ${data.behaviors_created} new patterns, updated ${data.behaviors_updated} existing behaviors.`,
      });

      // Reload dashboard
      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Failed to analyze feedback",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const COLORS = ["hsl(262, 83%, 58%)", "hsl(217, 91%, 60%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)"];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Evolution Dashboard</h1>
            <p className="text-muted-foreground">Track learning progress and system improvements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalInteractions}</div>
              <p className="text-xs text-muted-foreground mt-1">Conversations processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4" />
                Avg Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.avgRating}%</div>
              <p className="text-xs text-muted-foreground mt-1">Response quality rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Learning Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.learningRate}</div>
              <p className="text-xs text-muted-foreground mt-1">Concepts learned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Active Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.activeCapabilities}</div>
              <p className="text-xs text-muted-foreground mt-1">Enabled features</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Interaction Trend</CardTitle>
              <CardDescription>Daily conversation volume (last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={interactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quality Trend</CardTitle>
              <CardDescription>Response quality over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={qualityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="quality" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Multi-Agent System (Phase 3C)</CardTitle>
              <CardDescription>Specialized agents for different tasks</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Network className="w-3 h-3" />
              4 Agents Active
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <h4 className="font-semibold">Reasoning Agent</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Deep logical analysis, multi-step reasoning, and mathematical problem solving
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <h4 className="font-semibold">Creative Agent</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ideation, brainstorming, and innovative solution generation
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold">Learning Agent</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Meta-learning, pattern analysis, and knowledge gap identification
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold">Coordinator Agent</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Intelligent routing and multi-agent orchestration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Adaptive Behaviors</CardTitle>
              <CardDescription>Patterns learned from your feedback (Phase 3B)</CardDescription>
            </div>
            <button
              onClick={triggerFeedbackAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Feedback"}
            </button>
          </CardHeader>
          <CardContent>
            {behaviors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No adaptive behaviors yet. Rate some interactions to start learning!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {behaviors.map((behavior) => (
                  <div
                    key={behavior.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {behavior.behavior_type.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Applied {behavior.application_count} times
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-1">{behavior.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(behavior.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-primary">
                        {(behavior.effectiveness_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">effective</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Evolution Events</CardTitle>
            <CardDescription>Latest system improvements and learning milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No evolution events yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                    <Badge variant="outline">{log.log_type}</Badge>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{log.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
