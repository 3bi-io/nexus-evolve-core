// Phase 3.2: Founder rate urgency counter
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";
import { FOUNDER_RATE_SLOTS } from "@/lib/pricing-utils";
import { motion } from "framer-motion";
import { useMobile } from "@/hooks/useMobile";

interface FounderRateCounterProps {
  slotsRemaining?: number;
}

export const FounderRateCounter = ({ slotsRemaining = 87 }: FounderRateCounterProps) => {
  const slotsTaken = FOUNDER_RATE_SLOTS - slotsRemaining;
  const percentageTaken = Math.round((slotsTaken / FOUNDER_RATE_SLOTS) * 100);
  const { isMobile } = useMobile();

  // Color-coded urgency
  const getUrgencyColor = () => {
    if (slotsRemaining > 50) return 'from-success to-success';
    if (slotsRemaining > 20) return 'from-warning to-warning';
    return 'from-destructive to-destructive';
  };

  return (
    <div className={`mt-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 ${isMobile ? 'space-y-3' : ''}`}>
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} mb-2`}>
        <div className="flex items-center gap-2">
          <Users className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-primary`} />
          <span className={`${isMobile ? 'text-base' : 'text-sm'} font-semibold`}>
            Founder Rate Spots
          </span>
        </div>
        <Badge variant="secondary" className={`${isMobile ? 'text-sm w-fit' : 'text-xs'}`}>
          <TrendingUp className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} mr-1`} />
          {percentageTaken}% claimed
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-xs'} text-muted-foreground`}>
          <span>{slotsTaken} of {FOUNDER_RATE_SLOTS} taken</span>
          <motion.span 
            className={`font-bold ${slotsRemaining <= 20 ? 'text-destructive' : 'text-primary'} ${isMobile ? 'text-lg' : 'text-sm'}`}
            key={slotsRemaining}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {slotsRemaining} left
          </motion.span>
        </div>
        <div className={`${isMobile ? 'h-3' : 'h-2'} bg-muted rounded-full overflow-hidden`}>
          <motion.div 
            className={`h-full bg-gradient-to-r ${getUrgencyColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentageTaken}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
      
      <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-muted-foreground mt-2 ${isMobile ? 'font-medium' : ''}`}>
        Lock in <span className="font-bold text-primary">$29/mo forever</span> before all spots are taken
      </p>
    </div>
  );
};
