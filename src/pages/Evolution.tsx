import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity, Brain, Star, Network, Sparkles, BookOpen, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { StatusCard } from "@/components/evolution/StatusCard";
import { SettingsCard } from "@/components/evolution/SettingsCard";
import { ExperimentsCard } from "@/components/evolution/ExperimentsCard";
import { MemoryArchiveCard } from "@/components/evolution/MemoryArchiveCard";
import { EmptyState } from "@/components/EmptyState";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import type { EvolutionLog, Stats, AdaptiveBehavior, CronStatus, ABExperiment, ArchivedMemory } from "@/components/evolution/types";

// Types are now imported from @/components/evolution/types

export default function Evolution() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<EvolutionLog[]>([]);
  const [stats, setStats] = useState<Stats>({ totalInteractions: 0, avgRating: 0, learningRate: 0, activeCapabilities: 0 });
  const [interactionTrend, setInteractionTrend] = useState<any[]>([]);
  const [qualityTrend, setQualityTrend] = useState<any[]>([]);
  const [behaviors, setBehaviors] = useState<AdaptiveBehavior[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [capabilitySuggestions, setCapabilitySuggestions] = useState<any[]>([]);
  const [cronStatus, setCronStatus] = useState<CronStatus>({ lastEvolution: null, lastDiscovery: null, embeddingsProgress: { total: 0, generated: 0 }, archivedMemories: 0 });
  const [experiments, setExperiments] = useState<ABExperiment[]>([]);
  const [archivedMemories, setArchivedMemories] = useState<ArchivedMemory[]>([]);
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState(0.8);

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

      // Load capability suggestions (PHASE 3D)
      const { data: suggestionsData } = await supabase
        .from("capability_suggestions")
        .select("*")
        .eq("user_id", user.id)
        .order("confidence_score", { ascending: false })
        .limit(10);

      setCapabilitySuggestions(suggestionsData || []);

      // Load A/B experiments (PHASE 3: Step 3.2)
      const { data: experimentsData } = await supabase
        .from("ab_experiments")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(10);

      setExperiments(experimentsData || []);

      // Load archived memories (PHASE 3: Step 3.3)
      const { data: archivedData } = await supabase
        .from("agent_memory")
        .select("id, context_summary, created_at, metadata")
        .eq("user_id", user.id)
        .order("last_retrieved_at", { ascending: true })
        .limit(20);

      setArchivedMemories(archivedData || []);

      // Load cron status and embedding progress (PHASE 3: Step 3.1)
      const { data: evolutionLogs } = await supabase
        .from("evolution_logs")
        .select("log_type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const lastEvolution = evolutionLogs?.find(l => l.log_type === "system_evolution")?.created_at || null;
      const lastDiscovery = evolutionLogs?.find(l => l.log_type === "capability_discovery")?.created_at || null;

      // Check embedding progress
      const [{ count: totalMemories }, { count: memoriesWithEmbeddings }] = await Promise.all([
        supabase.from("agent_memory").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("agent_memory").select("*", { count: "exact", head: true }).eq("user_id", user.id).not("embedding", "is", null),
      ]);

      const [{ count: totalKnowledge }, { count: knowledgeWithEmbeddings }] = await Promise.all([
        supabase.from("knowledge_base").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("knowledge_base").select("*", { count: "exact", head: true }).eq("user_id", user.id).not("embedding", "is", null),
      ]);

      const total = (totalMemories || 0) + (totalKnowledge || 0);
      const generated = (memoriesWithEmbeddings || 0) + (knowledgeWithEmbeddings || 0);

      // Count archived memories (low retrieval)
      const { count: archivedCount } = await supabase
        .from("agent_memory")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("retrieval_count", 1);

      setCronStatus({
        lastEvolution,
        lastDiscovery,
        embeddingsProgress: { total, generated },
        archivedMemories: archivedCount || 0,
      });

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

  const discoverCapabilities = async () => {
    if (!user) return;
    
    setIsDiscovering(true);
    try {
      const { data, error } = await supabase.functions.invoke("discover-capabilities");

      if (error) throw error;

      toast({
        title: "🔍 Capability discovery complete",
        description: `Found ${data.suggestions?.length || 0} potential new capabilities based on your usage patterns.`,
      });

      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Failed to discover capabilities",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const triggerEvolution = async () => {
    if (!user) return;
    
    setIsEvolving(true);
    try {
      const { data, error } = await supabase.functions.invoke("evolve-system");

      if (error) throw error;

      toast({
        title: "🧬 System evolution complete",
        description: `Performance: ${data.summary.performance_trend}, Archived ${data.summary.memories_archived} memories, Optimized ${data.summary.behaviors_optimized} behaviors.`,
      });

      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Failed to evolve system",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsEvolving(false);
    }
  };

  const backfillEmbeddings = async () => {
    if (!user) return;
    
    setIsBackfilling(true);
    try {
      // Get all records without embeddings
      const [{ data: memories }, { data: knowledge }] = await Promise.all([
        supabase.from("agent_memory").select("id, context_summary").eq("user_id", user.id).is("embedding", null),
        supabase.from("knowledge_base").select("id, content").eq("user_id", user.id).is("embedding", null),
      ]);

      const totalRecords = (memories?.length || 0) + (knowledge?.length || 0);
      
      if (totalRecords === 0) {
        toast({
          title: "✅ All embeddings up to date",
          description: "No records need embedding generation.",
        });
        return;
      }

      // Generate embeddings for all records
      const promises = [
        ...(memories || []).map(m => 
          supabase.functions.invoke("generate-embeddings", {
            body: { text: m.context_summary, table: "agent_memory", record_id: m.id }
          })
        ),
        ...(knowledge || []).map(k => 
          supabase.functions.invoke("generate-embeddings", {
            body: { text: k.content || "", table: "knowledge_base", record_id: k.id }
          })
        ),
      ];

      await Promise.all(promises);

      toast({
        title: "✅ Embeddings backfilled",
        description: `Generated embeddings for ${totalRecords} records.`,
      });

      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Failed to backfill embeddings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBackfilling(false);
    }
  };

  const restoreMemory = async (memoryId: string) => {
    try {
      const { error } = await supabase
        .from("agent_memory")
        .update({ importance_score: 0.8 })
        .eq("id", memoryId);

      if (error) throw error;

      toast({
        title: "✅ Memory restored",
        description: "Memory importance has been boosted.",
      });

      await loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Failed to restore memory",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateAutoApprovalThreshold = async (value: number) => {
    setAutoApprovalThreshold(value);
    // Store in local storage for now (could be moved to user settings table)
    localStorage.setItem("autoApprovalThreshold", value.toString());
    
    toast({
      title: "Settings updated",
      description: `Auto-approval threshold set to ${(value * 100).toFixed(0)}%`,
    });
  };

  return (
    <PageLayout transition={false}>
      <SEO 
        title="Evolution Dashboard - AI Self-Learning & Autonomous Improvement"
        description="Watch your AI evolve in real-time. Track learning progress, adaptive behaviors, A/B experiments, and system improvements with our autonomous evolution engine."
        keywords="AI evolution, self-learning AI, autonomous AI, adaptive behavior, AI improvement tracking"
        canonical="https://oneiros.me/evolution"
      />
      <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Evolution Dashboard</h1>
              <p className="text-muted-foreground">Track learning progress and system improvements</p>
            </div>
          </div>
          <Button onClick={loadDashboardData} variant="outline" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
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

        {/* PHASE 3: Real-Time Status & Settings */}
        {stats.totalInteractions === 0 && experiments.length === 0 && archivedMemories.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Evolution Tracking Not Yet Active"
            description="Complete 10 conversations and extract some learnings to unlock evolution insights. Your AI will analyze patterns and improve over time."
            action={{
              label: "Start Chatting",
              onClick: () => navigate('/chat')
            }}
            mockup={
              <div className="space-y-2">
                <div className="h-2 w-full bg-primary/10 rounded" />
                <div className="h-2 w-3/4 bg-primary/10 rounded" />
                <div className="h-2 w-5/6 bg-primary/10 rounded" />
              </div>
            }
          />
        ) : (
          <>
            <StatusCard cronStatus={cronStatus} />
            <SettingsCard 
              autoApprovalThreshold={autoApprovalThreshold}
              onThresholdChange={updateAutoApprovalThreshold}
            />

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
              <CardTitle>Autonomous Evolution (Phase 3D)</CardTitle>
              <CardDescription>Self-improvement & capability discovery</CardDescription>
            </div>
            <div className="flex gap-2">
              <button
                onClick={backfillEmbeddings}
                disabled={isBackfilling}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {isBackfilling ? "Backfilling..." : "Backfill Embeddings"}
              </button>
              <button
                onClick={discoverCapabilities}
                disabled={isDiscovering}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {isDiscovering ? "Discovering..." : "Discover Capabilities"}
              </button>
              <button
                onClick={triggerEvolution}
                disabled={isEvolving}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                {isEvolving ? "Evolving..." : "Run Evolution Cycle"}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {capabilitySuggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No capability suggestions yet. Click "Discover Capabilities" to analyze your usage patterns!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {capabilitySuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-4 rounded-lg bg-card border border-border"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{suggestion.capability_name}</h4>
                          <Badge 
                            variant={suggestion.status === "pending" ? "outline" : suggestion.status === "approved" ? "default" : "secondary"}
                          >
                            {suggestion.status}
                          </Badge>
                          <Badge variant="outline">
                            {(suggestion.confidence_score * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.description}
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          💡 {suggestion.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

        {/* PHASE 3: A/B Testing & Memory Archive */}
        <ExperimentsCard experiments={experiments} />
        <MemoryArchiveCard 
          archivedMemories={archivedMemories}
          onRestore={restoreMemory}
        />

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
          </>
        )}
      </div>
      </div>
    </PageLayout>
  );
}
