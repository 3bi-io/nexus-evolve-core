import { motion } from 'framer-motion';
import { Zap, Crown, Sparkles } from 'lucide-react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CompactCreditDisplayProps {
  showBadge?: boolean;
  showProgress?: boolean;
  className?: string;
}

export function CompactCreditDisplay({ 
  showBadge = true, 
  showProgress = false,
  className 
}: CompactCreditDisplayProps) {
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
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted animate-pulse", className)}>
        <div className="w-4 h-4 bg-muted-foreground/20 rounded" />
        <div className="w-12 h-4 bg-muted-foreground/20 rounded" />
      </div>
    );
  }

  const getTierIcon = () => {
    if (isEnterprise) return <Crown className="w-4 h-4" />;
    if (isPro) return <Sparkles className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const getTierColor = () => {
    if (isEnterprise) return 'text-amber-500';
    if (isPro) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getCreditsColor = () => {
    if (isEnterprise) return 'text-amber-500';
    if (isLowCredits) return 'text-destructive';
    if (creditsPercentage < 50) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showBadge && (
        <Badge 
          variant={isFreeTier ? "secondary" : "default"} 
          className={cn("text-xs font-medium gap-1", getTierColor())}
        >
          {getTierIcon()}
          <span className="capitalize">{tier === "starter" ? "Free" : tier}</span>
        </Badge>
      )}
      
      <motion.div 
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 border border-border/50"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Zap className={cn("w-3.5 h-3.5", getCreditsColor())} />
        <span className={cn("text-sm font-semibold tabular-nums", getCreditsColor())}>
          {formattedCreditsRemaining}
        </span>
        {!isEnterprise && (
          <span className="text-xs text-muted-foreground">
            / {formattedCreditsTotal}
          </span>
        )}
      </motion.div>

      {showProgress && !isEnterprise && (
        <Progress 
          value={creditsPercentage} 
          className="w-16 h-1.5"
        />
      )}
    </div>
  );
}
