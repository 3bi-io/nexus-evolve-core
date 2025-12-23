import { Badge } from "@/components/ui/badge";
import { Infinity } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const CreditBalance = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10">
            <Infinity className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Unlimited</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">✨ Free Forever Access</p>
            <p className="text-sm text-muted-foreground">
              Unlimited usage on all features - no credit card required
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
