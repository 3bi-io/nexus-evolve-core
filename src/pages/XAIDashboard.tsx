import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import { XAIDashboardHero } from "@/components/xai/dashboard/XAIDashboardHero";
import { LiveStatsBar } from "@/components/xai/dashboard/LiveStatsBar";
import { ActivityFeed } from "@/components/xai/dashboard/ActivityFeed";
import { CategorySection } from "@/components/xai/dashboard/CategorySection";
import { FeatureMatrix } from "@/components/xai/dashboard/FeatureMatrix";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Image,
  Eye,
  Code,
  Brain,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Search,
  Workflow,
  BarChart3,
  Target,
} from "lucide-react";

export default function XAIDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from("xai_usage_analytics")
        .select("*")
        .eq("user_id", user?.id)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      if (analyticsError) throw analyticsError;

      // Calculate stats
      const totalRequests = analyticsData?.length || 0;
      const successfulRequests = analyticsData?.filter((a) => a.success)?.length || 0;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
      const avgResponseTime = totalRequests > 0
        ? analyticsData.reduce((sum, a) => sum + (a.latency_ms || 0), 0) / totalRequests
        : 0;
      const creditsUsed = analyticsData?.reduce((sum, a) => sum + (a.cost_credits || 0), 0) || 0;

      setStats({
        totalRequests,
        successRate,
        avgResponseTime,
        creditsUsed,
      });

      // Transform to activities
      const recentActivities = analyticsData?.slice(0, 10).map((item) => ({
        id: item.id,
        feature: item.feature_type || "unknown",
        timestamp: item.created_at,
        status: item.success ? "success" : "failed",
        duration: item.latency_ms,
      })) || [];

      setActivities(recentActivities);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const creativeFeatures = [
    {
      icon: Image,
      title: "Image Generation",
      description: "Generate stunning images from text prompts using Aurora",
      route: "/xai-studio?tab=image-gen",
      status: "available" as const,
    },
    {
      icon: Workflow,
      title: "Multimodal Workflows",
      description: "Chain AI capabilities with pre-built workflow templates",
      route: "/xai-studio?tab=workflows",
      status: "available" as const,
    },
    {
      icon: Sparkles,
      title: "Viral Content Studio",
      description: "Create engaging social media content with AI assistance",
      route: "/social-intelligence",
      status: "available" as const,
    },
  ];

  const intelligenceFeatures = [
    {
      icon: TrendingUp,
      title: "Trending Topics",
      description: "Real-time X (Twitter) trends with live data and insights",
      route: "/social-intelligence?tab=trends",
      status: "available" as const,
    },
    {
      icon: MessageSquare,
      title: "Sentiment Analysis",
      description: "Analyze public sentiment on any topic or brand",
      route: "/social-intelligence?tab=sentiment",
      status: "available" as const,
    },
    {
      icon: BarChart3,
      title: "Trend Prediction",
      description: "24-hour trend forecasting powered by Grok",
      route: "/social-intelligence",
      status: "available" as const,
    },
    {
      icon: Search,
      title: "Real-time Search",
      description: "Grok-powered search with citations and sources",
      route: "/xai-studio?tab=reasoning",
      status: "available" as const,
    },
  ];

  const visionCodeFeatures = [
    {
      icon: Eye,
      title: "Vision Analyzer",
      description: "Understand and analyze images with AI vision capabilities",
      route: "/xai-studio?tab=vision",
      status: "available" as const,
    },
    {
      icon: Code,
      title: "Code Analyzer",
      description: "Review code, detect bugs, and optimize performance",
      route: "/xai-studio?tab=code",
      status: "available" as const,
    },
  ];

  const reasoningFeatures = [
    {
      icon: Brain,
      title: "Deep Reasoning",
      description: "Step-by-step problem solving with citations and sources",
      route: "/xai-studio?tab=reasoning",
      status: "available" as const,
    },
    {
      icon: Target,
      title: "Problem Solver",
      description: "Structured problem breakdown and solution generation",
      route: "/problem-solver",
      status: "available" as const,
    },
  ];

  return (
    <PageLayout>
      <SEO
        title="XAI Dashboard - All Grok Features in One Place"
        description="Unified dashboard for all Grok-powered AI features. Image generation, vision analysis, code review, reasoning, social intelligence, and more."
        keywords="XAI dashboard, Grok features, AI tools hub, unified AI interface, image generation, code analysis"
        canonical="https://oneiros.me/xai-dashboard"
      />

      <div className="container max-w-7xl py-8 space-y-8">
        <XAIDashboardHero apiHealth="healthy" />

        <LiveStatsBar stats={stats} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CategorySection
              title="🎨 Creative Studio"
              description="Generate and create with AI"
              features={creativeFeatures}
            />

            <CategorySection
              title="🧠 Intelligence & Analysis"
              description="Real-time insights and social intelligence"
              features={intelligenceFeatures}
            />

            <CategorySection
              title="👁️ Vision & Code"
              description="Understand images and analyze code"
              features={visionCodeFeatures}
            />

            <CategorySection
              title="🎯 Reasoning & Problem Solving"
              description="Deep thinking and structured solutions"
              features={reasoningFeatures}
            />
          </div>

          <div className="space-y-8">
            <ActivityFeed activities={activities} loading={loading} />
          </div>
        </div>

        <FeatureMatrix />
      </div>
    </PageLayout>
  );
}
