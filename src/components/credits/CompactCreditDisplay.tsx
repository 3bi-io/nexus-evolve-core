import { motion } from 'framer-motion';
import { Zap, Globe } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';

interface CompactCreditDisplayProps {
  credits: number;
  isAnonymous?: boolean;
}

export function CompactCreditDisplay({ credits, isAnonymous }: CompactCreditDisplayProps) {
  const { isMobile } = useMobile();

  const getColorClass = () => {
    if (credits > 20) return 'text-success';
    if (credits >= 5) return 'text-warning';
    return 'text-destructive';
  };

  if (isAnonymous && isMobile) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10">
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary">5 free searches</span>
      </div>
    );
  }

  if (!isMobile) {
    // Desktop: show full display
    return null; // Use original AnimatedCreditDisplay
  }

  return (
    <motion.div 
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-card/50 backdrop-blur-sm"
      whileTap={{ scale: 0.95 }}
    >
      <Zap className={`w-4 h-4 ${getColorClass()}`} />
      <motion.span
        key={credits}
        className={`text-sm font-bold ${getColorClass()} tabular-nums`}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {credits}
      </motion.span>
    </motion.div>
  );
}
