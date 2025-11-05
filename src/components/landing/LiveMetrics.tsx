import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function LiveMetrics() {
  return (
    <div className="flex flex-wrap justify-center gap-6 text-sm">
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-semibold">Beta Launch</span>
        <span className="text-muted-foreground">Join the first wave of users</span>
      </motion.div>
    </div>
  );
}