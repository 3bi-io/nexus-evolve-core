import { motion } from 'framer-motion';
import { Zap, Crown, Sparkles, AlertTriangle } from 'lucide-react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function HeaderCreditBadge() {
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
      <div className="w-20 h-8 rounded-lg bg-muted animate-pulse" />
    );
  }

  const getTierIcon = () => {
    if (isEnterprise) return <Crown className="w-3.5 h-3.5" />;
    if (isPro) return <Sparkles className="w-3.5 h-3.5" />;
    return <Zap className="w-3.5 h-3.5" />;
  };

  const getBadgeVariant = () => {
    if (isLowCredits) return 'destructive';
    if (isEnterprise) return 'default';
    if (isPro) return 'default';
    return 'secondary';
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/account">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Badge 
                variant={getBadgeVariant()}
                className={cn(
                  "gap-1.5 px-2.5 py-1.5 cursor-pointer transition-colors",
                  isLowCredits && "animate-pulse",
                  isEnterprise && "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20",
                  isPro && !isLowCredits && "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                )}
              >
                {getTierIcon()}
                <span className="font-semibold tabular-nums">
                  {isEnterprise ? '∞' : formattedCreditsRemaining}
                </span>
                {isLowCredits && (
                  <AlertTriangle className="w-3 h-3 ml-0.5" />
                )}
              </Badge>
            </motion.div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="space-y-2 p-3">
          <div className="flex items-center gap-2">
            {getTierIcon()}
            <span className="font-medium capitalize">
              {tier === 'starter' ? 'Free Plan' : `${tier} Plan`}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {isEnterprise ? (
              'Unlimited credits'
            ) : (
              <>
                <span className={cn(isLowCredits && "text-destructive font-medium")}>
                  {formattedCreditsRemaining}
                </span>
                {' / '}{formattedCreditsTotal} credits remaining
              </>
            )}
          </div>
          {!isEnterprise && (
            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  isLowCredits ? "bg-destructive" : creditsPercentage < 50 ? "bg-warning" : "bg-primary"
                )}
                style={{ width: `${creditsPercentage}%` }}
              />
            </div>
          )}
          {isLowCredits && isFreeTier && (
            <p className="text-xs text-destructive pt-1">
              Running low! Click to upgrade →
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
