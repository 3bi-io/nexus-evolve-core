import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  mockup?: React.ReactNode;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  mockup 
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {mockup ? (
          <div className="mb-4 opacity-50">{mockup}</div>
        ) : (
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {action && (
          <Button onClick={action.onClick} size="lg" className="mt-4">
            {action.label}
          </Button>
        )}
      </Card>
    </div>
  );
}
