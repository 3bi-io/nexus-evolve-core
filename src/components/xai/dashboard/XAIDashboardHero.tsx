import { Sparkles, Shield, Activity } from "lucide-react";
import { ApplyAIBadge } from "@/components/xai/ApplyAIBadge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface XAIDashboardHeroProps {
  apiHealth?: "healthy" | "degraded" | "down";
}

export function XAIDashboardHero({ apiHealth = "healthy" }: XAIDashboardHeroProps) {
  const navigate = useNavigate();

  const healthColors = {
    healthy: "text-success",
    degraded: "text-warning",
    down: "text-destructive",
  };

  const healthLabels = {
    healthy: "All Systems Operational",
    degraded: "Performance Degraded",
    down: "Service Unavailable",
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 p-8 mb-8">
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
      
      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 animate-pulse">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">XAI Dashboard</h1>
                <p className="text-muted-foreground">All Grok features in one place</p>
              </div>
            </div>
            
            <ApplyAIBadge variant="full" />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border">
              <Activity className={`w-4 h-4 ${healthColors[apiHealth]}`} />
              <span className="text-sm font-medium">{healthLabels[apiHealth]}</span>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigate("/xai-analytics")}
            >
              View Analytics
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="max-w-3xl">
          <p className="text-lg text-muted-foreground">
            Access cutting-edge AI capabilities powered by Grok from @applyai. 
            Generate images, analyze code, understand vision, solve complex problems with reasoning, 
            and tap into real-time social intelligence.
          </p>
        </div>
      </div>
    </div>
  );
}
