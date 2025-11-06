import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';
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
import { FAQ } from '@/components/landing/FAQ';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { StickySignupCTA } from '@/components/mobile/StickySignupCTA';
import { EnhancedUseCases } from '@/components/landing/EnhancedUseCases';
import { AgentPlatformShowcase } from '@/components/landing/AgentPlatformShowcase';
import { steps } from '@/data/landing-steps';
import { agentFeatures } from '@/data/landing-agent-features';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  return (
    <MarketingLayout>
      <SEO
        title="Oneiros | Production-Ready AI Platform - 9 AI Systems, Unified Navigation"
        description="Production-ready AI platform with 9 integrated systems, unified sidebar navigation, voice AI, multi-agent orchestration, and autonomous evolution. Join 10,847+ teams shipping 3x faster."
        keywords={[
          "unified AI platform",
          "sidebar navigation",
          "AI agent builder",
          "production-ready AI",
          "multi-agent AI",
          "conversational AI",
          "voice AI platform",
          "temporal memory AI",
          "autonomous AI",
          "self-learning AI",
          "agent marketplace",
          "AI orchestration",
          "keyboard shortcuts",
          "ChatGPT alternative"
        ]}
        ogImage="/og-agents-v2.png"
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
        }}
      />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl space-y-16 sm:space-y-20 md:space-y-24">
        {/* Hero Section */}
        <HeroSection />

        {/* Problem/Solution */}
        <section className="section-spacing">
          <div className="text-center space-mobile mb-8 sm:mb-12 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Sound Familiar?</h2>
            <p className="text-base sm:text-lg text-muted-foreground">Traditional AI is holding you back</p>
          </div>
          <ProblemSolution />
        </section>

        {/* Social Proof */}
        <section className="section-spacing">
          <BetaTrustSignals />
        </section>

        {/* Agent System Showcase - NEW */}
        <section className="section-spacing bg-gradient-to-b from-primary/5 to-background -mx-4 px-4">
          <div className="container mx-auto space-mobile">
            <div className="text-center space-mobile px-4">
              <Badge variant="outline" className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                🎯 Production-Ready Beta - First 1,000 Users
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                All Your AI Tools in One Unified Platform
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Seamless navigation across 9 AI systems. Build agents with memory, knowledge, analytics, and workflows. 
                Everything accessible through intuitive sidebar navigation with keyboard shortcuts (Cmd+B).
              </p>
            </div>

            <div className="grid-mobile max-w-6xl mx-auto">
              {agentFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="card-mobile hover:shadow-xl transition-all hover:scale-105 active:scale-95 touch-feedback">
                    <div className="space-mobile">
                      <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${feature.color}`} />
                      <h3 className="text-base sm:text-lg font-bold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="text-center space-mobile px-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/agent-studio')}
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 shadow-lg hover:scale-105 active:scale-95 transition-all touch-feedback min-h-[56px]"
              >
                Start Building Agents
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Free tier • 500 daily AI interactions • No credit card required
              </p>
            </div>
          </div>
        </section>

        {/* Core Benefits */}
        <FeaturesSection />

        {/* Enhanced Use Cases - Interactive Showcase */}
        <EnhancedUseCases />
        
        {/* Agent Platform Showcase */}
        <AgentPlatformShowcase />

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
                  <strong className="text-foreground">Unified platform experience. All 9 AI systems accessible from one sidebar.</strong>
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
        <StickySignupCTA />
      </div>
    </MarketingLayout>
  );
}
