import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Infinity as InfinityIcon, TrendingDown, Crown, Sparkles } from 'lucide-react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatDistance } from 'date-fns';

interface AnimatedCreditDisplayProps {
  showRenewal?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AnimatedCreditDisplay({ 
  showRenewal = true,
  size = 'md',
  className 
}: AnimatedCreditDisplayProps) {
  const { 
    creditsRemaining,
    creditsTotal,
    formattedCreditsRemaining, 
    formattedCreditsTotal,
    creditsPercentage,
    isLowCredits,
    tier,
    isFreeTier,
    isPro,
    isEnterprise,
    subscriptionEnd,
    loading
  } = useSubscriptionContext();

  if (loading) {
    return (
      <div className={cn(
        "flex items-center gap-3 rounded-xl bg-muted animate-pulse",
        size === 'sm' && "px-3 py-2",
        size === 'md' && "px-4 py-3",
        size === 'lg' && "px-6 py-4",
        className
      )}>
        <div className="w-6 h-6 bg-muted-foreground/20 rounded" />
        <div className="w-24 h-6 bg-muted-foreground/20 rounded" />
      </div>
    );
  }

  const getTierIcon = () => {
    if (isEnterprise) return <Crown className="text-amber-500" />;
    if (isPro) return <Sparkles className="text-primary" />;
    return <Zap className="text-muted-foreground" />;
  };

  const getBgColor = () => {
    if (isEnterprise) return 'bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/20';
    if (isPro) return 'bg-gradient-to-r from-primary/10 to-accent/5 border-primary/20';
    return 'bg-muted/50 border-border/50';
  };

  const getProgressColor = () => {
    if (isLowCredits) return 'bg-destructive';
    if (creditsPercentage < 50) return 'bg-warning';
    return 'bg-success';
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl';
  const subTextSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  return (
    <motion.div 
      className={cn(
        "flex flex-col gap-2 rounded-xl border",
        size === 'sm' && "px-3 py-2",
        size === 'md' && "px-4 py-3",
        size === 'lg' && "px-6 py-4",
        getBgColor(),
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <motion.div 
            className={iconSize}
            animate={isLowCredits ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: isLowCredits ? Infinity : 0, duration: 1.5 }}
          >
            {getTierIcon()}
          </motion.div>
          
          <Badge 
            variant={isFreeTier ? "secondary" : "default"} 
            className="text-xs capitalize"
          >
            {tier === "starter" ? "Free" : tier}
          </Badge>
        </div>

        {isLowCredits && !isEnterprise && (
          <motion.div
            className="flex items-center gap-1 text-destructive"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">Low</span>
          </motion.div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <AnimatePresence mode="wait">
          <motion.span
            key={creditsRemaining}
            className={cn("font-bold tabular-nums", textSize)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {isEnterprise ? (
              <span className="flex items-center gap-2">
                <InfinityIcon className={cn(size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6')} />
                Unlimited
              </span>
            ) : (
              formattedCreditsRemaining
            )}
          </motion.span>
        </AnimatePresence>
        
        {!isEnterprise && (
          <span className={cn("text-muted-foreground", subTextSize)}>
            / {formattedCreditsTotal} credits
          </span>
        )}
      </div>

      {!isEnterprise && (
        <div className="space-y-1">
          <Progress 
            value={creditsPercentage}
            className="h-2"
          />
          <p className={cn("text-muted-foreground", subTextSize)}>
            {creditsPercentage}% remaining
          </p>
        </div>
      )}

      {showRenewal && subscriptionEnd && !isFreeTier && (
        <p className={cn("text-muted-foreground", subTextSize)}>
          Renews {formatDistance(new Date(subscriptionEnd), new Date(), { addSuffix: true })}
        </p>
      )}
    </motion.div>
  );
}
