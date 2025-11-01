import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to Oneiros AI',
    description: 'Your intelligent AI platform with 9 integrated AI systems. Let\'s take a quick tour to get you started!',
    position: 'center',
  },
  {
    id: 'chat',
    title: '💬 Multi-Agent Chat',
    description: 'Start chatting with our AI agents. Each message intelligently routes to the best model for your task.',
    target: '.chat-interface',
    position: 'right',
  },
  {
    id: 'agents',
    title: '🤖 Agent Marketplace',
    description: 'Explore and create custom AI agents tailored to your specific needs.',
    position: 'center',
  },
  {
    id: 'browser-ai',
    title: '🧠 Browser AI',
    description: 'Run AI models directly in your browser with WebGPU acceleration - completely private and offline.',
    position: 'center',
  },
  {
    id: 'credits',
    title: '⏱️ Time-Based Credits',
    description: 'Track your usage in the bottom-right. Each credit gives you 5 minutes of AI conversation.',
    target: '.credit-display',
    position: 'top',
  },
  {
    id: 'complete',
    title: '🎉 You\'re All Set!',
    description: 'Start exploring the platform. Need help? Click the help icon anytime.',
    position: 'center',
  },
];

const TOUR_KEY = 'hasCompletedProductTour';

export function ProductTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(TOUR_KEY);
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    
    if (!hasCompleted && hasCompletedOnboarding) {
      setTimeout(() => setIsActive(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setIsActive(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isActive) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed z-50 ${
              step.position === 'center'
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                : 'top-20 right-8'
            }`}
          >
            <Card className="w-[400px] shadow-2xl border-primary/20">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Step {currentStep + 1} of {tourSteps.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleSkip}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress */}
                <Progress value={progress} className="h-1" />

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      'Get Started'
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Skip */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="w-full text-muted-foreground"
                >
                  Skip Tour
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function startProductTour() {
  localStorage.removeItem(TOUR_KEY);
  window.location.reload();
}
