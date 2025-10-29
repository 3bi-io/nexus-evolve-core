import { Navigation } from "@/components/Navigation";
import { AchievementsPanel } from "@/components/achievements/AchievementsPanel";

export default function Achievements() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <AchievementsPanel />
      </div>
    </div>
  );
}
