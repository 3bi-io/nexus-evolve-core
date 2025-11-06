import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  center?: boolean;
  fullHeight?: boolean;
}

const sizeClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'px-3 py-3 sm:px-4 sm:py-4',
  md: 'px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8',
  lg: 'px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12',
};

export function ResponsiveContainer({
  children,
  className,
  size = 'xl',
  padding = 'md',
  center = true,
  fullHeight = false,
}: ResponsiveContainerProps) {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div
      className={cn(
        'w-full',
        center && 'mx-auto',
        sizeClasses[size],
        paddingClasses[padding],
        fullHeight && 'min-h-screen',
        // Mobile-first: reduce padding on smaller screens
        isMobile && 'px-3',
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4 lg:gap-6',
  lg: 'gap-4 sm:gap-6 lg:gap-8',
};

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
}: ResponsiveGridProps) {
  const colClasses = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;

  return (
    <div
      className={cn(
        'grid',
        colClasses,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal' | 'responsive';
  gap?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

const stackGapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function ResponsiveStack({
  children,
  className,
  direction = 'responsive',
  gap = 'md',
  align = 'stretch',
}: ResponsiveStackProps) {
  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
    responsive: 'flex-col md:flex-row',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        stackGapClasses[gap],
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}
