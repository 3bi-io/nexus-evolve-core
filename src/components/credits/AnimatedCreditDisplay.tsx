import { Infinity } from 'lucide-react';

interface AnimatedCreditDisplayProps {
  credits: number;
  onCreditDeduct?: () => void;
}

export function AnimatedCreditDisplay({ credits, onCreditDeduct }: AnimatedCreditDisplayProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
      <Infinity className="w-5 h-5 text-primary" />
      <span className="text-lg font-bold text-primary">Unlimited</span>
    </div>
  );
}
