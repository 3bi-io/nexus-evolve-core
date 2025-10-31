import { AchievementsPanel } from "@/components/achievements/AchievementsPanel";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";

export default function Achievements() {
  return (
    <PageLayout>
      <SEO 
        title="Achievements & Rewards - Gamification System"
        description="Track your AI journey with our achievement system. Earn badges, unlock rewards, and compete on leaderboards as you explore Oneiros.me's features."
        keywords="achievements, gamification, AI rewards, badges, leaderboard"
        canonical="https://oneiros.me/achievements"
      />
      <div className="container mx-auto py-8 px-4">
        <AchievementsPanel />
      </div>
    </PageLayout>
  );
}
