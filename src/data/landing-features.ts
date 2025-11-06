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
    title: 'Multi-Modal AI Workflows',
    description: 'Chain vision analysis, image generation, code analysis, and reasoning in automated workflows. Solve complex tasks in minutes, not hours.',
    badge: 'XAI Studio',
    stat: '5+ Modalities',
  },
  {
    icon: Zap,
    title: 'Automated Content Pipelines',
    description: 'AI-powered content generation with priority queues. Set it up once, get fresh content continuously without manual work.',
    badge: 'Automation',
    stat: 'Always-on',
  },
  {
    icon: Shield,
    title: 'Smart Caching & Optimization',
    description: 'Intelligent response caching with automatic cleanup. Reduce costs by 70% while maintaining blazing-fast performance.',
    badge: 'Performance',
    stat: '70% savings',
  },
  {
    icon: Target,
    title: 'Scheduled Trend Monitoring',
    description: 'AI monitors social trends, competitors, sentiment every 6 hours. Get alerts when opportunities arise or threats emerge.',
    badge: 'Intelligence',
    stat: 'Every 6hrs',
  },
  {
    icon: Users,
    title: 'Temporal Memory System',
    description: 'AI remembers every conversation forever with vector search. Context that grows smarter over time, never forgets.',
    badge: 'Memory',
    stat: 'Perfect recall',
  },
  {
    icon: Sparkles,
    title: 'Vision & Image Generation',
    description: 'Analyze images with Grok Vision, generate with Gemini Nano. Edit, reimagine, and create visual content at scale.',
    badge: 'Multi-Modal',
    stat: 'Unlimited',
  },
  {
    icon: Code,
    title: 'Custom Agent Builder',
    description: 'Build intelligent agents with knowledge bases, custom instructions, and revenue sharing. Deploy in minutes, monetize forever.',
    badge: 'No-Code',
    stat: 'Rev share',
  },
];
