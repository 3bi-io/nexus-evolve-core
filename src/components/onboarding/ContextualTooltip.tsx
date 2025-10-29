import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lightbulb } from 'lucide-react';

interface ContextualTooltipProps {
  id: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onDismiss?: () => void;
}

export function ContextualTooltip({ 
  id, 
  title, 
  description, 
  position = 'bottom',
  onDismiss 
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`tooltip_dismissed_${id}`);
    if (!dismissed) {
      setTimeout(() => setIsVisible(true), 500);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`tooltip_dismissed_${id}`, 'true');
    onDismiss?.();
  };

  if (!isVisible) return null;

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <Card className={`absolute ${positionClasses[position]} w-64 shadow-lg z-50 animate-scale-in`}>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary flex-shrink-0" />
            <h4 className="font-semibold text-sm">{title}</h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 -mt-1"
            onClick={handleDismiss}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Button size="sm" onClick={handleDismiss} className="w-full">
          Got it!
        </Button>
      </div>
    </Card>
  );
}
