import { Link } from "react-router-dom";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TierName, TIERS } from "@/config/tiers";
import { cn } from "@/lib/utils";

interface UpgradePromptProps {
  feature: string;
  requiredTier: TierName;
  variant?: "inline" | "card" | "banner";
  className?: string;
}

export function UpgradePrompt({ feature, requiredTier, variant = "inline", className }: UpgradePromptProps) {
  const tierConfig = TIERS[requiredTier];
  
  if (variant === "banner") {
    return (
      <div className={cn(
        "flex items-center justify-between gap-4 px-4 py-3 rounded-lg",
        "bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{feature} requires {tierConfig.displayName}</p>
            <p className="text-xs text-muted-foreground">
              Upgrade to unlock this and more features
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="gap-1">
          <Link to="/pricing">
            Upgrade
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className={cn("border-primary/20 bg-primary/5", className)}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Unlock {feature}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This feature is available on {tierConfig.displayName} and above.
                Starting at ${(tierConfig.monthlyPrice / 100).toFixed(0)}/month.
              </p>
            </div>
            <Button asChild className="w-full gap-2">
              <Link to="/pricing">
                <Sparkles className="w-4 h-4" />
                Upgrade to {tierConfig.displayName}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inline variant (default)
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Lock className="w-3.5 h-3.5" />
      <span>Requires {tierConfig.displayName}</span>
      <Button asChild variant="link" size="sm" className="h-auto p-0 text-primary">
        <Link to="/pricing">Upgrade</Link>
      </Button>
    </div>
  );
}
