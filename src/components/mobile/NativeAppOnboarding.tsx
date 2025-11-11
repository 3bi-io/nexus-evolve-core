import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMobile } from "@/hooks/useMobile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Mic, 
  Fingerprint, 
  Check, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { toast } from "sonner";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  action?: () => Promise<void>;
  optional?: boolean;
}

export function NativeAppOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const { isNative } = useMobile();
  const { isAvailable: biometricAvailable, enroll } = useBiometricAuth();

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Oneiros",
      description: "Experience the full power of AI in a native mobile app with voice conversations, vision AI, and intelligent agents",
      icon: Sparkles,
    },
    {
      id: "camera",
      title: "Camera & Photos",
      description: "We'll ask for camera access when you want to upload images or use vision AI features",
      icon: Camera,
    },
    {
      id: "microphone",
      title: "Voice AI",
      description: "Microphone access enables natural voice conversations with AI agents",
      icon: Mic,
    },
    {
      id: "biometric",
      title: "Biometric Security",
      description: "Set up Face ID or fingerprint for secure, quick sign-in",
      icon: Fingerprint,
      optional: true,
      action: async () => {
        try {
          const success = await enroll();
          if (success) {
            setCompletedSteps(prev => new Set(prev).add("biometric"));
            toast.success("Biometric authentication enabled");
          }
        } catch (error) {
          console.error("Biometric setup error:", error);
        }
      }
    }
  ];

  useEffect(() => {
    if (!isNative) return;

    const hasSeenOnboarding = localStorage.getItem("native-onboarding-completed");
    if (!hasSeenOnboarding) {
      // Show onboarding after a brief delay
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isNative]);

  const handleNext = async () => {
    const step = steps[currentStep];
    
    // Execute action if present
    if (step.action) {
      await step.action();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("native-onboarding-completed", "true");
    setShowOnboarding(false);
    toast.success("Setup complete! Enjoy Oneiros.");
  };

  if (!isNative || !showOnboarding) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const isCompleted = completedSteps.has(currentStepData.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md p-6 space-y-6">
          {/* Progress indicator */}
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-10 h-10 text-primary" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-2 text-center"
          >
            <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </motion.div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleNext}
              className="w-full"
              size="lg"
              disabled={isCompleted && currentStepData.optional}
            >
              {isCompleted ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Enabled
                </>
              ) : currentStep === steps.length - 1 ? (
                currentStepData.action ? "Enable & Complete" : "Get Started"
              ) : (
                <>
                  {currentStepData.action ? "Enable" : "Continue"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {(currentStepData.optional || !currentStepData.action) && (
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full"
              >
                {currentStep === steps.length - 1 ? "Skip & Finish" : "Skip for now"}
              </Button>
            )}
          </div>

          {/* Step counter */}
          <p className="text-center text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
