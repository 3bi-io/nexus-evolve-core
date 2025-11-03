import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Brain, Zap, Shield, TrendingUp, Star, Clock, Users, Sparkles, Target, Rocket, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { EnhancedInteractiveDemo } from '@/components/landing/EnhancedInteractiveDemo';
import { BetaTrustSignals } from '@/components/landing/BetaTrustSignals';
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
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'Advanced bot detection, geographic risk blocking, brute force protection, and real-time threat monitoring.',
    badge: 'Security',
    stat: 'Bank-level',
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
    features: ['9 AI systems', 'Enterprise security', 'Multi-agent orchestration', 'Voice AI', 'Agent marketplace', 'Beta tester badge'],
    cta: 'Join Beta Free',
    popular: false,
    badge: '🎁 Forever Free',
  },
  {
    name: 'Professional',
    price: 29,
    originalPrice: 49,
    credits: '10,000 credits/month',
    features: ['Everything in Starter', 'Priority support', 'Advanced analytics', 'Enhanced security monitoring', 'Founder badge', 'Locked-in rate forever'],
    cta: 'Lock In Founder Rate',
    popular: true,
    badge: '🔥 Founder Rate',
  },
  {
    name: 'Enterprise',
    price: null,
    credits: 'Custom credits',
    features: ['Everything in Professional', 'Dedicated support', 'Custom security rules', 'White-label options', 'Shape development', 'Direct dev access'],
    cta: 'Schedule Call',
    popular: false,
    badge: '🚀 Beta Custom',
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
        title="Oneiros | AI That Evolves While You Sleep - Multi-Agent AI Platform"
        description="9 autonomous AI systems with temporal memory. Multi-agent orchestration, voice AI with ElevenLabs, agent marketplace, and self-learning capabilities. Join pioneering teams in our exclusive beta program."
        keywords={[
          "multi-agent AI",
          "temporal memory AI",
          "autonomous AI",
          "self-learning AI",
          "ChatGPT alternative",
          "AI beta launch",
          "voice AI platform",
          "agent marketplace",
          "AI orchestration",
          "neural networks",
          "machine learning platform"
        ]}
        ogImage="/og-oneiros-main.png"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Oneiros",
          "applicationCategory": "BusinessApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "127"
          }
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-24">
        {/* Hero Section */}
        <div className="relative text-center space-y-8 py-20 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20 animate-gradient" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-700" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
          </div>
          <Badge variant="secondary" className="gap-1.5 px-4 py-2 text-base animate-pulse">
            <Sparkles className="h-4 w-4" />
            🚀 Beta Launch • Limited Early Access • Join First 1,000 Users
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-[1.1]">
            The AI That Gets
            <span className="text-primary block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Smarter While You Sleep
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            <strong>9 autonomous AI systems</strong> with temporal memory and multi-agent orchestration.
            <br className="hidden sm:block" />
            Join pioneering teams in our <strong className="text-primary">exclusive beta program</strong>.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm max-w-3xl mx-auto">
            <Badge variant="outline" className="gap-1.5">
              <Zap className="h-3 w-3" />
              9 Production AI Systems
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Shield className="h-3 w-3" />
              Bank-Level Security
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Brain className="h-3 w-3" />
              20+ Edge Functions
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Sparkles className="h-3 w-3" />
              Bot & Fraud Protection
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-10 py-7 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
            >
              Get Early Access Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/getting-started')}
              className="text-lg px-10 py-7 hover:bg-primary/10"
            >
              Explore Live Demo
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              <span>Enterprise security included</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span>500 free credits daily forever</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span>All features unlocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
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
          <BetaTrustSignals />
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
              Unlike ChatGPT or Claude, Oneiros is a <strong>complete AI ecosystem</strong> with enterprise security,
              temporal memory, and autonomous evolution. Protected by advanced bot detection and geographic risk blocking.
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
                Beta Pricing - Lock It In Forever
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Founder Rates for Early Users</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join now and <strong>lock in founder pricing for life</strong>. Rates increase after beta.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={`p-8 hover:shadow-xl transition-all ${tier.popular ? 'border-primary shadow-lg scale-[1.05]' : 'hover:scale-[1.02]'}`}>
                  <CardContent className="p-0 space-y-6">
                    <div className="flex items-center justify-between">
                      <Badge variant={tier.popular ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                        {tier.badge}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">{tier.name}</h3>
                      <div className="flex items-baseline gap-2">
                        {tier.price !== null ? (
                          <>
                            <span className="text-5xl font-bold">${tier.price}</span>
                            {tier.originalPrice && (
                              <span className="text-2xl text-muted-foreground line-through">${tier.originalPrice}</span>
                            )}
                            <span className="text-muted-foreground">/month</span>
                          </>
                        ) : (
                          <span className="text-4xl font-bold">Custom</span>
                        )}
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
              <Badge variant="default" className="text-base px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Early Access Beta - Shape the Future
              </Badge>
              
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Join the First 1,000 Users
                </h2>
                <p className="text-xl text-muted-foreground">
                  Be among the pioneers. Lock in founder pricing forever.
                  <br />
                  <strong className="text-foreground">Full platform access. All features unlocked.</strong>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="text-lg px-12 py-7 shadow-2xl hover:scale-105 transition-all"
                >
                  Get Beta Access Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/pricing')}
                  className="text-lg px-12 py-7"
                >
                  View Founder Pricing
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
