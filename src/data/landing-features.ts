import { Brain, Shield, Users, Sparkles, Zap, Target, Code, LucideIcon } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  stat: string;
}

export const features: Feature[] = [
  {
    icon: Brain,
    title: 'Ship Products 3x Faster',
    description: '5 specialized agents coordinate to solve complex problems. What used to take weeks now takes days.',
    badge: 'Multi-Agent',
    stat: '3x faster',
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'Advanced bot detection, geographic risk blocking, brute force protection, and real-time threat monitoring.',
    badge: 'Security',
    stat: 'Bank-level',
  },
  {
    icon: Users,
    title: 'Never Repeat Yourself Again',
    description: 'Temporal memory that remembers every conversation forever. AI gets sharper over time, not dumber.',
    badge: 'Memory',
    stat: 'Perfect recall',
  },
  {
    icon: Sparkles,
    title: 'AI That Evolves While You Sleep',
    description: 'Autonomous learning system analyzes patterns, discovers capabilities, and improves itself daily.',
    badge: 'Self-Learning',
    stat: 'Auto-improves',
  },
  {
    icon: Zap,
    title: 'Predict What You Need Next',
    description: 'Predictive AI learns your patterns and proactively suggests solutions before you ask.',
    badge: 'Predictive',
    stat: '87% accuracy',
  },
  {
    icon: Target,
    title: 'Talk, Don\'t Type',
    description: 'Natural voice conversations with ElevenLabs AI. Have meetings, not messages.',
    badge: 'Voice AI',
    stat: 'Natural speech',
  },
  {
    icon: Code,
    title: 'Build Without Coding',
    description: 'Agent marketplace with 1,000+ ready agents. Or build your own in minutes and monetize them.',
    badge: 'No-Code',
    stat: '1,000+ agents',
  },
];
