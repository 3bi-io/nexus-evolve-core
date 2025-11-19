import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { SEO } from '@/components/SEO';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { EnhancedUseCases } from '@/components/landing/EnhancedUseCases';
import { AgentPlatformShowcase } from '@/components/landing/AgentPlatformShowcase';
import { AnimatedPlatformComparison } from '@/components/landing/AnimatedPlatformComparison';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { AgentSystemShowcase } from '@/components/landing/AgentSystemShowcase';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { FAQ } from '@/components/landing/FAQ';
import { Badge } from '@/components/ui/badge';

export default function Features() {
  return (
    <MarketingLayout>
      <SEO
        title="Features - Complete AI Automation Platform | Oneiros"
        description="Explore Oneiros features: vision analysis, voice agents, automated workflows, smart caching, trend monitoring, and 38+ edge functions working autonomously."
        canonical="https://oneiros.me/features"
        keywords={[
          "AI features",
          "vision analysis",
          "voice agents",
          "automated workflows",
          "smart caching",
          "trend monitoring",
          "multi-modal AI",
          "agent platform"
        ]}
      />
      
      <div className="container mx-auto px-4 py-16 max-w-7xl space-y-20">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="mb-4">Platform Features</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Everything You Need to Automate</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A complete AI automation platform with vision, voice, workflows, and autonomous agents
          </p>
        </div>

        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Problem We Solve</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Traditional AI tools force you to manage everything manually. Oneiros works autonomously.
            </p>
          </div>
          <ProblemSolution />
        </section>

        <AgentSystemShowcase />
        
        <EnhancedUseCases />
        
        <AgentPlatformShowcase />
        
        <AnimatedPlatformComparison />
        
        <HowItWorksSection />
        
        <ComparisonSection />
        
        <DemoSection />
        
        <section className="py-12">
          <FAQ />
        </section>
      </div>
    </MarketingLayout>
  );
}
