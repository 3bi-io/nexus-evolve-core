import { Crown, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TierName } from "@/config/tiers";

interface TierBadgeProps {
  tier: TierName;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function TierBadge({ tier, size = "md", showIcon = true, className }: TierBadgeProps) {
  const getIcon = () => {
    switch (tier) {
      case "enterprise":
        return <Crown className={cn(size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5")} />;
      case "professional":
        return <Sparkles className={cn(size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5")} />;
      default:
        return <Zap className={cn(size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5")} />;
    }
  };

  const getDisplayName = () => {
    switch (tier) {
      case "enterprise":
        return "Enterprise";
      case "professional":
        return "Pro";
      default:
        return "Free";
    }
  };

  const getVariant = () => {
    switch (tier) {
      case "enterprise":
        return "default";
      case "professional":
        return "default";
      default:
        return "secondary";
    }
  };

  const getColors = () => {
    switch (tier) {
      case "enterprise":
        return "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600";
      case "professional":
        return "bg-gradient-to-r from-primary to-accent text-primary-foreground";
      default:
        return "";
    }
  };

  return (
    <Badge
      variant={getVariant()}
      className={cn(
        "gap-1 font-medium",
        size === "sm" && "text-[10px] px-1.5 py-0.5",
        size === "md" && "text-xs px-2 py-0.5",
        size === "lg" && "text-sm px-3 py-1",
        tier !== "starter" && getColors(),
        className
      )}
    >
      {showIcon && getIcon()}
      {getDisplayName()}
    </Badge>
  );
}
