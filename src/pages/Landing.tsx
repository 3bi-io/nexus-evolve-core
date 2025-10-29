import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
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
} from "lucide-react";

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
      icon: Network,
      title: "Multi-Agent System",
      description: "Specialized agents (Coordinator, Reasoning, Creative, Learning) work together for optimal responses",
    },
    {
      icon: Brain,
      title: "Semantic Memory",
      description: "Vector-based knowledge storage with intelligent retrieval and context-aware responses",
    },
    {
      icon: TrendingUp,
      title: "Autonomous Evolution",
      description: "Daily self-improvement cycles that analyze performance and optimize system capabilities",
    },
    {
      icon: GitBranch,
      title: "Knowledge Graphs",
      description: "Visual concept mapping that reveals relationships and patterns in learned information",
    },
    {
      icon: BarChart3,
      title: "A/B Testing",
      description: "Built-in experimentation framework to continuously validate and improve agent performance",
    },
    {
      icon: Sparkles,
      title: "Auto-Discovery",
      description: "System suggests new capabilities based on usage patterns and emerging needs",
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
    "Production-ready multi-agent architecture",
    "Real-time semantic search and retrieval",
    "Automated performance optimization",
    "Secure role-based access control",
    "Built on React, Supabase, and OpenAI",
    "Self-evolving system capabilities",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">Self-Learning AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Production-Ready AI Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Self-Learning AI That Gets
              <span className="bg-gradient-to-r from-[hsl(var(--ai-gradient-start))] to-[hsl(var(--ai-gradient-end))] bg-clip-text text-transparent">
                {" "}Smarter Every Day
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Autonomous evolution powered by multi-agent architecture. Watch your AI assistant learn from interactions, 
              build knowledge graphs, and continuously optimize its own performance.
            </p>
            <div className="flex justify-center items-center pt-4">
              <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 justify-center pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Deploy in minutes
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Self-improving system
              </div>
            </div>
          </div>

          {/* Animated Visual Placeholder */}
          <div className="mt-16 relative">
            <div className="aspect-video rounded-lg border border-border bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
                  <div className="absolute inset-8 rounded-full bg-primary/30 animate-pulse delay-75"></div>
                  <div className="absolute inset-16 rounded-full bg-primary/40 animate-pulse delay-150"></div>
                  <Brain className="absolute inset-0 m-auto w-16 h-16 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful AI Capabilities</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built on cutting-edge technology that learns, adapts, and evolves autonomously
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Built for Production</h2>
            <p className="text-xl text-muted-foreground">
              Enterprise-grade technology stack with security at its core
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Secure by Design</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      {benefits.slice(0, 3).map((benefit, i) => (
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
                    <h3 className="text-xl font-semibold mb-2">Modern Stack</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      {benefits.slice(3).map((benefit, i) => (
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

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join the future of self-learning AI. Start building with autonomous evolution today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                  Create Your Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
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
              <span className="font-semibold">Self-Learning AI</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">Documentation</button>
              <button className="hover:text-foreground transition-colors">Privacy</button>
              <button className="hover:text-foreground transition-colors">Terms</button>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Self-Learning AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
