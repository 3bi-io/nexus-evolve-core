import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'inline' | 'full-page';
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  variant = 'inline',
  className,
}: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-2">
          <p>{message}</p>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="w-fit gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Full page error
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4 min-h-[400px]",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-destructive/10">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">
        {title}
      </h2>
      
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {message}
      </p>
      
      {onRetry && (
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
