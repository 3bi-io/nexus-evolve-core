import { LucideIcon } from 'lucide-react';

/**
 * Represents a step in the "How It Works" section
 */
export interface Step {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Represents a feature in the agent system showcase
 */
export interface AgentFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

/**
 * Props for CTA (Call To Action) components
 */
export interface CTAProps {
  title: string;
  description: string;
  primaryAction?: {
    text: string;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  badge?: {
    text: string;
    icon?: LucideIcon;
  };
}

/**
 * Props for section components with consistent structure
 */
export interface SectionProps {
  title?: string;
  subtitle?: string;
  badge?: {
    text: string;
    icon?: React.ReactNode;
  };
  className?: string;
  background?: 'default' | 'muted' | 'gradient';
}
