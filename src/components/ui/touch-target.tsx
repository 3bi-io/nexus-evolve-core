import * as React from "react";
import { cn } from "@/lib/utils";

interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "default" | "sm" | "lg";
}

/**
 * TouchTarget ensures minimum 44x44px touch targets on mobile devices
 * while respecting original sizes on desktop.
 */
export const TouchTarget = React.forwardRef<HTMLDivElement, TouchTargetProps>(
  ({ children, size = "default", className, ...props }, ref) => {
    const sizeClasses = {
      default: "min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0",
      sm: "min-h-[40px] min-w-[40px] md:min-h-0 md:min-w-0",
      lg: "min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center touch-target",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchTarget.displayName = "TouchTarget";
