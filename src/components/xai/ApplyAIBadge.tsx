import { Shield, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ApplyAIBadgeProps {
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
}

export function ApplyAIBadge({ variant = 'full', className = '' }: ApplyAIBadgeProps) {
  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className={`flex items-center gap-1 ${className}`}>
              <Shield className="w-4 h-4 text-primary" />
              <CheckCircle2 className="w-3 h-3 text-primary" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Verified by @applyai - Premium Organization</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'compact') {
    return (
      <Badge variant="outline" className={`flex items-center gap-1.5 ${className}`}>
        <Shield className="w-3 h-3" />
        <span className="font-semibold">@applyai</span>
        <CheckCircle2 className="w-3 h-3 text-primary" />
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 ${className}`}>
      <Shield className="w-5 h-5 text-primary" />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">@applyai</span>
          <CheckCircle2 className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground">Premium Verified Organization</span>
      </div>
    </div>
  );
}
