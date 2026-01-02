import { PageLayout } from '@/components/layout/PageLayout';
import { SEO } from '@/components/SEO';
import { QuickStartTemplates } from '@/components/onboarding/QuickStartTemplates';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '@/hooks/useResponsive';
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
    title: 'Start Chatting',
    description: 'Open the chat and start talking to AI. No signup required.',
    time: 'Instant',
  },
  {
    number: 2,
    title: 'Explore Sidebar',
    description: 'Navigate all 9 AI systems. Press Cmd+B to toggle.',
    time: '1 min',
  },
  {
    number: 3,
    title: 'First Chat',
    description: 'Ask anything. AI routes to the best agent automatically.',
    time: '2 min',
  },
  {
    number: 4,
    title: 'Watch AI Learn',
    description: 'Your AI builds a knowledge graph and gets smarter.',
    time: 'Ongoing',
  },
];

const quickWins = [
  { icon: Zap, title: 'Keyboard nav', description: 'Press Cmd+B to toggle sidebar' },
  { icon: Play, title: 'Voice chat', description: 'Click Voice AI and start talking' },
  { icon: CheckCircle2, title: 'Build agent', description: 'Visit Agent Studio to create one' },
];

export default function GettingStarted() {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  
  return (
    <PageLayout title="Getting Started">
      <SEO
        title="Quick Start Guide - 5 Minutes to AI-Powered | Oneiros"
        description="Get started with Oneiros AI in 5 minutes. Free forever - unlimited access. Step-by-step guide, video tutorials, and quick-start templates."
        keywords="getting started, AI tutorial, onboarding, quick start guide, AI setup"
      />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl space-y-10 md:space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4 md:space-y-6">
          <Badge variant="secondary" className="text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2">
            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
            5-Minute Setup
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            From Zero to AI-Powered
            <span className="text-primary block mt-2">in Under 5 Minutes</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Follow this simple guide to unlock all 9 AI systems and start shipping 3x faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/chat')} className="h-12 md:h-14 text-base">
              Start Using AI
              <Zap className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} className="h-12 md:h-14 text-base">
              Watch Tutorial
              <Video className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>

        {/* Progress Steps - Mobile optimized */}
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-center">4 Simple Steps</h2>
          <div className="grid gap-3 md:gap-6 max-w-4xl mx-auto">
            {steps.map((step) => (
              <Card key={step.number} className="p-4 md:p-6 border-l-4 border-l-primary">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg md:text-xl">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-base md:text-xl font-bold truncate">{step.title}</h3>
                      <Badge variant="outline" className="text-xs flex-shrink-0">{step.time}</Badge>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Video Tutorial Placeholder */}
        <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="text-center space-y-4">
            <Video className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto" />
            <h3 className="text-xl md:text-2xl font-bold">2-Minute Tutorial</h3>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              See how to set up your account and unlock all features in under 2 minutes.
            </p>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center max-w-3xl mx-auto">
              <div className="text-center space-y-3">
                <Play className="h-16 w-16 md:h-20 md:w-20 text-muted-foreground mx-auto opacity-50" />
                <p className="text-sm text-muted-foreground">Tutorial coming soon</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Wins - Stack on mobile */}
        <div className="space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <Lightbulb className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto" />
            <h2 className="text-xl md:text-2xl font-bold">Quick Wins</h2>
            <p className="text-sm md:text-base text-muted-foreground">Get familiar in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            {quickWins.map((win) => {
              const Icon = win.icon;
              return (
                <Card key={win.title} className="p-4 md:p-6 flex md:flex-col items-center md:text-center gap-4 md:gap-3">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="flex-1 md:flex-none">
                    <h3 className="font-semibold text-sm md:text-base">{win.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{win.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Start Templates */}
        <div className="space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <FileText className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto" />
            <h2 className="text-xl md:text-2xl font-bold">Start with a Template</h2>
            <p className="text-sm md:text-base text-muted-foreground">Choose a template that matches your use case</p>
          </div>
          <QuickStartTemplates />
        </div>

        {/* Success Metrics - Simplified on Mobile */}
        <Card className="p-6 md:p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="text-center space-y-4 md:space-y-6">
            <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-primary mx-auto" />
            <h2 className="text-xl md:text-2xl font-bold">Your First Week</h2>
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
              {[
                { days: "Day 1-2", title: "Explore", desc: "Try features, build first agent" },
                { days: "Day 3-5", title: "Integrate", desc: "AI learns your patterns" },
                { days: "Day 6-7", title: "Accelerate", desc: "2-3x productivity gains" },
              ].map((period) => (
                <div key={period.days} className="space-y-1 md:space-y-2 text-center md:text-left">
                  <p className="text-lg md:text-3xl font-bold text-primary">{period.days}</p>
                  <p className="text-xs md:text-base font-semibold">{period.title}</p>
                  <p className="text-xs md:text-sm text-muted-foreground hidden md:block">{period.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4 md:space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to Transform Your Workflow?</h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join 10,847 teams using the unified AI platform to ship 3x faster
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/chat')} className="h-12 md:h-14 text-base">
              Start Using AI
              <Zap className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/features')} className="h-12 md:h-14 text-base">
              Explore Features
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
