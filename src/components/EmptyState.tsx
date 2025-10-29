import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          {mockup ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              {mockup}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="rounded-full bg-primary/10 p-4 animate-pulse-glow">
                <Icon className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </motion.div>

          {action && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button onClick={action.onClick} size="lg" className="mt-4 hover:scale-105 transition-transform">
                {action.label}
              </Button>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
