import { useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Store,
  Bot,
  Plus,
  Library,
  Sparkles,
  TrendingUp,
  BarChart3,
  DollarSign,
  Download,
  Users,
  Star,
  Activity,
  Clock,
  Zap,
} from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { UpgradePrompt } from "@/components/stripe/UpgradePrompt";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Import existing agent components
import { AgentBuilder } from "@/components/agents/AgentBuilder";
import { AgentTemplates } from "@/components/agents/AgentTemplates";
import { MyAgents } from "@/components/agents/MyAgents";
import { AgentMarketplaceCard } from "@/components/agents/AgentMarketplaceCard";

const COLORS = ["#8B5CF6", "#D946EF", "#F97316", "#10B981", "#3B82F6"];

export default function AgentsHub() {
  const { user } = useAuth();
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "marketplace";
  const { canAccess: canCreateAgents, requiredTier: createTier } = useFeatureAccess("customAgents");

  // Revenue state
  const [agents, setAgents] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [revenueLoading, setRevenueLoading] = useState(true);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Marketplace state
  const [marketplaceAgents, setMarketplaceAgents] = useState<any[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);

  useEffect(() => {
    if (agentId) {
      setSearchParams({ tab: "create" });
    }
  }, [agentId]);

  useEffect(() => {
    loadMarketplace();
    if (user) {
      loadAgentRevenue();
      loadAnalytics();
    }
  }, [user]);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const loadMarketplace = async () => {
    try {
      setMarketplaceLoading(true);
      const { data, error } = await supabase
        .from("agent_marketplace")
        .select("*")
        .eq("is_active", true)
        .order("sales_count", { ascending: false })
        .limit(20);

      if (error) throw error;
      setMarketplaceAgents((data as any[]) || []);
    } catch (error) {
      console.error("Error loading marketplace:", error);
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const loadAgentRevenue = async () => {
    if (!user) return;
    try {
      setRevenueLoading(true);
      const { data } = await supabase
        .from("custom_agents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }) as { data: any[] | null };

      setAgents(data || []);
      const total = data?.reduce((sum: number, agent: any) => sum + Number(agent.total_revenue || 0), 0) || 0;
      setTotalRevenue(total);

      const { data: purchaseData } = await supabase
        .from("agent_purchases")
        .select("*")
        .eq("seller_id", user.id)
        .order("purchased_at", { ascending: false })
        .limit(50) as { data: any[] | null };

      setPurchases(purchaseData || []);
      setTotalSales(purchaseData?.length || 0);
    } catch (error) {
      console.error("Error loading revenue:", error);
    } finally {
      setRevenueLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!user) return;
    try {
      setAnalyticsLoading(true);
      const { data: executions } = await supabase
        .from("agent_executions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (executions && executions.length > 0) {
        const successCount = executions.filter(e => e.success).length;
        const avgTime = executions.reduce((sum, e) => sum + (e.execution_time_ms || 0), 0) / executions.length;
        const totalCredits = executions.reduce((sum, e) => sum + (e.cost_credits || 0), 0);

        setAnalyticsData({
          totalExecutions: executions.length,
          successRate: (successCount / executions.length * 100).toFixed(1),
          avgResponseTime: Math.round(avgTime),
          totalCreditsUsed: totalCredits,
        });
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const exportRevenue = () => {
    const csv = [
      ["Agent Name", "Pricing Model", "Price", "Total Sales", "Total Revenue", "Revenue Share"],
      ...agents.map(agent => [
        agent.name,
        agent.pricing_model,
        agent.price_amount,
        agent.usage_count,
        agent.total_revenue,
        `${agent.revenue_share_percent}%`,
      ]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent-revenue-report.csv";
    a.click();
    toast.success("Report downloaded");
  };

  const revenueByAgent = agents.map(agent => ({
    name: agent.name,
    revenue: Number(agent.total_revenue || 0),
  }));

  return (
    <PageLayout>
      <SEO
        title="Agents Hub - Build, Deploy & Monetize AI Agents | Oneiros"
        description="Your complete AI agent platform. Browse the marketplace, build custom agents, track analytics, and monetize your creations."
        keywords="AI agents, agent marketplace, custom agents, agent builder, agent monetization"
        canonical="https://oneiros.me/agents"
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Agents Hub</h1>
            <p className="text-muted-foreground">
              Build, deploy, and monetize AI agents
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-3xl">
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Market</span>
            </TabsTrigger>
            <TabsTrigger value="my-agents" className="flex items-center gap-2">
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">My Agents</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Agent Marketplace</h2>
                <p className="text-muted-foreground">Discover and deploy specialized AI agents</p>
              </div>
              <Button onClick={() => setTab("create")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
            </div>

            {marketplaceLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}
              </div>
            ) : marketplaceAgents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceAgents.map((listing) => (
                  <AgentMarketplaceCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Agents Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to publish an agent to the marketplace
                </p>
                <Button onClick={() => setTab("create")}>Create Your First Agent</Button>
              </Card>
            )}
          </TabsContent>

          {/* My Agents Tab */}
          <TabsContent value="my-agents">
            <MyAgents />
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create">
            {canCreateAgents ? (
              <AgentBuilder agentId={agentId} />
            ) : createTier ? (
              <UpgradePrompt 
                feature="Custom Agent Builder" 
                requiredTier={createTier} 
                variant="card" 
              />
            ) : null}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <AgentTemplates />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : analyticsData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Executions</p>
                        <p className="text-2xl font-bold">{analyticsData.totalExecutions}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold">{analyticsData.successRate}%</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <Clock className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Response</p>
                        <p className="text-2xl font-bold">{analyticsData.avgResponseTime}ms</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-purple-500/10">
                        <Zap className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Credits Used</p>
                        <p className="text-2xl font-bold">{analyticsData.totalCreditsUsed}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <Card className="p-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
                <p className="text-muted-foreground">
                  Start using agents to see performance analytics
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Agent Revenue</h2>
                <p className="text-muted-foreground">Monitor earnings from your agents</p>
              </div>
              <Button onClick={exportRevenue} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {revenueLoading ? (
              <div className="grid md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <p className="text-2xl font-bold">{totalSales}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/10 rounded-lg">
                        <Users className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Published Agents</p>
                        <p className="text-2xl font-bold">{agents.length}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-500/10 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Rating</p>
                        <p className="text-2xl font-bold">
                          {(agents.reduce((sum, a) => sum + (a.rating_avg || 0), 0) / agents.length || 0).toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {agents.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Revenue by Agent</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={revenueByAgent}
                            dataKey="revenue"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {revenueByAgent.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Your Agents</h3>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {agents.map((agent) => (
                          <div key={agent.id} className="flex items-center justify-between border-b pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{agent.name}</span>
                                <Badge variant="outline" className="capitalize text-xs">
                                  {agent.pricing_model}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">${Number(agent.total_revenue).toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">{agent.usage_count} sales</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {agents.length === 0 && (
                  <Card className="p-12 text-center">
                    <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Paid Agents Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Publish agents with pricing to start earning revenue
                    </p>
                    <Button onClick={() => setTab("create")}>Create Paid Agent</Button>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
