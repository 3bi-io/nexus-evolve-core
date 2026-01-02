import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import { ScrollableTabs, TabsContent } from "@/components/ui/scrollable-tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Image,
  Eye,
  Code,
  Brain,
  Workflow,
  BarChart3,
  Sparkles,
  TrendingUp,
  Zap,
  DollarSign,
  LayoutDashboard,
} from "lucide-react";

// Import existing XAI components
import { ImageGenerationStudio } from "@/components/xai/ImageGenerationStudio";
import { VisionAnalyzer } from "@/components/xai/VisionAnalyzer";
import { GrokCodeAnalyzer } from "@/components/xai/GrokCodeAnalyzer";
import { ReasoningAssistant } from "@/components/xai/ReasoningAssistant";
import { MultiModalWorkflows } from "@/components/xai/MultiModalWorkflows";
import { TrustIndicators } from "@/components/xai/TrustIndicators";
import { LiveStatsBar } from "@/components/xai/dashboard/LiveStatsBar";
import { CategorySection } from "@/components/xai/dashboard/CategorySection";
import { ApplyAIBadge } from "@/components/xai/ApplyAIBadge";

const TABS = [
  { value: "dashboard", label: "Dashboard", shortLabel: "Home", icon: <LayoutDashboard className="w-4 h-4" /> },
  { value: "workflows", label: "Workflows", shortLabel: "Flows", icon: <Workflow className="w-4 h-4" /> },
  { value: "image-gen", label: "Image", shortLabel: "Image", icon: <Image className="w-4 h-4" /> },
  { value: "vision", label: "Vision", shortLabel: "Vision", icon: <Eye className="w-4 h-4" /> },
  { value: "code", label: "Code", shortLabel: "Code", icon: <Code className="w-4 h-4" /> },
  { value: "reasoning", label: "Reasoning", shortLabel: "Think", icon: <Brain className="w-4 h-4" /> },
  { value: "analytics", label: "Analytics", shortLabel: "Stats", icon: <BarChart3 className="w-4 h-4" /> },
];

