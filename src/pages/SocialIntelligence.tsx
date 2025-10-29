import { PageLayout } from '@/components/layout/PageLayout';
import { TrendingTopicsPanel } from '@/components/social/TrendingTopicsPanel';
import { ViralContentStudio } from '@/components/social/ViralContentStudio';
import { SocialSentimentDashboard } from '@/components/social/SocialSentimentDashboard';
import { Sparkles } from 'lucide-react';

export default function SocialIntelligence() {
  return (
    <PageLayout>
      <div className="container max-w-7xl py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Social Intelligence</h1>
            <p className="text-muted-foreground">
              Real-time insights powered by Grok with live X (Twitter) data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TrendingTopicsPanel />
            <SocialSentimentDashboard />
          </div>
          <div>
            <ViralContentStudio />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
