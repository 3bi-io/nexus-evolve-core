import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Zap, Image, Workflow, TrendingUp, MessageSquare, 
  Eye, Code, Sparkles, Database, Bot, Clock, Shield, Search,
  ChevronRight, ExternalLink, BookOpen, Terminal, FileCode, Lightbulb
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/layout/PageLayout";
import { useNavigate } from "react-router-dom";

const platformFeatures = [
  {
    id: "xai-studio",
    icon: Sparkles,
    title: "XAI Studio",
    category: "Multi-Modal AI",
    description: "Chain vision analysis, image generation, code analysis, and reasoning in automated workflows",
    features: ["Grok Vision Analysis", "Gemini Image Generation", "Code Analysis", "Multi-Step Workflows"],
    apiEndpoint: "/functions/v1/xai-workflow-executor",
    usageExample: "POST with workflow steps array",
    link: "/xai-studio"
  },
  {
    id: "automation",
    icon: Workflow,
    title: "Automation Hub",
    category: "Workflows",
    description: "Build automated pipelines that run continuously or on schedule",
    features: ["Pipeline Builder", "Content Generation Queue", "Scheduled Execution", "Result Caching"],
    apiEndpoint: "/functions/v1/automation-pipeline-executor",
    usageExample: "Schedule pipelines with cron expressions",
    link: "/automation-hub"
  },
  {
    id: "monitoring",
    icon: TrendingUp,
    title: "Trend Monitoring",
    category: "Intelligence",
    description: "AI monitors social trends, competitors, and sentiment every 6 hours",
    features: ["Social Listening", "Competitor Analysis", "Sentiment Tracking", "Alert System"],
    apiEndpoint: "/functions/v1/scheduled-trend-monitor",
    usageExample: "Automated execution every 6 hours",
    link: "/social-intelligence"
  },
  {
    id: "agents",
    icon: Bot,
    title: "Custom Agents",
    category: "AI Agents",
    description: "Build intelligent agents with knowledge bases and custom instructions",
    features: ["Agent Builder", "Knowledge Upload", "Revenue Sharing", "Agent Marketplace"],
    apiEndpoint: "/functions/v1/custom-agent-executor",
    usageExample: "Execute agents with context",
    link: "/agent-studio"
  },
  {
    id: "vision",
    icon: Eye,
    title: "Vision Analysis",
    category: "Multi-Modal",
    description: "Analyze images with Grok Vision AI for detailed understanding",
    features: ["Image Captioning", "Object Detection", "Scene Understanding", "OCR"],
    apiEndpoint: "/functions/v1/xai-vision-analyzer",
    usageExample: "POST with image URL or base64",
    link: "/xai-studio"
  },
  {
    id: "generation",
    icon: Image,
    title: "Image Generation",
    category: "Multi-Modal",
    description: "Generate images from text prompts using Gemini Nano model",
    features: ["Text-to-Image", "Image Editing", "Style Transfer", "Batch Generation"],
    apiEndpoint: "/functions/v1/xai-image-generator",
    usageExample: "POST with prompt and parameters",
    link: "/multimodal-studio"
  },
  {
    id: "memory",
    icon: Brain,
    title: "Temporal Memory",
    category: "Context",
    description: "AI remembers every conversation with vector search and temporal scoring",
    features: ["Vector Embeddings", "Relevance Decay", "Smart Retrieval", "Context Building"],
    apiEndpoint: "/functions/v1/generate-embeddings",
    usageExample: "Automatic on message save",
    link: "/memory-graph"
  },
  {
    id: "caching",
    icon: Zap,
    title: "Smart Caching",
    category: "Performance",
    description: "Intelligent response caching reduces costs by 70% with automatic cleanup",
    features: ["Response Cache", "TTL Management", "Cost Optimization", "Hit Rate Analytics"],
    apiEndpoint: "Built into all AI functions",
    usageExample: "Automatic caching layer",
    link: "/router-dashboard"
  }
];

const apiReference = [
  {
    name: "XAI Workflow Executor",
    method: "POST",
    endpoint: "/functions/v1/xai-workflow-executor",
    description: "Execute multi-modal AI workflows",
    requestBody: {
      workflowId: "string (optional)",
      steps: "array of workflow steps",
      context: "object (optional)"
    },
    response: {
      success: "boolean",
      results: "array of step results",
      executionTime: "number"
    }
  },
  {
    name: "Automation Pipeline",
    method: "POST",
    endpoint: "/functions/v1/automation-pipeline-executor",
    description: "Execute automation pipelines",
    requestBody: {
      pipelineId: "string",
      manualRun: "boolean"
    },
    response: {
      executionId: "string",
      status: "string",
      results: "array"
    }
  },
  {
    name: "Vision Analyzer",
    method: "POST",
    endpoint: "/functions/v1/xai-vision-analyzer",
    description: "Analyze images with Grok Vision",
    requestBody: {
      imageUrl: "string",
      prompt: "string (optional)",
      analysisType: "caption | detect | ocr"
    },
    response: {
      analysis: "string",
      confidence: "number",
      metadata: "object"
    }
  },
  {
    name: "Image Generator",
    method: "POST",
    endpoint: "/functions/v1/xai-image-generator",
    description: "Generate images from text",
    requestBody: {
      prompt: "string",
      model: "google/gemini-2.5-flash-image-preview",
      size: "string (optional)"
    },
    response: {
      imageUrl: "string (base64)",
      prompt: "string"
    }
  },
  {
    name: "Custom Agent Executor",
    method: "POST",
    endpoint: "/functions/v1/custom-agent-executor",
    description: "Execute custom agents",
    requestBody: {
      agentId: "string",
      message: "string",
      context: "object (optional)"
    },
    response: {
      response: "string",
      confidence: "number",
      sources: "array"
    }
  }
];

