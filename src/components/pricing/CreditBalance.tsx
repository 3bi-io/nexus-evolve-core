import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatedCreditDisplay } from "@/components/credits/AnimatedCreditDisplay";
import { CompactCreditDisplay } from "@/components/credits/CompactCreditDisplay";
import { useMobile } from "@/hooks/useMobile";

export const CreditBalance = () => {
  const { user, credits, refreshCredits } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useMobile();

  useEffect(() => {
    refreshCredits();
  }, [user]);

  // For anonymous users on mobile, show simple free searches message
  const isAnonymous = !user;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              {isMobile ? (
                <CompactCreditDisplay credits={credits} isAnonymous={isAnonymous} />
              ) : (
                <AnimatedCreditDisplay credits={credits} />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">
                {isAnonymous ? 'Free Searches' : 'AI Interactions Balance'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isAnonymous 
                  ? '5 free searches today' 
                  : `${credits} interactions remaining`}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAnonymous 
                  ? 'Sign up for 500 daily credits' 
                  : 'Each AI operation uses 1-3 interactions'}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
        
        {user && credits <= 10 && !isMobile && (
          <Button
            size="sm"
            variant="default"
            onClick={() => navigate('/pricing')}
            className="ml-2"
          >
            Upgrade
          </Button>
        )}
        
        {!user && !isMobile && (
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
