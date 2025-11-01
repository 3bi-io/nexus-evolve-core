import { PageLayout } from '@/components/layout/PageLayout';
import { SEO } from '@/components/SEO';
import { QuickStartTemplates } from '@/components/onboarding/QuickStartTemplates';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  BookOpen, 
  Zap, 
  Shield,
  Clock,
  Brain,
  CheckCircle2 
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: '9 AI Systems',
    description: 'Multiple specialized agents working together',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Run AI models locally in your browser',
  },
  {
    icon: Clock,
    title: 'Time-Based',
    description: '5 minutes per credit, transparent pricing',
  },
  {
    icon: Zap,
    title: 'Smart Routing',
    description: 'Auto-select the best model for each task',
  },
];

const steps = [
  {
    number: 1,
    title: 'Choose a Template',
    description: 'Select from quick-start templates below to begin',
  },
  {
    number: 2,
    title: 'Start Conversing',
    description: 'Chat naturally - our AI routes to the best agent',
  },
  {
    number: 3,
    title: 'Explore Features',
    description: 'Try image generation, browser AI, custom agents',
  },
  {
    number: 4,
    title: 'Track & Optimize',
    description: 'Monitor your usage and upgrade as needed',
  },
];

export default function GettingStarted() {
  return (
    <PageLayout title="Getting Started">
      <SEO
        title="Getting Started - Oneiros AI Platform"
        description="Learn how to use Oneiros AI with quick-start templates and guides"
        keywords="getting started, AI tutorial, onboarding"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="mb-2">
            <Play className="h-3 w-3 mr-1" />
            Getting Started Guide
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Oneiros AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent AI platform with multi-agent orchestration,
            browser AI, and smart routing
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Steps */}
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">How It Works</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Start Templates */}
        <QuickStartTemplates />

        {/* CTA */}
        <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-primary/5 to-transparent">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Pick a template above or jump right into the chat to begin your AI journey
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" onClick={() => window.location.href = '/'}>
              Start Chatting
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                localStorage.removeItem('hasCompletedProductTour');
                window.location.href = '/';
              }}
            >
              Take Product Tour
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
