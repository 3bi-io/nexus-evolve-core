import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: 'default' | 'no-data' | 'no-results' | 'no-access';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const variantStyles = {
    default: 'text-muted-foreground',
    'no-data': 'text-muted-foreground',
    'no-results': 'text-yellow-600 dark:text-yellow-500',
    'no-access': 'text-destructive',
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn(
        "w-16 h-16 mb-4 rounded-full flex items-center justify-center",
        "bg-muted/50 dark:bg-muted/20"
      )}>
        <Icon className={cn("w-8 h-8", variantStyles[variant])} />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
