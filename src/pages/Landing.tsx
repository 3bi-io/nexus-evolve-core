import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { SEO } from '@/components/SEO';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { BetaTrustSignals } from '@/components/landing/BetaTrustSignals';
import { FinalCTASection } from '@/components/landing/FinalCTASection';

export default function Landing() {
  return (
    <MarketingLayout>
      <SEO
        title="Oneiros | Black Friday AI Platform Sale - Vision, Generation, Workflows & Monitoring"
        description="Black Friday special - AI platform with vision analysis, image generation, automated workflows, and intelligent monitoring. Limited time unlimited access to all features."
        keywords={[
          "free AI platform",
          "AI automation",
          "vision analysis",
          "image generation",
          "automated workflows",
          "unlimited AI",
          "free AI tools",
          "multi-modal AI",
          "agent builder",
          "ChatGPT alternative"
        ]}
        ogImage="/og-platform-automation.png"
        canonical="https://oneiros.me/welcome"
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
          
          <FinalCTASection />
        </div>
      </ErrorBoundary>
    </MarketingLayout>
  );
}
