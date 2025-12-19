import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SafeAnimatePresence } from '@/components/ui/SafeAnimatePresence';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Briefcase,
  Palette,
  Mic,
  Bot,
  Zap,
  Brain,
  Image,
  MessageSquare,
  TrendingUp,
  Users,
  Workflow,
  Shield,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WIZARD_KEY = 'hasCompletedGoalWizard';

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  badge?: string;
}

const goals: Goal[] = [
  {
    id: 'automation',
    title: 'Business Automation',
    description: 'Automate workflows, analyze data, and boost productivity',
    icon: Briefcase,
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'content',
    title: 'Content Creation',
    description: 'Generate images, write copy, and create viral content',
    icon: Palette,
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'voice',
    title: 'Voice AI',
    description: 'Build voice agents, text-to-speech, and audio tools',
    icon: Mic,
    gradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    id: 'agents',
    title: 'Agent Building',
    description: 'Create custom AI agents and sell on the marketplace',
    icon: Bot,
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
];

const featuresByGoal: Record<string, Feature[]> = {
  automation: [
    {
      id: 'automation-hub',
      title: 'Automation Hub',
      description: 'Create automated pipelines that run 24/7 without your input',
      icon: Workflow,
      route: '/automation-hub',
      badge: 'Most Popular',
    },
    {
      id: 'smart-router',
      title: 'Smart AI Router',
      description: 'Automatically route tasks to the best AI model for each job',
      icon: Zap,
      route: '/router-dashboard',
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Track performance, costs, and optimization opportunities',
      icon: TrendingUp,
      route: '/advanced-analytics',
    },
  ],
  content: [
    {
      id: 'multimodal',
      title: 'Multimodal Studio',
      description: 'Generate stunning images, edit photos, and create visual content',
      icon: Image,
      route: '/multimodal-studio',
      badge: 'Creative Suite',
    },
    {
      id: 'social',
      title: 'Social Intelligence',
      description: 'Monitor trends, analyze sentiment, and create viral content',
      icon: TrendingUp,
      route: '/social-intelligence',
    },
    {
      id: 'chat',
      title: 'Multi-Agent Chat',
      description: 'Write copy, brainstorm ideas, and refine your content with AI',
      icon: MessageSquare,
      route: '/',
    },
  ],
  voice: [
    {
      id: 'voice-agent',
      title: 'Voice Agent Manager',
      description: 'Build and deploy conversational voice agents',
      icon: Mic,
      route: '/voice-agent-manager',
      badge: 'ElevenLabs',
    },
    {
      id: 'xai-studio',
      title: 'XAI Studio',
      description: 'Advanced voice synthesis and audio generation',
      icon: Brain,
      route: '/xai-studio',
    },
    {
      id: 'browser-ai',
      title: 'Private Browser AI',
      description: 'Run speech recognition offline in your browser',
      icon: Shield,
      route: '/browser-ai',
    },
  ],
  agents: [
    {
      id: 'agent-studio',
      title: 'Agent Studio',
      description: 'Build custom AI agents with your own knowledge base',
      icon: Bot,
      route: '/agent-studio',
      badge: 'Revenue Share',
    },
    {
      id: 'marketplace',
      title: 'Agent Marketplace',
      description: 'Discover, buy, and sell AI agents built by the community',
      icon: Users,
      route: '/agent-marketplace',
    },
    {
      id: 'analytics',
      title: 'Agent Analytics',
      description: 'Track performance and revenue from your agents',
      icon: TrendingUp,
      route: '/agent-analytics',
    },
  ],
};

export function GoalWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'goals' | 'features'>('goals');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const hasCompleted = localStorage.getItem(WIZARD_KEY);
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    
    // Show for users who completed basic onboarding OR after 2 seconds for new users
    if (!hasCompleted) {
      const delay = hasCompletedOnboarding ? 500 : 2000;
      const timer = setTimeout(() => setIsOpen(true), delay);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for manual trigger
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('show-goal-wizard', handler);
    return () => window.removeEventListener('show-goal-wizard', handler);
  }, []);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    setStep('features');
  };

  const handleBack = () => {
    setStep('goals');
    setSelectedGoal(null);
  };

  const handleComplete = () => {
    localStorage.setItem(WIZARD_KEY, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleFeatureClick = (route: string) => {
    handleComplete();
    navigate(route);
  };

  const selectedGoalData = goals.find(g => g.id === selectedGoal);
  const features = selectedGoal ? featuresByGoal[selectedGoal] : [];

  if (!isOpen) return null;

  return (
    <SafeAnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={handleSkip}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-primary/20">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {step === 'goals' ? 'What brings you here?' : 'Your Top 3 Features'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {step === 'goals' 
                      ? 'Select your primary goal to see personalized recommendations'
                      : `Perfect for ${selectedGoalData?.title.toLowerCase()}`
                    }
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mt-1"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            <Progress value={step === 'goals' ? 50 : 100} className="h-1" />

            {/* Content */}
            <SafeAnimatePresence mode="wait">
              {step === 'goals' ? (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {goals.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => handleGoalSelect(goal.id)}
                        className={`group relative p-4 rounded-xl border border-border bg-gradient-to-br ${goal.gradient} hover:border-primary/50 transition-all duration-300 text-left`}
                      >
                        <div className="space-y-3">
                          <div className="rounded-lg bg-background/80 p-2.5 w-fit">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {goal.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {goal.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="features"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.button
                        key={feature.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleFeatureClick(feature.route)}
                        className="group w-full p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all duration-300 text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-lg bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold group-hover:text-primary transition-colors">
                                {feature.title}
                              </h3>
                              {feature.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {feature.badge}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs ml-auto">
                                #{index + 1}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {feature.description}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </SafeAnimatePresence>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {step === 'features' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Change Goal
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className={step === 'goals' ? 'w-full' : 'flex-1'}
              >
                {step === 'goals' ? 'Skip for now' : 'Explore on my own'}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </SafeAnimatePresence>
  );
}

export function resetGoalWizard() {
  localStorage.removeItem(WIZARD_KEY);
}

export function showGoalWizard() {
  localStorage.removeItem(WIZARD_KEY);
  window.dispatchEvent(new CustomEvent('show-goal-wizard'));
}
