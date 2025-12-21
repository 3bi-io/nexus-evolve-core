import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Infinity, Users } from 'lucide-react';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

const steps = [
  {
    icon: Brain,
    title: 'Welcome to Oneiros AI',
    description: 'Your intelligent AI platform with 9 integrated AI systems. Enjoy unlimited free access to all features!',
  },
  {
    icon: Sparkles,
    title: 'Multi-Agent Intelligence',
    description: 'Every message is routed to the best AI model for your task. Our system learns from your interactions and improves over time.',
  },
  {
    icon: Infinity,
    title: 'Unlimited Free Access',
    description: 'All features are completely free with no usage limits. Explore everything the platform has to offer!',
  },
  {
    icon: Users,
    title: 'Getting Started',
    description: 'After this intro, we\'ll show you a quick tour of key features. You can also explore quick-start templates anytime.',
  },
];

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">{step.title}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <div className="flex justify-center gap-1 mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2 w-full">
            {currentStep < steps.length - 1 ? (
              <>
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next
                </Button>
              </>
            ) : (
              <Button onClick={handleComplete} className="w-full">
                Get Started
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Export function to reset onboarding (for settings/help menu)
export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
  window.location.reload();
}
