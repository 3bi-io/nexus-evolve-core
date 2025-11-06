import { PageLayout } from '@/components/layout/PageLayout';
import { TrendingTopicsPanel } from '@/components/social/TrendingTopicsPanel';
import { ViralContentStudio } from '@/components/social/ViralContentStudio';
import { SocialSentimentDashboard } from '@/components/social/SocialSentimentDashboard';
import { Sparkles } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ApplyAIBadge } from '@/components/xai/ApplyAIBadge';
import { TrustIndicators } from '@/components/xai/TrustIndicators';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function SocialIntelligence() {
  const navigate = useNavigate();
  
  return (
    <PageLayout>
      <SEO 
        title="Social Intelligence - Real-time X (Twitter) Trend Analysis & Viral Content"
        description="Real-time social intelligence powered by Grok AI. Track trending topics on X (Twitter), analyze sentiment, and create viral content with AI-powered insights."
        keywords="social intelligence, Grok AI, X trends, Twitter analytics, viral content, sentiment analysis, social media AI"
        canonical="https://oneiros.me/social-intelligence"
        ogImage="/og-social.png"
      />
      <div className="container max-w-7xl py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Social Intelligence</h1>
              <p className="text-muted-foreground">
                Real-time insights powered by Grok with live X (Twitter) data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ApplyAIBadge variant="full" />
            <Button onClick={() => navigate('/xai-studio')} variant="outline">
              Explore XAI Studio
            </Button>
          </div>
        </div>

        <TrustIndicators />

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
