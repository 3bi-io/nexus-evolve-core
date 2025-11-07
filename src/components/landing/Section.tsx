import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  badge?: {
    text: string;
    icon?: ReactNode;
  };
  background?: 'default' | 'muted' | 'gradient';
  fullWidth?: boolean;
}

export function Section({
  children,
  className,
  title,
  subtitle,
  badge,
  background = 'default',
  fullWidth = false,
}: SectionProps) {
  const backgroundClasses = {
    default: '',
    muted: 'bg-muted/30 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12',
    gradient: 'bg-gradient-to-b from-primary/5 to-background -mx-4 px-4',
  };

  return (
    <section className={cn('section-spacing', backgroundClasses[background], className)}>
      <div className={cn(fullWidth ? 'w-full' : 'container mx-auto', 'space-mobile')}>
        {(badge || title || subtitle) && (
          <div className="text-center space-mobile px-4">
            {badge && (
              <Badge variant="outline" className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                {badge.icon}
                {badge.text}
              </Badge>
            )}
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
