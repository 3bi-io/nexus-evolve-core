import { AchievementsPanel } from "@/components/achievements/AchievementsPanel";
import { PageLayout } from "@/components/layout/PageLayout";

export default function Achievements() {
  return (
    <PageLayout>
      <div className="container mx-auto py-8 px-4">
        <AchievementsPanel />
      </div>
    </PageLayout>
  );
}
