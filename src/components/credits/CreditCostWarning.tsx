import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, ArrowRight, X } from 'lucide-react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// Credit costs matching backend CREDIT_COSTS
export const OPERATION_COSTS = {
  // Chat/AI operations
  'chat': 0.01,
  'gpt-4': 0.03,
  'gpt-4o': 0.025,
  'gpt-5': 0.05,
  'claude-sonnet-4': 0.012,
  'claude-opus-4-1': 0.075,
  'grok-3': 0.03,
  'grok-3-mini': 0.01,
  
  // Media operations
  'image-generation': 0.5,
  'image-analysis': 0.2,
  'text-to-speech': 0.1,
  'speech-to-text': 0.1,
  
  // Advanced operations
  'web-search': 0.05,
  'agent-execution': 0.1,
  'workflow-execution': 0.2,
  'code-analysis': 0.15,
  'embedding-generation': 0.01,
} as const;

export type OperationType = keyof typeof OPERATION_COSTS;

interface CreditCostWarningProps {
  operationType: OperationType;
  onProceed?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function CreditCostWarning({ 
  operationType, 
  onProceed, 
  onCancel,
  className 
}: CreditCostWarningProps) {
  const { 
    creditsRemaining, 
    isLowCredits,
    isFreeTier,
    isEnterprise
  } = useSubscriptionContext();

  const cost = OPERATION_COSTS[operationType] || 0.01;
  const hasEnough = isEnterprise || creditsRemaining >= cost;
  const willBeLow = creditsRemaining - cost < (creditsRemaining * 0.2);

  // Don't show warning if enterprise or has plenty of credits
  if (isEnterprise || (!isLowCredits && hasEnough && !willBeLow)) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={className}
      >
        <Alert 
          variant={hasEnough ? "default" : "destructive"}
          className={cn(
            "relative",
            hasEnough ? "border-warning/50 bg-warning/5" : ""
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            {hasEnough ? 'Credit Cost Notice' : 'Insufficient Credits'}
          </AlertTitle>
          <AlertDescription className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span>This operation costs</span>
              <span className="inline-flex items-center gap-1 font-semibold">
                <Zap className="w-3.5 h-3.5" />
                {cost.toFixed(2)} credits
              </span>
            </div>

            {!hasEnough ? (
              <div className="space-y-2">
                <p className="text-sm">
                  You have <strong>{creditsRemaining.toFixed(2)}</strong> credits remaining.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link to="/pricing">
                      Upgrade Now
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                  {onCancel && (
                    <Button size="sm" variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  After this: ~{(creditsRemaining - cost).toFixed(0)} credits left
                </p>
                <div className="flex gap-2">
                  {onProceed && (
                    <Button size="sm" onClick={onProceed}>
                      Continue
                    </Button>
                  )}
                  {onCancel && (
                    <Button size="sm" variant="ghost" onClick={onCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}

interface CreditCostBadgeProps {
  operationType: OperationType;
  className?: string;
}

export function CreditCostBadge({ operationType, className }: CreditCostBadgeProps) {
  const { isEnterprise } = useSubscriptionContext();
  const cost = OPERATION_COSTS[operationType] || 0.01;

  if (isEnterprise) return null;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs text-muted-foreground",
      className
    )}>
      <Zap className="w-3 h-3" />
      {cost < 0.1 ? cost.toFixed(2) : cost.toFixed(1)}
    </span>
  );
}
