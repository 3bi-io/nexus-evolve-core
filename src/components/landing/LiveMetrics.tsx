import { useEffect, useState } from 'react';
import { Users, MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function LiveMetrics() {
  const [onlineUsers, setOnlineUsers] = useState(2847);
  const [interactions, setInteractions] = useState(23419);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 5));
      setInteractions(prev => prev + Math.floor(Math.random() * 15));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-6 text-sm">
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="font-mono font-semibold">{onlineUsers.toLocaleString()}</span>
        <span className="text-muted-foreground">online now</span>
      </motion.div>

      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono font-semibold">{interactions.toLocaleString()}</span>
        <span className="text-muted-foreground">interactions today</span>
      </motion.div>

      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-semibold">4.9/5</span>
        <span className="text-muted-foreground">from 2,847 reviews</span>
      </motion.div>
    </div>
  );
}