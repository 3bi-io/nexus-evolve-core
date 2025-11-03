import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Brain, Zap, Shield, TrendingUp, Star, Clock, Users, Sparkles, Target, Rocket, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { EnhancedInteractiveDemo } from '@/components/landing/EnhancedInteractiveDemo';
import { EnhancedTrustSignals } from '@/components/landing/EnhancedTrustSignals';
import { SEO } from '@/components/SEO';
import { ExitIntentPopup } from '@/components/conversion/ExitIntentPopup';
import { SocialProofNotification } from '@/components/conversion/SocialProofNotification';
import { ROICalculator } from '@/components/conversion/ROICalculator';
import { ComparisonTable } from '@/components/conversion/ComparisonTable';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { UseCases } from '@/components/landing/UseCases';
import { LiveMetrics } from '@/components/landing/LiveMetrics';
import { FAQ } from '@/components/landing/FAQ';

const features = [
  {
    icon: Brain,
    title: 'Ship Products 3x Faster',
    description: '5 specialized agents coordinate to solve complex problems. What used to take weeks now takes days.',
    badge: 'Multi-Agent',
    stat: '3x faster',
  },
  {
    icon: Users,
    title: 'Never Repeat Yourself Again',
    description: 'Temporal memory that remembers every conversation forever. AI gets sharper over time, not dumber.',
    badge: 'Memory',
    stat: 'Perfect recall',
  },
  {
    icon: Sparkles,
    title: 'AI That Evolves While You Sleep',
    description: 'Autonomous learning system analyzes patterns, discovers capabilities, and improves itself daily.',
    badge: 'Self-Learning',
    stat: 'Auto-improves',
  },
  {
    icon: Zap,
    title: 'Predict What You Need Next',
    description: 'Predictive AI learns your patterns and proactively suggests solutions before you ask.',
    badge: 'Predictive',
    stat: '87% accuracy',
  },
  {
    icon: Target,
    title: 'Talk, Don\'t Type',
    description: 'Natural voice conversations with ElevenLabs AI. Have meetings, not messages.',
    badge: 'Voice AI',
    stat: 'Natural speech',
  },
  {
    icon: Code,
    title: 'Build Without Coding',
    description: 'Agent marketplace with 1,000+ ready agents. Or build your own in minutes and monetize them.',
    badge: 'No-Code',
    stat: '1,000+ agents',
  },
];

