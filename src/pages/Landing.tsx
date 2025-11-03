import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Brain, Rocket, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { BetaTrustSignals } from '@/components/landing/BetaTrustSignals';
import { SEO } from '@/components/SEO';
import { ExitIntentPopup } from '@/components/conversion/ExitIntentPopup';
import { SocialProofNotification } from '@/components/conversion/SocialProofNotification';
import { ROICalculator } from '@/components/conversion/ROICalculator';
import { ComparisonTable } from '@/components/conversion/ComparisonTable';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { UseCases } from '@/components/landing/UseCases';
import { FAQ } from '@/components/landing/FAQ';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { PricingSection } from '@/components/landing/PricingSection';

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
        <HeroSection />

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
        <FeaturesSection />

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
                    <div className="p-0 space-y-4 text-center">
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
                    </div>
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

        {/* Demo Section */}
        <DemoSection />

        {/* Pricing Section */}
        <PricingSection />

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
