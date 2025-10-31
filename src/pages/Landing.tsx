import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { SEO } from "@/components/SEO";
import {
  Brain,
  Network,
  TrendingUp,
  GitBranch,
  Zap,
  Shield,
  Database,
  MessageSquare,
  BarChart3,
  Sparkles,
  Check,
  ArrowRight,
  Phone,
  Store,
  Image,
  Users,
  Globe,
  Trophy,
  Workflow,
} from "lucide-react";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { TrustSignals } from "@/components/landing/TrustSignals";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect authenticated users to chat
  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Phone,
      title: "Voice AI Agents",
      description: "Real-time conversational AI powered by ElevenLabs with natural voice interactions and function calling",
      badge: "New",
    },
    {
      icon: Network,
      title: "Multi-Agent Orchestration",
      description: "5 specialized agents (Coordinator, Reasoning, Creative, Learning, Grok Reality) work in harmony",
      badge: null,
    },
    {
      icon: Store,
      title: "Agent Marketplace",
      description: "Create, share, and monetize custom AI agents. Build your own or use community agents",
      badge: "Popular",
    },
    {
      icon: Image,
      title: "Multimodal Studio",
      description: "Generate images, convert speech to text, text to speech, and process multiple media types",
      badge: null,
    },
    {
      icon: Globe,
      title: "Social Intelligence",
      description: "Real-time trend analysis, viral content creation, and sentiment tracking with Grok integration",
      badge: null,
    },
    {
      icon: GitBranch,
      title: "Knowledge Graphs",
      description: "Visual semantic networks with vector embeddings for intelligent information retrieval",
      badge: null,
    },
    {
      icon: Trophy,
      title: "Gamification System",
      description: "Achievements, referral rewards, and engagement tracking to boost user motivation",
      badge: null,
    },
    {
      icon: TrendingUp,
      title: "Autonomous Evolution",
      description: "Self-learning system that discovers new capabilities and optimizes performance daily",
      badge: null,
    },
    {
      icon: Workflow,
      title: "Integration Hub",
      description: "Connect with Zapier, webhooks, and custom APIs to automate your workflows",
      badge: null,
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Chat & Interact",
      description: "Engage in natural conversations. The system learns from every interaction, building semantic understanding.",
      icon: MessageSquare,
    },
    {
      number: "02",
      title: "Extract Learnings",
      description: "AI automatically identifies patterns, extracts insights, and builds a structured knowledge graph.",
      icon: Database,
    },
    {
      number: "03",
      title: "Evolve Daily",
      description: "Autonomous optimization cycles analyze performance metrics and improve system capabilities.",
      icon: Zap,
    },
  ];

  const benefits = [
    "Voice AI with ElevenLabs integration",
    "5-agent orchestration system",
    "Custom agent builder & marketplace",
    "Real-time social intelligence",
    "Vector-based semantic search",
    "Multimodal capabilities (text, image, voice)",
    "Time-based credit system",
    "Gamification & achievements",
    "Mobile-responsive PWA",
    "Enterprise-grade security",
    "Built on React, Supabase, OpenAI",
    "Self-evolving autonomous AI",
  ];

  return (
    <PageTransition>
      <SEO 
        title="The Most Advanced AI Platform - Voice AI, Multi-Agent System & More"
        description="Experience 9 integrated AI systems: Voice conversations with ElevenLabs, multi-agent orchestration, agent marketplace, social intelligence powered by Grok, multimodal capabilities, and autonomous evolution. Start with 500 free daily credits."
        keywords="AI platform, voice AI, multi-agent system, agent marketplace, ChatGPT alternative, ElevenLabs integration, Grok AI, multimodal AI, autonomous AI"
        canonical="https://oneiros.me"
        ogImage="/og-image-new.png"
        schema={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Oneiros.me",
          "applicationCategory": "BusinessApplication",
          "offers": {
            "@type": "AggregateOffer",
            "lowPrice": "0",
            "highPrice": "999",
            "priceCurrency": "USD"
          },
          "description": "The most advanced AI platform with voice AI, multi-agent orchestration, and social intelligence",
          "operatingSystem": "Web",
          "url": "https://oneiros.me"
        }}
      />
      <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            <span className="font-bold text-lg md:text-xl">Oneiros.me</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <Button onClick={() => navigate('/chat')} size="sm" className="md:h-10">Dashboard</Button>
            ) : (
              <>
                <Button onClick={() => navigate('/chat')} size="sm" className="md:h-10">Try Free</Button>
                <Button onClick={() => navigate('/auth')} variant="ghost" size="sm" className="hidden sm:flex md:h-10">Sign In</Button>
                <Button onClick={() => navigate('/pricing')} variant="outline" size="sm" className="md:h-10">Pricing</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 md:pt-32 pb-12 md:pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-center lg:text-left space-y-4 md:space-y-6 animate-fade-in">
              <Badge variant="secondary" className="mb-2 md:mb-4 text-xs md:text-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Production-Ready AI Platform
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                The Most Advanced
                <span className="bg-gradient-to-r from-[hsl(var(--ai-gradient-start))] to-[hsl(var(--ai-gradient-end))] bg-clip-text text-transparent block mt-1">
                  AI Platform Ever Built
                </span>
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
                Multi-agent orchestration • Voice AI • Agent marketplace • Social intelligence • Self-learning evolution. 
                Experience the future of AI with 9 integrated systems working together seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start pt-2 md:pt-4">
                <Button size="lg" className="text-base md:text-lg px-6 md:px-8 hover-scale w-full sm:w-auto" onClick={() => navigate("/chat")}>
                  Try Now Free
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Button>
                {!user && (
                  <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 w-full sm:w-auto" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Start with Starter plan at $49/month • 500 credits
              </p>
            </div>
            
            <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <InteractiveDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Revolutionary AI Capabilities</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              9 integrated systems working together to deliver the most advanced AI experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1 group">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      {feature.badge && (
                        <Badge variant={feature.badge === "New" ? "default" : "secondary"} className="text-xs">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">How It Works</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Three simple steps to autonomous AI evolution
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-border -z-10"></div>
                  )}
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto relative">
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                        {step.number}
                      </span>
                      <Icon className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Trusted by Thousands</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground px-4">
              Join a growing community of users building with AI
            </p>
          </div>
          
          <TrustSignals />

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Enterprise Features</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {benefits.slice(0, 6).map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Zap className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Built for Scale</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {benefits.slice(6).map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Simple, Transparent Pricing</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Choose the plan that fits your needs. Start from $49/month.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-2xl font-bold">Starter</h3>
                <div className="text-4xl font-bold">$49</div>
                <p className="text-muted-foreground">500 credits/month</p>
                <Button variant="outline" className="w-full" onClick={() => navigate("/pricing")}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
            <Card className="border-primary shadow-lg">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Professional</h3>
                  <Badge>Popular</Badge>
                </div>
                <div className="text-4xl font-bold">$149</div>
                <p className="text-muted-foreground">2,000 credits/month</p>
                <Button className="w-full" onClick={() => navigate("/pricing")}>
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-2xl font-bold">Enterprise</h3>
                <div className="text-4xl font-bold">$999</div>
                <p className="text-muted-foreground">Unlimited credits</p>
                <Button variant="outline" className="w-full" onClick={() => navigate("/pricing")}>
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Button variant="link" onClick={() => navigate("/pricing")}>
              View detailed pricing comparison →
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-8 pb-8 md:pt-12 md:pb-12 text-center space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold px-4">Ready to Experience the Future?</h2>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Join thousands of users building with the most advanced AI platform. Voice AI, multi-agent orchestration, 
                social intelligence, and more—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-2 md:pt-4 px-4">
                <Button size="lg" className="text-base md:text-lg px-6 md:px-8 w-full sm:w-auto" onClick={() => navigate("/auth")}>
                  Create Your Account
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 w-full sm:w-auto">
                  Contact Sales
                </Button>
              </div>
              <p className="text-sm text-muted-foreground pt-4">
                Questions? Contact{" "}
                <a href="mailto:c@3bi.io" className="text-primary hover:underline">
                  c@3bi.io
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-semibold">Oneiros.me</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">Documentation</button>
              <button className="hover:text-foreground transition-colors">Privacy</button>
              <button className="hover:text-foreground transition-colors">Terms</button>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Oneiros.me. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </PageTransition>
  );
};

export default Landing;