const usageGuides = [
  {
    title: "Building Your First Workflow",
    icon: Workflow,
    steps: [
      "Navigate to Automation Hub",
      "Click 'Create Pipeline'",
      "Add workflow steps (Vision → Generation → Analysis)",
      "Configure execution schedule",
      "Test and activate"
    ],
    estimatedTime: "5 minutes"
  },
  {
    title: "Setting Up Trend Monitoring",
    icon: TrendingUp,
    steps: [
      "Go to Social Intelligence",
      "Create new monitor",
      "Define keywords and competitors",
      "Set alert thresholds",
      "Monitor runs every 6 hours automatically"
    ],
    estimatedTime: "3 minutes"
  },
  {
    title: "Creating Custom Agents",
    icon: Bot,
    steps: [
      "Open Agent Studio",
      "Define agent purpose and instructions",
      "Upload knowledge base documents",
      "Test agent responses",
      "Publish to marketplace (optional)"
    ],
    estimatedTime: "10 minutes"
  },
  {
    title: "Using Vision Analysis",
    icon: Eye,
    steps: [
      "Go to XAI Studio",
      "Select Vision Analysis workflow",
      "Upload or provide image URL",
      "Choose analysis type",
      "Review detailed insights"
    ],
    estimatedTime: "2 minutes"
  }
];

export default function Capabilities() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFeatures = platformFeatures.filter(
    feature =>
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout title="Platform Documentation" showBack={true} showBottomNav={true}>
      <SEO
        title="Platform Documentation - API Reference & Usage Guides"
        description="Comprehensive documentation for Oneiros AI Platform. Learn about multi-modal workflows, automation pipelines, vision analysis, and 38+ edge functions."
        keywords="AI documentation, API reference, platform guide, automation docs, vision API"
        canonical="https://oneiros.me/capabilities"
      />
      
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Platform Documentation</h1>
              <p className="text-muted-foreground">Complete guide to all features, APIs, and workflows</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search features, APIs, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="features" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Terminal className="w-4 h-4" />
              API Reference
            </TabsTrigger>
            <TabsTrigger value="guides" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Usage Guides
            </TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-4">
              {filteredFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(feature.link)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <CardTitle>{feature.title}</CardTitle>
                              <Badge variant="outline">{feature.category}</Badge>
                            </div>
                            <CardDescription className="text-base">{feature.description}</CardDescription>
                            
                            <div className="flex flex-wrap gap-2 pt-2">
                              {feature.features.map((f, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {f}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="border-t pt-4">
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">API Endpoint:</span>
                          <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">{feature.apiEndpoint}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Usage:</span>
                          <span className="ml-2 text-xs">{feature.usageExample}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Authentication
                </CardTitle>
                <CardDescription>
                  All API requests require authentication using Supabase JWT tokens. Include the token in the Authorization header.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="block bg-muted p-4 rounded-lg text-sm">
                  Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN
                </code>
              </CardContent>
            </Card>

            {apiReference.map((api, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{api.method}</Badge>
                        <CardTitle className="text-lg">{api.name}</CardTitle>
                      </div>
                      <CardDescription>{api.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Endpoint</p>
                    <code className="block bg-muted p-3 rounded text-sm">
                      {api.endpoint}
                    </code>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FileCode className="w-4 h-4" />
                        Request Body
                      </p>
                      <code className="block bg-muted p-3 rounded text-xs whitespace-pre">
                        {JSON.stringify(api.requestBody, null, 2)}
                      </code>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FileCode className="w-4 h-4" />
                        Response
                      </p>
                      <code className="block bg-muted p-3 rounded text-xs whitespace-pre">
                        {JSON.stringify(api.response, null, 2)}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Usage Guides Tab */}
          <TabsContent value="guides" className="space-y-4">
            {usageGuides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle>{guide.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{guide.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {guide.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {i + 1}
                          </span>
                          <span className="text-sm pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>Additional resources and support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/getting-started')}
                className="p-4 rounded-lg border bg-background hover:bg-muted transition-colors text-left"
              >
                <Sparkles className="w-5 h-5 text-primary mb-2" />
                <p className="font-medium">Getting Started</p>
                <p className="text-xs text-muted-foreground">New to the platform? Start here</p>
              </button>
              <button
                onClick={() => navigate('/xai-studio')}
                className="p-4 rounded-lg border bg-background hover:bg-muted transition-colors text-left"
              >
                <Workflow className="w-5 h-5 text-primary mb-2" />
                <p className="font-medium">Try XAI Studio</p>
                <p className="text-xs text-muted-foreground">Build your first workflow</p>
              </button>
              <button
                onClick={() => navigate('/agent-marketplace')}
                className="p-4 rounded-lg border bg-background hover:bg-muted transition-colors text-left"
              >
                <Bot className="w-5 h-5 text-primary mb-2" />
                <p className="font-medium">Agent Marketplace</p>
                <p className="text-xs text-muted-foreground">Browse ready-to-use agents</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
