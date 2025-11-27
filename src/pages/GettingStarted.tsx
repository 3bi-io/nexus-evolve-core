import { PageLayout } from '@/components/layout/PageLayout';
import { SEO } from '@/components/SEO';
import { QuickStartTemplates } from '@/components/onboarding/QuickStartTemplates';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Zap, 
  Clock,
  CheckCircle2,
  Video,
  FileText,
  Lightbulb
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Start Chatting (instant)',
    description: 'Open the chat and start talking to AI. No signup, no credit card, just AI.',
    time: 'Instant',
    action: 'Start using AI',
  },
  {
    number: 2,
    title: 'Explore the Sidebar',
    description: 'Navigate all 9 AI systems from the unified sidebar. Press Cmd+B (or Ctrl+B) to toggle anytime.',
    time: '1 min',
    action: 'Discover navigation',
  },
  {
    number: 3,
    title: 'Start Your First Chat',
    description: 'Ask anything. Our AI automatically routes to the best agent for your query.',
    time: '2 min',
    action: 'Begin chatting',
  },
  {
    number: 4,
    title: 'Watch AI Learn',
    description: 'Your AI builds a knowledge graph and gets smarter with each interaction.',
    time: 'Ongoing',
    action: 'AI evolves',
  },
];

const quickWins = [
  { icon: Zap, title: 'Navigate with keyboard', description: 'Press Cmd+B (or Ctrl+B) to toggle sidebar - power user tip!' },
  { icon: Play, title: 'Have a voice conversation', description: 'Click Voice AI in sidebar and start talking naturally' },
  { icon: CheckCircle2, title: 'Build a custom agent', description: 'Visit Agent Studio from sidebar to create your first agent' },
];

export default function GettingStarted() {
  return (
    <PageLayout title="Getting Started">
      <SEO
        title="Quick Start Guide - 5 Minutes to AI-Powered | Oneiros"
        description="Get started with Oneiros AI in 5 minutes. Step-by-step guide, video tutorials, and quick-start templates. Start free - no credit card required."
        keywords="getting started, AI tutorial, onboarding, quick start guide, AI setup"
      />

      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-16">
        {/* Hero */}
        <div className="text-center space-y-6">
          <Badge variant="secondary" className="text-base px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            5-Minute Setup
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            From Zero to AI-Powered
            <span className="text-primary block mt-2">in Under 5 Minutes</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Follow this simple guide to unlock all 9 AI systems and start shipping 3x faster today.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = '/chat'}>
              Start Using AI
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
              Watch Video Tutorial
              <Video className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">4 Simple Steps</h2>
          <div className="grid gap-6 max-w-4xl mx-auto">
            {steps.map((step) => (
              <Card key={step.number} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <Badge variant="outline">{step.time}</Badge>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                    <p className="text-sm text-primary font-semibold">→ {step.action}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Video Tutorial Placeholder */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="text-center space-y-4">
            <Video className="h-16 w-16 text-primary mx-auto" />
            <h3 className="text-2xl font-bold">Watch the 2-Minute Tutorial</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how to set up your account, start your first chat, and unlock all features in under 2 minutes.
            </p>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center max-w-3xl mx-auto">
              <div className="text-center space-y-3">
                <Play className="h-20 w-20 text-muted-foreground mx-auto opacity-50" />
                <p className="text-muted-foreground">Tutorial video coming soon</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Wins */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Lightbulb className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-2xl font-bold">Try These Quick Wins</h2>
            <p className="text-muted-foreground">Get familiar with Oneiros capabilities in minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {quickWins.map((win) => {
              const Icon = win.icon;
              return (
                <Card key={win.title} className="p-6 text-center space-y-3 hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{win.title}</h3>
                  <p className="text-sm text-muted-foreground">{win.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Start Templates */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <FileText className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-2xl font-bold">Start with a Template</h2>
            <p className="text-muted-foreground">Choose a template that matches your use case</p>
          </div>
          <QuickStartTemplates />
        </div>

        {/* Success Metrics */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="text-center space-y-6">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <h2 className="text-2xl font-bold">What to Expect in Your First Week</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">Day 1-2</p>
                <p className="font-semibold">Exploration</p>
                <p className="text-sm text-muted-foreground">Try different features, build your first agent, have voice conversations</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">Day 3-5</p>
                <p className="font-semibold">Integration</p>
                <p className="text-sm text-muted-foreground">AI learns your patterns, builds knowledge graph, starts predicting needs</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-primary">Day 6-7</p>
                <p className="font-semibold">Acceleration</p>
                <p className="text-sm text-muted-foreground">Notice 2-3x productivity gains, AI proactively suggests solutions</p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Transform Your Workflow?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join 10,847 teams using the unified AI platform to ship 3x faster
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = '/chat'}>
              Start Using AI (No Account Required)
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '/features'}>
              Explore Features
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
