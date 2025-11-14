import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

/**
 * Bottom banner update notification for mobile
 * Less intrusive than full-screen modal
 */
export function UpdateNotification({ onUpdate, onDismiss }: UpdateNotificationProps) {
  const [visible, setVisible] = useState(true);
  const [slideUp, setSlideUp] = useState(false);

  useEffect(() => {
    // Slide up animation after mount
    setTimeout(() => setSlideUp(true), 100);
  }, []);

  const handleDismiss = () => {
    setSlideUp(false);
    setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 300);
  };

  const handleUpdate = () => {
    setSlideUp(false);
    setTimeout(() => {
      onUpdate();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe transition-transform duration-300',
        slideUp ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <Card className="relative bg-card/95 backdrop-blur-lg border-primary/20 shadow-2xl">
        <div className="flex items-center gap-3 p-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Update Available
            </h3>
            <p className="text-xs text-muted-foreground">
              Tap to refresh and get the latest features
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              className="min-h-[44px] px-4"
            >
              Update
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDismiss}
              className="min-h-[44px] min-w-[44px]"
              aria-label="Dismiss update notification"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
