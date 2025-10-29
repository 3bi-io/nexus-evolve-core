import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Users, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIVITY_MESSAGES = [
  { location: 'San Francisco', action: 'upgraded to Pro' },
  { location: 'New York', action: 'extracted 10 learnings' },
  { location: 'London', action: 'started their AI journey' },
  { location: 'Tokyo', action: 'completed 50 conversations' },
  { location: 'Berlin', action: 'unlocked new capabilities' },
  { location: 'Sydney', action: 'signed up for free' },
  { location: 'Toronto', action: 'upgraded to Enterprise' },
  { location: 'Paris', action: 'built their knowledge graph' },
];

export function TrustSignals() {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [showActivity, setShowActivity] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowActivity(false);
      setTimeout(() => {
        setCurrentActivity((prev) => (prev + 1) % ACTIVITY_MESSAGES.length);
        setShowActivity(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const activity = ACTIVITY_MESSAGES[currentActivity];

  return (
    <div className="space-y-8">
      {/* Live Activity Ticker */}
      <div className="flex justify-center">
        <AnimatePresence mode="wait">
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
        </AnimatePresence>
      </div>

      {/* Trust Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center hover:shadow-lg transition-shadow">
          <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">50,000+</div>
          <div className="text-xs text-muted-foreground">Conversations</div>
        </Card>

        <Card className="p-4 text-center hover:shadow-lg transition-shadow">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
          <div className="text-2xl font-bold">95%</div>
          <div className="text-xs text-muted-foreground">Quality Score</div>
        </Card>

        <Card className="p-4 text-center hover:shadow-lg transition-shadow">
          <Zap className="h-8 w-8 mx-auto mb-2 text-warning" />
          <div className="text-2xl font-bold">&lt;2s</div>
          <div className="text-xs text-muted-foreground">Avg Response</div>
        </Card>

        <Card className="p-4 text-center hover:shadow-lg transition-shadow">
          <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
          <div className="text-2xl font-bold">24/7</div>
          <div className="text-xs text-muted-foreground">Available</div>
        </Card>
      </div>

      {/* Security Badges */}
      <div className="flex flex-wrap justify-center gap-4">
        <Badge variant="outline" className="px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          Bank-level Encryption
        </Badge>
        <Badge variant="outline" className="px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          GDPR Compliant
        </Badge>
        <Badge variant="outline" className="px-4 py-2">
          <Zap className="h-4 w-4 mr-2" />
          99.9% Uptime
        </Badge>
      </div>
    </div>
  );
}
