import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

export function EmptyStateCard({ 
  icon: Icon, 
  title, 
  description, 
  action,
  secondaryAction,
  variant = 'default',
  className
}: EmptyStateCardProps) {
  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        isInline ? "w-full" : "flex items-center justify-center",
        !isCompact && !isInline && "min-h-[300px]",
        className
      )}
    >
      <Card className={cn(
        "text-center",
        isCompact ? "p-6" : "p-8 max-w-md w-full",
        isInline && "col-span-full"
      )}>
        <div className={cn(
          "flex flex-col items-center",
          isCompact ? "space-y-3" : "space-y-4"
        )}>
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className={cn(
              "rounded-full bg-primary/10 flex items-center justify-center",
              isCompact ? "p-3" : "p-4"
            )}
          >
            <Icon className={cn(
              "text-primary",
              isCompact ? "h-6 w-6" : "h-8 w-8"
            )} />
          </motion.div>
          
          <div className="space-y-1.5">
            <h3 className={cn(
              "font-semibold",
              isCompact ? "text-base" : "text-xl"
            )}>{title}</h3>
            <p className={cn(
              "text-muted-foreground leading-relaxed",
              isCompact ? "text-xs" : "text-sm"
            )}>{description}</p>
          </div>

          {(action || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              {action && (
                <Button 
                  onClick={action.onClick} 
                  variant={action.variant || 'default'}
                  size={isCompact ? 'sm' : 'default'}
                  className="hover:scale-105 transition-transform"
                >
                  {action.label}
                </Button>
              )}
              {secondaryAction && (
                <Button 
                  onClick={secondaryAction.onClick}
                  variant="ghost"
                  size={isCompact ? 'sm' : 'default'}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