export default function AIStudio() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";
  
  const [stats, setStats] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: xaiData, error: xaiError } = await supabase
        .from("xai_usage_analytics")
        .select("*")
        .eq("user_id", user?.id)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      if (xaiError) throw xaiError;

      const totalRequests = xaiData?.length || 0;
      const successfulRequests = xaiData?.filter((a) => a.success)?.length || 0;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
      const avgResponseTime = totalRequests > 0
        ? xaiData.reduce((sum, a) => sum + (a.latency_ms || 0), 0) / totalRequests
        : 0;
      const creditsUsed = xaiData?.reduce((sum, a) => sum + (a.cost_credits || 0), 0) || 0;

      setStats({
        totalRequests,
        successRate,
        avgResponseTime,
        creditsUsed,
      });

      if (xaiData && xaiData.length > 0) {
        const byModel = xaiData.reduce((acc: any, a) => {
          acc[a.model_id] = (acc[a.model_id] || 0) + 1;
          return acc;
        }, {});
        const byFeature = xaiData.reduce((acc: any, a) => {
          acc[a.feature_type] = (acc[a.feature_type] || 0) + 1;
          return acc;
        }, {});
        const totalCost = xaiData.reduce((acc, a) => acc + (a.cost_credits || 0), 0);

        setAnalyticsData({
          byModel,
          byFeature,
          totalCost,
          totalRequests,
          successRate,
          avgLatency: avgResponseTime,
        });
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load AI Studio data");
    } finally {
      setLoading(false);
    }
  };

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const creativeFeatures = [
    {
      icon: Image,
      title: "Image Generation",
      description: "Generate stunning images from text prompts",
      route: "/ai-studio?tab=image-gen",
      status: "available" as const,
    },
    {
      icon: Workflow,
      title: "Multimodal Workflows",
      description: "Chain AI capabilities with pre-built templates",
      route: "/ai-studio?tab=workflows",
      status: "available" as const,
    },
  ];

  const intelligenceFeatures = [
    {
      icon: Eye,
      title: "Vision Analyzer",
      description: "Understand and analyze images with AI vision",
      route: "/ai-studio?tab=vision",
      status: "available" as const,
    },
    {
      icon: Code,
      title: "Code Analyzer",
      description: "Review code, detect bugs, and optimize",
      route: "/ai-studio?tab=code",
      status: "available" as const,
    },
    {
      icon: Brain,
      title: "Deep Reasoning",
      description: "Step-by-step problem solving with citations",
      route: "/ai-studio?tab=reasoning",
      status: "available" as const,
    },
  ];

  return (
    <PageLayout>
      <SEO
        title="AI Studio - Unified AI Tools Hub | Oneiros"
        description="Access all AI tools in one place. Image generation, vision analysis, code review, reasoning, and multimodal workflows powered by Grok."
        keywords="AI studio, Grok, image generation, vision AI, code analysis, reasoning AI, multimodal workflows"
        canonical="https://oneiros.me/ai-studio"
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">AI Studio</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                All AI tools in one place
              </p>
            </div>
          </div>
          <ApplyAIBadge variant="full" />
        </div>

        <TrustIndicators />

        <ScrollableTabs tabs={TABS} value={activeTab} onValueChange={setTab}>
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 md:space-y-8">
            <LiveStatsBar stats={stats} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <CategorySection
                title="🎨 Creative Studio"
                description="Generate and create with AI"
                features={creativeFeatures}
              />

              <CategorySection
                title="🧠 Intelligence & Analysis"
                description="Vision, code, and reasoning tools"
                features={intelligenceFeatures}
              />
            </div>
          </TabsContent>

          {/* Tools Tabs */}
          <TabsContent value="workflows">
            <MultiModalWorkflows />
          </TabsContent>

          <TabsContent value="image-gen">
            <ImageGenerationStudio />
          </TabsContent>

          <TabsContent value="vision">
            <VisionAnalyzer />
          </TabsContent>

          <TabsContent value="code">
            <GrokCodeAnalyzer />
          </TabsContent>

          <TabsContent value="reasoning">
            <ReasoningAssistant />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-28 md:h-32" />
                ))}
              </div>
            ) : !analyticsData ? (
              <Card className="p-8 md:p-12 text-center">
                <BarChart3 className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Start using AI tools to see usage analytics here
                </p>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                        <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground">Requests</p>
                        <p className="text-xl md:text-2xl font-bold">{analyticsData.totalRequests}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2 md:p-3 rounded-lg bg-green-500/10">
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground">Success</p>
                        <p className="text-xl md:text-2xl font-bold">{analyticsData.successRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2 md:p-3 rounded-lg bg-blue-500/10">
                        <Zap className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground">Latency</p>
                        <p className="text-xl md:text-2xl font-bold">{analyticsData.avgLatency.toFixed(0)}ms</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2 md:p-3 rounded-lg bg-purple-500/10">
                        <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground">Credits</p>
                        <p className="text-xl md:text-2xl font-bold">{analyticsData.totalCost}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <Card className="p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold mb-4">Usage by Model</h3>
                    <div className="space-y-3">
                      {Object.entries(analyticsData.byModel ?? {}).map(([model, count]: [string, any]) => (
                        <div key={model} className="flex items-center justify-between">
                          <span className="text-sm truncate max-w-[150px] md:max-w-[200px]">{model}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                      {Object.keys(analyticsData.byModel ?? {}).length === 0 && (
                        <p className="text-sm text-muted-foreground">No model data</p>
                      )}
                    </div>
                  </Card>

                  <Card className="p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold mb-4">Usage by Feature</h3>
                    <div className="space-y-3">
                      {Object.entries(analyticsData.byFeature ?? {}).map(([feature, count]: [string, any]) => (
                        <div key={feature} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{feature.replace(/-/g, ' ')}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                      {Object.keys(analyticsData.byFeature ?? {}).length === 0 && (
                        <p className="text-sm text-muted-foreground">No feature data</p>
                      )}
                    </div>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </ScrollableTabs>
      </div>
    </PageLayout>
  );
}
