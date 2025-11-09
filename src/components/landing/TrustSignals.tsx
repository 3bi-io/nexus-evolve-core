import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeAnimatePresence } from '@/components/ui/SafeAnimatePresence';

const ACTIVITY_MESSAGES = [
  { location: 'San Francisco', action: 'started a voice conversation' },
  { location: 'New York', action: 'created a custom agent' },
  { location: 'London', action: 'analyzed trending topics' },
  { location: 'Tokyo', action: 'generated an image with AI' },
  { location: 'Berlin', action: 'unlocked Achievement: Power User' },
  { location: 'Sydney', action: 'shared their referral code' },
  { location: 'Toronto', action: 'upgraded to Enterprise' },
  { location: 'Paris', action: 'built a knowledge graph' },
  { location: 'Singapore', action: 'connected Zapier integration' },
  { location: 'Dubai', action: 'published agent to marketplace' },
];

export function TrustSignals() {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [showActivity, setShowActivity] = useState(true);

  useEffect(() => {
    // Validate ACTIVITY_MESSAGES array
    if (!ACTIVITY_MESSAGES || ACTIVITY_MESSAGES.length === 0) {
      console.warn('[TrustSignals] ACTIVITY_MESSAGES is empty or undefined');
      return;
    }

    const interval = setInterval(() => {
      setShowActivity(false);
      setTimeout(() => {
        setCurrentActivity((prev) => {
          const nextIndex = (prev + 1) % ACTIVITY_MESSAGES.length;
          // Bounds check to ensure valid index
          return nextIndex < ACTIVITY_MESSAGES.length ? nextIndex : 0;
        });
        setShowActivity(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Defensive: Ensure activity exists with bounds check
  const activity = ACTIVITY_MESSAGES[currentActivity] || ACTIVITY_MESSAGES[0];
  if (!activity) return null;

  return (
    <div className="space-y-8">
      {/* Live Activity Ticker */}
      <div className="flex justify-center">
        <SafeAnimatePresence mode="wait">
          {showActivity && (
            <motion.div
              key={currentActivity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="px-4 py-2 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-muted-foreground">
                    Someone in <span className="font-semibold text-foreground">{activity.location}</span>{' '}
                    just {activity.action}
                  </span>
                </div>
              </Card>
            </motion.div>
          )}
        </SafeAnimatePresence>
      </div>

      {/* Trust Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <Card className="p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1">
          <Zap className="h-8 w-8 mx-auto mb-2 text-warning" />
          <div className="text-2xl font-bold">&lt;1.5s</div>
          <div className="text-xs text-muted-foreground">Response Time</div>
        </Card>

        <Card className="p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1">
          <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
          <div className="text-2xl font-bold">9</div>
          <div className="text-xs text-muted-foreground">AI Systems</div>
        </Card>
      </div>

      {/* Security Badges */}
      <div className="flex flex-wrap justify-center gap-4">
        <Badge variant="outline" className="px-4 py-2 hover:bg-primary/10 transition-colors">
          <Shield className="h-4 w-4 mr-2" />
          Enterprise Security
        </Badge>
        <Badge variant="outline" className="px-4 py-2 hover:bg-primary/10 transition-colors">
          <Shield className="h-4 w-4 mr-2" />
          GDPR Compliant
        </Badge>
        <Badge variant="outline" className="px-4 py-2 hover:bg-primary/10 transition-colors">
          <Users className="h-4 w-4 mr-2" />
          5 AI Agents
        </Badge>
      </div>
    </div>
  );
}
