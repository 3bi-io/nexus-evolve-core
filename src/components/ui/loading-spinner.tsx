import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size], className)} />
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
    </div>
  );
}

export function LoadingPulse({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
      <div className="w-3 h-3 bg-primary rounded-full animate-pulse [animation-delay:0.2s]" />
      <div className="w-3 h-3 bg-primary rounded-full animate-pulse [animation-delay:0.4s]" />
    </div>
  );
}

export function ShimmerLoader({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-full h-4 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded",
        "bg-[length:200%_100%] animate-shimmer",
        className
      )} 
    />
  );
}
