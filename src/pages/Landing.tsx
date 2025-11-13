import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { BetaTrustSignals } from '@/components/landing/BetaTrustSignals';
import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { ExitIntentPopup } from '@/components/conversion/ExitIntentPopup';
import { SocialProofNotification } from '@/components/conversion/SocialProofNotification';
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
    <MarketingLayout title="Home - AI Platform">
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
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl space-y-16 sm:space-y-20 md:space-y-24">
          <HeroSection />
          
          <section className="section-spacing">
            <BetaTrustSignals />
          </section>

          <FeaturesSection />
          
          <PricingSection />
          
          <FinalCTASection />
          
          <ExitIntentPopup />
          <SocialProofNotification />
          <StickySignupCTA />
        </div>
      </ErrorBoundary>
    </MarketingLayout>
  );
}
