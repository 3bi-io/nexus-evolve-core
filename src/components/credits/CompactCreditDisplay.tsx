import { motion } from 'framer-motion';
import { Zap, Globe } from 'lucide-react';
import { useMobile } from '@/hooks/useResponsive';

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

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10">
      <Globe className="w-4 h-4 text-primary" />
      <span className="text-xs font-semibold text-primary">🔥 Sale</span>
    </div>
  );
}
