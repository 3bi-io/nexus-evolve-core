import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatedCreditDisplay } from "@/components/credits/AnimatedCreditDisplay";

export const CreditBalance = () => {
  const { user, credits, refreshCredits } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refreshCredits();
  }, [user]);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <AnimatedCreditDisplay credits={credits} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">Credit Balance</p>
              <p className="text-sm text-muted-foreground">
                {credits} credits remaining
              </p>
              <p className="text-xs text-muted-foreground">
                Each operation costs 1-3 credits
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
        
        {user && credits <= 10 && (
          <Button
            size="sm"
            variant="default"
            onClick={() => navigate('/pricing')}
            className="ml-2"
          >
            Upgrade
          </Button>
        )}
        
        {!user && (
          <Button
            size="sm"
            variant="default"
            onClick={() => navigate('/auth')}
            className="ml-2"
          >
            Sign Up Free
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
};
