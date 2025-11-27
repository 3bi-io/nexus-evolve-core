import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, Sparkles, Zap, Globe, TrendingUp, LayoutGrid } from 'lucide-react';
import { useMobile, useHaptics } from '@/hooks/useMobile';
import { SafeAnimatePresence } from '@/components/ui/SafeAnimatePresence';

interface OnboardingStep {
  title: string;
  description: string;
  icon: typeof Sparkles;
  gradient: string;
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to Oneiros.me',
    description: 'The AI that gets smarter while you sleep. Free unlimited access to all features. No account required to get started.',
    icon: Sparkles,
    gradient: 'from-primary to-accent',
  },
  {
    title: 'Easy Navigation',
    description: 'Use the bottom nav to quickly access Chat, Marketplace, AGI Dashboard, Stats, and more.',
    icon: LayoutGrid,
    gradient: 'from-accent to-primary',
  },
  {
    title: 'Unlimited AI Access',
    description: 'All AI operations are completely free with unlimited usage. No credit card, no limits, just AI.',
    icon: Zap,
    gradient: 'from-warning to-primary',
  },
  {
    title: 'Real-Time Web Search',
    description: 'Enable web search in chat for live information. Great for current events, research, and fact-checking.',
    icon: Globe,
    gradient: 'from-success to-accent',
  },
  {
    title: 'Start Using Instantly',
    description: 'No signup required. Start chatting with AI immediately. Create an account only if you want to save preferences.',
    icon: TrendingUp,
    gradient: 'from-primary to-accent',
  },
];

export function MobileOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { isMobile } = useMobile();
  const { medium } = useHaptics();

  useEffect(() => {
    if (!isMobile) return;

    const hasSeenOnboarding = localStorage.getItem('mobile-onboarding-completed');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, [isMobile]);

  const handleNext = () => {
    medium();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('mobile-onboarding-completed', 'true');
    setIsVisible(false);
  };

  if (!isMobile || !isVisible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <SafeAnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-background"
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/50 backdrop-blur-sm safe-top"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center justify-center h-full px-6 safe-top safe-bottom">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6 max-w-sm"
          >
            {/* Icon */}
            <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold">{step.title}</h2>

            {/* Description */}
            <p className="text-muted-foreground text-base leading-relaxed">
              {step.description}
            </p>
          </motion.div>

          {/* Progress dots */}
          <div className="flex gap-2 mt-12">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8 w-full max-w-sm">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 h-12"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 h-12 gap-2"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </SafeAnimatePresence>
  );
}
