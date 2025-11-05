import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, Sparkles, Store, MessageSquare, Mic, BarChart3, 
  Brain, Network, Layers, Building2, Settings, Shield, 
  FileText, Zap, Users, Globe, Webhook, Box, TrendingUp,
  Award, Gift, Activity, Cpu, Binary, Code, BookOpen,
  LineChart, PieChart, Database, Terminal
} from "lucide-react";

interface SitemapLink {
  path: string;
  title: string;
  description?: string;
  icon: React.ElementType;
}

interface SitemapSection {
  title: string;
  description: string;
  links: SitemapLink[];
  icon: React.ElementType;
}

const sitemapSections: SitemapSection[] = [
  {
    title: "Public Pages",
    description: "Accessible to all visitors",
    icon: Globe,
    links: [
      { path: "/", title: "Home", description: "Landing page and AI chat interface", icon: Home },
      { path: "/getting-started", title: "Getting Started", description: "Quick start guide", icon: BookOpen },
      { path: "/pricing", title: "Pricing", description: "Plans and pricing information", icon: Sparkles },
      { path: "/agent-marketplace", title: "Agent Marketplace", description: "Browse and discover AI agents", icon: Store },
      { path: "/model-comparison", title: "Model Comparison", description: "Compare AI model performance", icon: BarChart3 },
      { path: "/voice-agent", title: "Voice Agent", description: "Voice-powered AI assistant", icon: Mic },
      { path: "/auth", title: "Sign In / Sign Up", description: "Authentication page", icon: Users },
    ]
  },
  {
    title: "AI Studio",
    description: "Create and interact with AI",
    icon: Brain,
    links: [
      { path: "/agent-studio", title: "Agent Studio", description: "Build custom AI agents", icon: Zap },
      { path: "/multimodal-studio", title: "Multimodal Studio", description: "Work with text, images, and voice", icon: Layers },
      { path: "/problem-solver", title: "Problem Solver", description: "AI-powered problem solving", icon: Brain },
      { path: "/ai-hub", title: "AI Hub", description: "Central AI management hub", icon: Cpu },
      { path: "/browser-ai", title: "Browser AI", description: "AI models running in your browser", icon: Binary },
      { path: "/advanced-browser-ai", title: "Advanced Browser AI", description: "Advanced local AI capabilities", icon: Code },
      { path: "/voice-agent-manager", title: "Voice Agent Manager", description: "Manage voice AI agents", icon: Mic },
    ]
  },
  {
    title: "Intelligence & Analytics",
    description: "Insights and data visualization",
    icon: LineChart,
    links: [
      { path: "/analytics", title: "Analytics Dashboard", description: "Usage and performance metrics", icon: PieChart },
      { path: "/advanced-analytics", title: "Advanced Analytics", description: "In-depth analytics tools", icon: LineChart },
      { path: "/llm-analytics", title: "LLM Analytics", description: "Language model performance tracking", icon: BarChart3 },
      { path: "/agent-analytics", title: "Agent Analytics", description: "Custom agent performance metrics", icon: TrendingUp },
      { path: "/usage-analytics", title: "Usage Analytics", description: "Detailed usage statistics", icon: Activity },
      { path: "/knowledge-graph", title: "Knowledge Graph", description: "Visual knowledge representation", icon: Network },
      { path: "/memory-graph", title: "Memory Graph", description: "AI memory visualization", icon: Database },
    ]
  },
  {
    title: "Agents",
    description: "Manage and monetize AI agents",
    icon: Zap,
    links: [
      { path: "/agent-marketplace", title: "Agent Marketplace", description: "Discover and share agents", icon: Store },
      { path: "/agent-executor", title: "Agent Executor", description: "Execute agent workflows", icon: Terminal },
      { path: "/agent-revenue", title: "Agent Revenue", description: "Track agent monetization", icon: TrendingUp },
    ]
  },
  {
    title: "Enterprise",
    description: "Team collaboration and integrations",
    icon: Building2,
    links: [
      { path: "/teams", title: "Teams", description: "Team management and collaboration", icon: Users },
      { path: "/api-access", title: "API Access", description: "Developer API access", icon: Code },
      { path: "/webhooks", title: "Webhooks", description: "Configure webhooks and integrations", icon: Webhook },
      { path: "/integrations", title: "Integrations", description: "Third-party integrations", icon: Box },
      { path: "/collaboration", title: "Collaboration", description: "Real-time team collaboration", icon: MessageSquare },
    ]
  },
  {
    title: "System & Advanced",
    description: "System monitoring and evolution",
    icon: Activity,
    links: [
      { path: "/evolution", title: "Evolution", description: "AI system self-improvement tracking", icon: TrendingUp },
      { path: "/agi-dashboard", title: "AGI Dashboard", description: "Artificial General Intelligence metrics", icon: Brain },
      { path: "/system-health", title: "System Health", description: "Platform health monitoring", icon: Activity },
      { path: "/capabilities", title: "Capabilities", description: "System capabilities overview", icon: Zap },
      { path: "/router-dashboard", title: "Router Dashboard", description: "AI routing analytics", icon: Network },
      { path: "/enterprise-router", title: "Enterprise Router", description: "Advanced routing controls", icon: Layers },
      { path: "/unified-router-demo", title: "Unified Router Demo", description: "Demo of unified routing", icon: Code },
      { path: "/social-intelligence", title: "Social Intelligence", description: "Social media insights", icon: TrendingUp },
      { path: "/advanced-ai", title: "Advanced AI", description: "Cutting-edge AI features", icon: Cpu },
    ]
  },
  {
    title: "Account & Settings",
    description: "Personal account management",
    icon: Settings,
    links: [
      { path: "/account", title: "Account Settings", description: "Manage your account", icon: Settings },
      { path: "/achievements", title: "Achievements", description: "Track your milestones", icon: Award },
      { path: "/referrals", title: "Referrals", description: "Invite friends and earn rewards", icon: Gift },
    ]
  },
  {
    title: "Administration",
    description: "System administration (Super Admin only)",
    icon: Shield,
    links: [
      { path: "/admin", title: "Super Admin Panel", description: "System administration dashboard", icon: Shield },
    ]
  },
  {
    title: "Legal",
    description: "Terms and policies",
    icon: FileText,
    links: [
      { path: "/privacy", title: "Privacy Policy", description: "How we protect your data", icon: FileText },
      { path: "/terms", title: "Terms of Service", description: "Terms and conditions", icon: FileText },
    ]
  },
];

