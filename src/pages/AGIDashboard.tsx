import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Brain, Network, Target, Zap, MessageSquare, AlertTriangle, TrendingUp, Settings, Sparkles } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AGIDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [learningNetwork, setLearningNetwork] = useState<any[]>([]);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [metaMetrics, setMetaMetrics] = useState<any[]>([]);
  const [promptExperiments, setPromptExperiments] = useState<any[]>([]);
  const [emotionalInsights, setEmotionalInsights] = useState<any[]>([]);
  const [uncertaintyScores, setUncertaintyScores] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [learning, collab, pred, meta, prompts, emotion, uncertainty] = await Promise.all([
        supabase.from("agent_learning_network").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("agent_collaborations").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("capability_predictions").select("*").eq("status", "predicted").order("confidence_score", { ascending: false }),
        supabase.from("meta_learning_metrics").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("prompt_experiments").select("*").order("created_at", { ascending: false }),
        supabase.from("emotional_context").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("uncertainty_scores").select("*").order("created_at", { ascending: false }).limit(20),
      ]);

      setLearningNetwork(learning.data || []);
      setCollaborations(collab.data || []);
      setPredictions(pred.data || []);
      setMetaMetrics(meta.data || []);
      setPromptExperiments(prompts.data || []);
      setEmotionalInsights(emotion.data || []);
      setUncertaintyScores(uncertainty.data || []);
    } catch (error) {
      console.error("Error loading AGI dashboard:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const triggerMultiAgent = async () => {
    setLoading(true);
    try {
      const task = prompt("Enter a complex task for multi-agent collaboration:");
      if (!task) return;

      const { data, error } = await supabase.functions.invoke("multi-agent-orchestrator", {
        body: { task, requestedAgents: ["reasoning", "creative", "learning"] },
      });

      if (error) throw error;

      toast.success("Multi-agent collaboration completed!");
      loadDashboard();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Multi-agent collaboration failed");
    } finally {
      setLoading(false);
    }
  };

  const runPredictions = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("predict-capabilities");
      if (error) throw error;
      toast.success("Capability predictions generated!");
      loadDashboard();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const runMetaOptimization = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("meta-optimizer");
      if (error) throw error;
      toast.success("System parameters optimized!");
      loadDashboard();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Optimization failed");
    } finally {
      setLoading(false);
    }
  };

  const createPromptVariant = async (agentType: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("prompt-optimizer", {
        body: { action: "create_variant", agentType },
      });
      if (error) throw error;
      toast.success(`New prompt variant created for ${agentType}`);
      loadDashboard();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create variant");
    } finally {
      setLoading(false);
    }
  };

  const confirmPrediction = async (predictionId: string) => {
    try {
      await supabase.from("capability_predictions")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", predictionId);
      toast.success("Prediction confirmed!");
      loadDashboard();
    } catch (error) {
      toast.error("Failed to confirm");
    }
  };

  const rejectPrediction = async (predictionId: string) => {
    try {
      await supabase.from("capability_predictions")
        .update({ status: "rejected" })
        .eq("id", predictionId);
      toast.success("Prediction rejected");
      loadDashboard();
    } catch (error) {
      toast.error("Failed to reject");
    }
  };

  return (
    <AppLayout title="AGI Dashboard" showBottomNav>
      <SEO
        title="AGI Dashboard - Advanced AI Evolution"
        description="Monitor and control advanced AGI features including multi-agent collaboration, predictive capabilities, and meta-learning"
      />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Advanced AGI Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor autonomous evolution, multi-agent collaboration, and predictive intelligence
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadDashboard} variant="outline" disabled={loading}>
              Refresh
            </Button>
            <Button onClick={runMetaOptimization} disabled={loading}>
              <Settings className="w-4 h-4 mr-2" />
              Optimize System
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Network className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Learning Network</h3>
            </div>
            <p className="text-3xl font-bold">{learningNetwork.length}</p>
            <p className="text-sm text-muted-foreground">Shared learnings</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold">Collaborations</h3>
            </div>
            <p className="text-3xl font-bold">{collaborations.length}</p>
            <p className="text-sm text-muted-foreground">Multi-agent tasks</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Predictions</h3>
            </div>
            <p className="text-3xl font-bold">{predictions.length}</p>
            <p className="text-sm text-muted-foreground">Predicted capabilities</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Prompt Tests</h3>
            </div>
            <p className="text-3xl font-bold">{promptExperiments.filter(p => p.status === "testing").length}</p>
            <p className="text-sm text-muted-foreground">Active experiments</p>
          </Card>
        </div>

        <Tabs defaultValue="collaboration" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="collaboration">Multi-Agent</TabsTrigger>
            <TabsTrigger value="learning">Learning Network</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="prompts">Prompt Optimization</TabsTrigger>
            <TabsTrigger value="emotional">Emotional AI</TabsTrigger>
            <TabsTrigger value="uncertainty">Uncertainty</TabsTrigger>
          </TabsList>

          <TabsContent value="collaboration" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Multi-Agent Orchestration
                </h2>
                <Button onClick={triggerMultiAgent} disabled={loading}>
                  <Zap className="w-4 h-4 mr-2" />
                  New Collaboration
                </Button>
              </div>

              <div className="space-y-3">
                {collaborations.map((collab) => (
                  <Card key={collab.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {collab.agents_involved.map((agent: string) => (
                            <Badge key={agent} variant="secondary">{agent}</Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {collab.task_description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{collab.duration_ms}ms</span>
                          {collab.quality_score && (
                            <span>Quality: {(collab.quality_score * 100).toFixed(0)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="learning" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5" />
                Cross-Agent Learning Network
              </h2>

              {learningNetwork.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={learningNetwork.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="agent_type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="success_score" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              <div className="mt-4 space-y-2">
                {learningNetwork.slice(0, 10).map((learning) => (
                  <Card key={learning.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline">{learning.agent_type}</Badge>
                        <p className="text-sm mt-1">{learning.learning_event}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          Score: {(learning.success_score * 100).toFixed(0)}%
                        </p>
                        {learning.shared_to_agents && learning.shared_to_agents.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Shared to {learning.shared_to_agents.length} agents
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Predictive Capability Generation
                </h2>
                <Button onClick={runPredictions} disabled={loading}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Predictions
                </Button>
              </div>

              <div className="space-y-3">
                {predictions.map((pred) => (
                  <Card key={pred.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{pred.predicted_capability}</h3>
                          <Badge variant={pred.confidence_score > 0.8 ? "default" : "secondary"}>
                            {(pred.confidence_score * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{pred.reasoning}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => confirmPrediction(pred.id)}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => rejectPrediction(pred.id)}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {predictions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No predictions yet. Click "Generate Predictions" to start.
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Self-Optimizing Prompts
              </h2>

              <div className="grid gap-3 md:grid-cols-2 mb-4">
                {["reasoning", "creative", "learning", "coordinator"].map((agent) => (
                  <Button
                    key={agent}
                    variant="outline"
                    onClick={() => createPromptVariant(agent)}
                    disabled={loading}
                  >
                    Create {agent} variant
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                {promptExperiments.map((exp) => (
                  <Card key={exp.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge>{exp.agent_type}</Badge>
                          <Badge variant={exp.status === "winner" ? "default" : "secondary"}>
                            {exp.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {exp.prompt_variant.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p>Tests: {exp.test_count}</p>
                        <p>Satisfaction: {(exp.avg_satisfaction * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="emotional" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Emotional Intelligence Layer
              </h2>

              {emotionalInsights.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={emotionalInsights.slice(0, 10).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="detected_sentiment" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="intensity" stroke="hsl(var(--primary))" />
                  </LineChart>
                </ResponsiveContainer>
              )}

              <div className="mt-4 space-y-2">
                {emotionalInsights.slice(0, 10).map((insight) => (
                  <Card key={insight.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge>{insight.detected_sentiment}</Badge>
                        <p className="text-sm mt-1">
                          Tone: {insight.response_tone_adjustment}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Intensity: {(insight.intensity * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="uncertainty" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Uncertainty Quantification
              </h2>

              {uncertaintyScores.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={uncertaintyScores.slice(0, 10).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="agent_type" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="confidence_score" stroke="hsl(var(--primary))" />
                  </LineChart>
                </ResponsiveContainer>
              )}

              <div className="mt-4 space-y-2">
                {uncertaintyScores.slice(0, 10).map((score) => (
                  <Card key={score.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge>{score.agent_type}</Badge>
                        <p className="text-sm mt-1 line-clamp-2">{score.query}</p>
                        {score.uncertainty_reasons && score.uncertainty_reasons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {score.uncertainty_reasons.map((reason: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {(score.confidence_score * 100).toFixed(0)}%
                        </p>
                        {score.clarification_requested && (
                          <Badge variant="destructive" className="mt-1">
                            Clarification needed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}