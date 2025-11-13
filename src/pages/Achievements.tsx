import { AchievementsPanel } from "@/components/achievements/AchievementsPanel";
import { AppLayout } from "@/components/layout/AppLayout";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useMobile } from "@/hooks/useMobile";
import { SEO } from "@/components/SEO";
import { useState } from "react";

export default function Achievements() {
  const { isMobile } = useMobile();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = async () => {
    // Force re-render of AchievementsPanel by changing key
    setRefreshKey(prev => prev + 1);
  };

  const content = (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <AchievementsPanel key={refreshKey} />
    </div>
  );

  return (
    <AppLayout title="Achievements" showBottomNav>
      <SEO
        title="Achievements & Rewards - Track Your AI Journey"
        description="Track your AI journey with our achievement system. Earn badges, unlock rewards, and compete on leaderboards as you explore the unified platform's 9 AI systems."
        keywords="achievements, gamification, AI rewards, badges, leaderboard, milestones"
        canonical="https://oneiros.me/achievements"
      />
      {isMobile ? (
        <PullToRefresh onRefresh={handleRefresh}>
          {content}
        </PullToRefresh>
      ) : (
        content
      )}
    </AppLayout>
  );
}
