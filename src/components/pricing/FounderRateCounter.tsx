// Phase 3.2: Founder rate urgency counter
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";
import { FOUNDER_RATE_SLOTS } from "@/lib/pricing-utils";

interface FounderRateCounterProps {
  slotsRemaining?: number;
}

export const FounderRateCounter = ({ slotsRemaining = 87 }: FounderRateCounterProps) => {
  const slotsTaken = FOUNDER_RATE_SLOTS - slotsRemaining;
  const percentageTaken = Math.round((slotsTaken / FOUNDER_RATE_SLOTS) * 100);

  return (
    <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Founder Rate Spots</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          {percentageTaken}% claimed
        </Badge>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{slotsTaken} of {FOUNDER_RATE_SLOTS} taken</span>
          <span className="font-semibold text-primary">{slotsRemaining} left</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
            style={{ width: `${percentageTaken}%` }}
          />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Lock in $29/mo forever before all spots are taken
      </p>
    </div>
  );
};
