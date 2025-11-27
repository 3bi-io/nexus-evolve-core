import { AlertTriangle, RefreshCw, WifiOff, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  error: Error | string;
  onRetry?: () => void;
  context?: string;
}

export function ErrorMessage({ error, onRetry, context }: ErrorMessageProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Detect error type and provide user-friendly messages
  const getErrorDetails = () => {
    const msg = errorMessage.toLowerCase();
    
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('connect')) {
      return {
        title: 'Connection Issue',
        icon: WifiOff,
        description: 'Unable to connect to the server. Please check your internet connection and try again.',
        suggestion: 'Make sure you\'re connected to the internet',
      };
    }
    
    if (msg.includes('timeout')) {
      return {
        title: 'Request Timeout',
        icon: Server,
        description: 'The request took too long to complete. The server might be busy.',
        suggestion: 'Try again in a few moments',
      };
    }
    
    if (msg.includes('429') || msg.includes('rate limit')) {
      return {
        title: 'Too Many Requests',
        icon: AlertTriangle,
        description: 'You\'ve made too many requests. Please wait a moment before trying again.',
        suggestion: 'Rate limit resets every minute',
      };
    }
    
    if (msg.includes('402') || msg.includes('payment')) {
      return {
        title: 'Payment Required',
        icon: AlertTriangle,
        description: 'This feature requires credits. Please add credits to continue.',
        suggestion: 'Visit Settings → Usage to add credits',
      };
    }
    
    if (msg.includes('401') || msg.includes('unauthorized')) {
      return {
        title: 'Authentication Required',
        icon: AlertTriangle,
        description: 'You need to be signed in to access this feature.',
        suggestion: 'Please sign in to continue',
      };
    }
    
    if (msg.includes('403') || msg.includes('forbidden')) {
      return {
        title: 'Access Denied',
        icon: AlertTriangle,
        description: 'You don\'t have permission to access this resource.',
        suggestion: 'Contact support if you think this is an error',
      };
    }
    
    if (msg.includes('500') || msg.includes('server error')) {
      return {
        title: 'Server Error',
        icon: Server,
        description: 'Something went wrong on our end. We\'re working to fix it.',
        suggestion: 'Please try again in a few minutes',
      };
    }
    
    // Generic error
    return {
      title: context ? `Error in ${context}` : 'Something went wrong',
      icon: AlertTriangle,
      description: errorMessage || 'An unexpected error occurred',
      suggestion: 'Please try again or contact support if the issue persists',
    };
  };
  
  const errorDetails = getErrorDetails();
  const Icon = errorDetails.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert variant="destructive">
        <Icon className="h-4 w-4" />
        <AlertTitle>{errorDetails.title}</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{errorDetails.description}</p>
          {errorDetails.suggestion && (
            <p className="text-sm opacity-80">💡 {errorDetails.suggestion}</p>
          )}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2 bg-destructive/10 hover:bg-destructive/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}