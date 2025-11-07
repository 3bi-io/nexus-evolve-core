import { QuickLaunchCard } from "./QuickLaunchCard";
import { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
  status?: "available" | "rate-limited" | "premium";
  stats?: {
    totalUses?: number;
    avgResponseTime?: number;
  };
}

interface CategorySectionProps {
  title: string;
  description?: string;
  features: Feature[];
}

export function CategorySection({ title, description, features }: CategorySectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <QuickLaunchCard
            key={feature.route}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            route={feature.route}
            status={feature.status}
            stats={feature.stats}
          />
        ))}
      </div>
    </div>
  );
}
