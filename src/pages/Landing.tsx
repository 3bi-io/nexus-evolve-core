import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Landing page sections
import { BetaTrustSignals } from '@/components/landing/BetaTrustSignals';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { FAQ } from '@/components/landing/FAQ';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { EnhancedUseCases } from '@/components/landing/EnhancedUseCases';
import { AgentPlatformShowcase } from '@/components/landing/AgentPlatformShowcase';
import { AnimatedPlatformComparison } from '@/components/landing/AnimatedPlatformComparison';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { AgentSystemShowcase } from '@/components/landing/AgentSystemShowcase';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';

// Conversion components
import { ExitIntentPopup } from '@/components/conversion/ExitIntentPopup';
import { SocialProofNotification } from '@/components/conversion/SocialProofNotification';
import { ROICalculator } from '@/components/conversion/ROICalculator';
import { StickySignupCTA } from '@/components/mobile/StickySignupCTA';

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
        title="Oneiros | AI Automation Platform - Vision, Generation, Workflows & Monitoring"
        description="Production-ready AI automation platform with vision analysis, image generation, automated workflows, smart caching, and 24/7 trend monitoring. 38+ edge functions working autonomously."
        keywords={[
          "AI automation platform",
          "vision analysis",
          "image generation",
          "automated workflows",
          "trend monitoring",
          "smart caching",
          "multi-modal AI",
          "content pipeline",
          "AI workflows",
          "XAI studio",
          "grok vision",
          "temporal memory",
          "agent builder",
          "ChatGPT alternative"
        ]}
        ogImage="/og-platform-automation.png"
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

      <ErrorBoundary>
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

        {/* Agent System Showcase */}
        <AgentSystemShowcase />

        {/* Core Benefits */}
        <FeaturesSection />

        {/* Enhanced Use Cases - Interactive Showcase */}
        <EnhancedUseCases />
        
        {/* Agent Platform Showcase */}
        <AgentPlatformShowcase />

        {/* Animated Platform Comparison */}
        <AnimatedPlatformComparison />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Comparison */}
        <ComparisonSection />

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
        <FinalCTASection />

        {/* Conversion Components */}
        <ExitIntentPopup />
        <SocialProofNotification />
        <StickySignupCTA />
        </div>
      </ErrorBoundary>
    </MarketingLayout>
  );
}
