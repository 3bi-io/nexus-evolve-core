import { Zap, Brain, Rocket, LucideIcon } from 'lucide-react';

export interface Step {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const steps: Step[] = [
  {
    number: 1,
    title: 'Sign Up (30 seconds)',
    description: 'Create your free account. No credit card required. Get instant access to all 9 AI systems.',
    icon: Zap,
  },
  {
    number: 2,
    title: 'AI Learns You (automatic)',
    description: 'Start chatting. Our agents automatically learn your patterns, build your knowledge graph, and remember everything.',
    icon: Brain,
  },
  {
    number: 3,
    title: 'Ship 3x Faster (ongoing)',
    description: 'Watch your productivity multiply as AI evolves, predicts your needs, and automates repetitive work.',
    icon: Rocket,
  },
];
