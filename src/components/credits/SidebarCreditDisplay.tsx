import { motion } from 'framer-motion';
import { Zap, Crown, Sparkles, AlertTriangle } from 'lucide-react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarCreditDisplayProps {
  collapsed?: boolean;
}

export function SidebarCreditDisplay({ collapsed = false }: SidebarCreditDisplayProps) {
  const { 
    formattedCreditsRemaining, 
    formattedCreditsTotal,
    creditsPercentage,
    isLowCredits,
    tier,
    isFreeTier,
    isPro,
    isEnterprise,
    loading
  } = useSubscriptionContext();

  if (loading) {
    return (
      <div className={cn(
        "px-2 py-3",
        collapsed ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "animate-pulse rounded-lg bg-muted",
          collapsed ? "w-8 h-8" : "h-16 w-full"
        )} />
      </div>
    );
  }

  const getTierIcon = () => {
    if (isEnterprise) return <Crown className="w-4 h-4 text-amber-500" />;
    if (isPro) return <Sparkles className="w-4 h-4 text-primary" />;
    return <Zap className="w-4 h-4 text-muted-foreground" />;
  };

  const getProgressColor = () => {
    if (isLowCredits) return 'bg-destructive';
    if (creditsPercentage < 50) return 'bg-warning';
    return 'bg-primary';
  };

  // Collapsed view - just icon
  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/account" className="flex justify-center px-2 py-3">
              <motion.div 
                className={cn(
                  "relative p-2 rounded-lg",
                  isLowCredits ? "bg-destructive/10" : "bg-muted/50"
                )}
                animate={isLowCredits ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {getTierIcon()}
                {isLowCredits && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </motion.div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="space-y-1">
            <div className="font-medium capitalize">{tier} Plan</div>
            <div className="text-sm text-muted-foreground">
              {formattedCreditsRemaining} / {formattedCreditsTotal} credits
            </div>
            {isLowCredits && (
              <div className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Low credits - upgrade now
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Expanded view
  return (
    <Link to="/account" className="block px-2 py-3">
      <motion.div 
        className={cn(
          "p-3 rounded-lg border transition-colors hover:bg-muted/50",
          isLowCredits ? "border-destructive/30 bg-destructive/5" : "border-border"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getTierIcon()}
            <span className="text-sm font-medium capitalize">
              {tier === 'starter' ? 'Free' : tier}
            </span>
          </div>
          {isLowCredits && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </motion.div>
          )}
        </div>

        {/* Credits display */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className={cn(
              "text-lg font-bold tabular-nums",
              isLowCredits ? "text-destructive" : "text-foreground"
            )}>
              {formattedCreditsRemaining}
            </span>
            {!isEnterprise && (
              <span className="text-xs text-muted-foreground">
                / {formattedCreditsTotal}
              </span>
            )}
          </div>
          
          {!isEnterprise && (
            <Progress 
              value={creditsPercentage} 
              className={cn("h-1.5", getProgressColor())}
            />
          )}

          {isLowCredits && isFreeTier && (
            <p className="text-xs text-destructive">
              Upgrade for more credits →
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
