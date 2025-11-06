import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'default' | 'muted' | 'card';
  fullWidth?: boolean;
}

const spacingClasses = {
  none: '',
  sm: 'py-4 sm:py-6',
  md: 'py-6 sm:py-8 lg:py-12',
  lg: 'py-8 sm:py-12 lg:py-16',
};

const backgroundClasses = {
  default: 'bg-background',
  muted: 'bg-muted/30',
  card: 'bg-card border border-border rounded-lg',
};

export function ResponsiveSection({
  children,
  className,
  title,
  description,
  action,
  spacing = 'md',
  background = 'default',
  fullWidth = false,
}: ResponsiveSectionProps) {
  const { isMobile } = useResponsive();

  return (
    <section
      className={cn(
        spacingClasses[spacing],
        backgroundClasses[background],
        background === 'card' && 'p-4 sm:p-6 lg:p-8',
        className
      )}
    >
      {(title || description || action) && (
        <div
          className={cn(
            'mb-6 sm:mb-8',
            !fullWidth && 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          !fullWidth && 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
        )}
      >
        {children}
      </div>
    </section>
  );
}

interface MobileSafeAreaProps {
  children: ReactNode;
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function MobileSafeArea({
  children,
  top = true,
  bottom = true,
  className,
}: MobileSafeAreaProps) {
  return (
    <div
      className={cn(
        top && 'pt-safe-top',
        bottom && 'pb-safe-bottom',
        className
      )}
      style={{
        paddingTop: top ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: bottom ? 'env(safe-area-inset-bottom)' : undefined,
      }}
    >
      {children}
    </div>
  );
}

interface TouchTargetProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function TouchTarget({
  children,
  className,
  onClick,
  disabled = false,
}: TouchTargetProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Minimum 44x44px touch target for accessibility
        'min-h-[44px] min-w-[44px]',
        'inline-flex items-center justify-center',
        'touch-manipulation',
        'active:scale-95 transition-transform',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}
