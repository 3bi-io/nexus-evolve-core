import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const BETA_ACTIVITIES = [
  { name: 'Beta tester', location: 'San Francisco', action: 'joined early access' },
  { name: 'Early user', location: 'New York', action: 'locked in founder rate' },
  { name: 'Pioneer', location: 'London', action: 'testing voice AI' },
  { name: 'Beta user', location: 'Berlin', action: 'building custom agent' },
  { name: 'Early adopter', location: 'Austin', action: 'joined the beta' },
  { name: 'Founder', location: 'Seattle', action: 'claimed beta access' },
  { name: 'Beta tester', location: 'Boston', action: 'exploring features' },
  { name: 'Pioneer', location: 'Toronto', action: 'got early access' },
];

export function SocialProofNotification() {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showNotification = () => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 5000);
    };

    // Show first notification after 3 seconds
    const initialTimeout = setTimeout(showNotification, 3000);

      // Then cycle through notifications every 15 seconds
      const interval = setInterval(() => {
        setCurrentActivity((prev) => (prev + 1) % BETA_ACTIVITIES.length);
        showNotification();
      }, 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const activity = BETA_ACTIVITIES[currentActivity];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed bottom-6 left-6 z-50 pointer-events-none"
        >
          <div className="bg-card border border-border shadow-lg rounded-lg p-4 flex items-center gap-3 max-w-sm backdrop-blur-sm">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary">
                {activity.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.name}</p>
              <p className="text-xs text-muted-foreground">{activity.action}</p>
            </div>
            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}