export default function Sitemap() {
  return (
    <PageLayout>
      <Helmet>
        <title>Sitemap - Oneiros.me | Explore All Features</title>
        <meta 
          name="description" 
          content="Complete sitemap of Oneiros.me - Explore all AI features, tools, and resources. Find analytics, agent marketplace, voice AI, integrations, and more." 
        />
        <meta name="keywords" content="sitemap, AI tools, navigation, features, Oneiros platform map" />
        <link rel="canonical" href="https://oneiros.me/sitemap" />
      </Helmet>

      <div className="container-mobile py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight">Platform Sitemap</h1>
          <p className="text-lg text-muted-foreground">
            Complete overview of all features and pages available on Oneiros.me. 
            Explore our AI-powered tools, analytics, integrations, and more.
          </p>
        </div>

        {/* Sitemap Sections */}
        <div className="grid gap-6">
          {sitemapSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <Card key={section.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <SectionIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.links.map((link) => {
                      const LinkIcon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                        >
                          <LinkIcon className="w-4 h-4 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium group-hover:text-primary transition-colors">
                              {link.title}
                            </div>
                            {link.description && (
                              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {link.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Note */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            <p>
              Can't find what you're looking for? <Link to="/getting-started" className="text-primary hover:underline">Check our Getting Started guide</Link> or{" "}
              <Link to="/auth" className="text-primary hover:underline">sign in</Link> to access more features.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
