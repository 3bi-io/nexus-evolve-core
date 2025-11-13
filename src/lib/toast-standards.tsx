import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";

/**
 * Standardized toast notifications with consistent styling and behavior
 */

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  description?: string;
  action?: ToastAction;
  duration?: number;
}

/**
 * Success toast - for completed actions
 */
export function toastSuccess(message: string, options?: ToastOptions) {
  toast.success(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
    icon: <CheckCircle2 className="w-5 h-5" />,
  });
}

/**
 * Error toast - for failed actions
 */
export function toastError(message: string, options?: ToastOptions) {
  toast.error(message, {
    description: options?.description,
    duration: options?.duration || 6000,
    action: options?.action,
    icon: <XCircle className="w-5 h-5" />,
  });
}

/**
 * Warning toast - for cautionary messages
 */
export function toastWarning(message: string, options?: ToastOptions) {
  toast.warning(message, {
    description: options?.description,
    duration: options?.duration || 5000,
    action: options?.action,
    icon: <AlertCircle className="w-5 h-5" />,
  });
}

/**
 * Info toast - for informational messages
 */
export function toastInfo(message: string, options?: ToastOptions) {
  toast.info(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
    icon: <Info className="w-5 h-5" />,
  });
}

/**
 * Loading toast - for ongoing operations
 * Returns toast ID for dismissal
 */
export function toastLoading(message: string, options?: Omit<ToastOptions, 'action'>) {
  return toast.loading(message, {
    description: options?.description,
    duration: Infinity,
    icon: <Loader2 className="w-5 h-5 animate-spin" />,
  });
}

/**
 * Promise toast - automatically shows loading, success, or error
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts() {
  toast.dismiss();
}