const steps = [
  {
    number: 1,
    title: 'Sign Up (30 seconds)',
    description: 'Create your free account. No credit card required. Get instant access to all 9 AI systems.',
    icon: Zap,
  },
  {
    number: 2,
    title: 'AI Learns You (automatic)',
    description: 'Start chatting. Our agents automatically learn your patterns, build your knowledge graph, and remember everything.',
    icon: Brain,
  },
  {
    number: 3,
    title: 'Ship 3x Faster (ongoing)',
    description: 'Watch your productivity multiply as AI evolves, predicts your needs, and automates repetitive work.',
    icon: Rocket,
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: 0,
    credits: '500 daily credits forever',
    features: ['9 AI systems', 'Multi-agent orchestration', 'Voice AI', 'Agent marketplace', 'Community support'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Professional',
    price: 49,
    credits: '10,000 credits/month',
    features: ['Everything in Starter', 'Priority support', 'Advanced analytics', 'Custom agents', 'API access'],
    cta: 'Upgrade Now',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 999,
    credits: 'Unlimited credits',
    features: ['Everything in Professional', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'Training & onboarding'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  return (
    <PageLayout showHeader showFooter>
      <SEO 
        title="Oneiros: The AI That Gets Smarter While You Sleep | 10,847 Teams Ship 3x Faster"
        description="9 AI systems working 24/7. Autonomous evolution. Temporal memory. Voice conversations. Join 10K+ teams using AI that learns, predicts, and improves itself. Start free with 500 daily credits."
        keywords="AI platform that learns, autonomous AI system, AI with memory, multi-agent AI, ChatGPT alternative, AI that improves itself"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-8 py-20">
          <Badge variant="secondary" className="gap-1.5 px-4 py-2 text-base">
            <Sparkles className="h-4 w-4 animate-pulse" />
            9 AI Systems • 10,847 Teams • 4.9★ Rating
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-[1.1]">
            The AI That Gets
            <span className="text-primary block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Smarter While You Sleep
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            9 AI systems working <strong>24/7</strong> to multiply your productivity.
            <br className="hidden sm:block" />
            <strong>10,847 teams</strong> already shipping <strong className="text-primary">3x faster</strong> with Oneiros.
          </p>

          <LiveMetrics />

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-10 py-7 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
            >
              Start Shipping 3x Faster
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/getting-started')}
              className="text-lg px-10 py-7 hover:bg-primary/10"
            >
              Watch 2-Min Demo
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span>500 free credits daily forever</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <span>5-minute setup</span>
            </div>
          </div>
        </div>

        {/* Problem/Solution */}
        <section className="py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Sound Familiar?</h2>
            <p className="text-lg text-muted-foreground">Traditional AI is holding you back</p>
          </div>
          <ProblemSolution />
        </section>

        {/* Social Proof */}
        <section className="py-16">
          <EnhancedTrustSignals />
        </section>

        {/* Core Benefits */}
        <section className="py-16 space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-base px-4 py-2">
              <Rocket className="h-4 w-4 mr-2" />
              9 Integrated AI Systems
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold">
              Never Lose Context. Never Stop Learning.
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Unlike ChatGPT or Claude, Oneiros is a <strong>complete AI ecosystem</strong> that remembers, 
              evolves, and predicts what you need before you ask.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-6 hover:shadow-xl transition-all hover:scale-[1.02] group border-primary/10">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {feature.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {feature.badge}
                          </Badge>
                        )}
                        {feature.stat && (
                          <Badge variant="outline" className="text-xs font-mono text-primary border-primary/20">
                            {feature.stat}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16">
          <UseCases />
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
          <div className="container mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">3 Steps to 3x Productivity</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From zero to AI-powered in under 5 minutes
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <Card key={step.number} className="p-8 bg-background hover:shadow-lg transition-shadow">
                    <CardContent className="p-0 space-y-4 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                          {step.number}
                        </div>
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Not Just Another AI Chatbot</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how Oneiros compares to ChatGPT, Claude, and traditional AI platforms
            </p>
          </div>
          <ComparisonTable />
        </section>

        {/* ROI Calculator */}
        <section className="py-16">
          <ROICalculator />
        </section>

        {/* Demo */}
        <section className="py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">See It In Action</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Try our AI right now - no signup required
            </p>
          </div>
          <EnhancedInteractiveDemo />
        </section>

        {/* Pricing */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-transparent -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
          <div className="container mx-auto space-y-12">
            <div className="text-center space-y-4">
              <Badge variant="outline" className="text-base px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-2" />
                ROI in 2 Weeks
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Pricing That Scales With You</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start free. Scale unlimited. Save <strong>$8,400/year</strong> vs hiring.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={`p-8 hover:shadow-xl transition-all ${tier.popular ? 'border-primary shadow-lg scale-[1.05]' : 'hover:scale-[1.02]'}`}>
                  <CardContent className="p-0 space-y-6">
                    <div className="flex items-center justify-between">
                      {tier.popular && (
                        <Badge className="text-sm px-3 py-1">⭐ Most Popular</Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">{tier.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">${tier.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-sm text-primary font-semibold">{tier.credits}</p>
                    </div>
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-primary flex-shrink-0 fill-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full text-base py-6" 
                      size="lg"
                      variant={tier.popular ? 'default' : 'outline'}
                      onClick={() => navigate(tier.cta === 'Start Free' ? '/auth' : '/pricing')}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <FAQ />
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <Card className="p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 text-center">
            <div className="space-y-8 max-w-3xl mx-auto">
              <Badge variant="default" className="text-base px-4 py-2 animate-pulse">
                🔥 427 teams signed up in the last 24 hours
              </Badge>
              
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Join 10,847 Teams Shipping Faster
                </h2>
                <p className="text-xl text-muted-foreground">
                  Start free today. No credit card. Cancel anytime.
                  <br />
                  <strong className="text-foreground">ROI in 2 weeks or your money back.</strong>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="text-lg px-12 py-7 shadow-2xl hover:scale-105 transition-all"
                >
                  Start Shipping 3x Faster
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:sales@oneiros.me'}
                  className="text-lg px-12 py-7"
                >
                  Talk to Sales
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Conversion Components */}
        <ExitIntentPopup />
        <SocialProofNotification />
      </div>
    </PageLayout>
  );
}
