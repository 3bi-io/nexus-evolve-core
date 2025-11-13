import { AchievementsPanel } from "@/components/achievements/AchievementsPanel";
import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";

export default function Achievements() {
  return (
    <AppLayout title="Achievements" showBottomNav>
      <SEO
        title="Achievements & Rewards - Track Your AI Journey"
        description="Track your AI journey with our achievement system. Earn badges, unlock rewards, and compete on leaderboards as you explore the unified platform's 9 AI systems."
        keywords="achievements, gamification, AI rewards, badges, leaderboard, milestones"
        canonical="https://oneiros.me/achievements"
      />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <AchievementsPanel />
      </div>
    </AppLayout>
  );
}
