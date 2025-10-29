import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Clock, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface UpgradePromptProps {
  trigger: 'credits_low' | 'session_value' | 'feature_locked' | 'time_based';
  messageCount?: number;
  sessionDuration?: number;
}

export function PersonalizedUpgradePrompt({ trigger, messageCount = 0, sessionDuration = 0 }: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const dismissedKey = `upgrade_dismissed_${trigger}`;
    const dismissed = localStorage.getItem(dismissedKey);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setIsVisible(false);
      }
    }
  }, [trigger]);

  const handleDismiss = () => {
    const dismissedKey = `upgrade_dismissed_${trigger}`;
    localStorage.setItem(dismissedKey, Date.now().toString());
    setIsDismissed(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleUpgrade = () => {
    if (user) {
      navigate('/pricing');
    } else {
      navigate('/auth');
    }
  };

  const getPromptContent = () => {
    switch (trigger) {
      case 'credits_low':
        return {
          icon: Sparkles,
          title: "You're on fire! 🔥",
          description: user 
            ? "Upgrade to keep the momentum going with more credits."
            : "Sign up now to save your conversation history and get more credits!",
          cta: user ? "Upgrade Now" : "Sign Up Free",
          benefit: user ? "Get 500 credits/month" : "Keep your progress & unlock more"
        };
      case 'session_value':
        return {
          icon: MessageSquare,
          title: "Having a great conversation?",
          description: `You've sent ${messageCount} messages today! ${user ? 'Upgrade' : 'Sign up'} to continue without limits.`,
          cta: user ? "See Plans" : "Create Account",
          benefit: user ? "Unlimited conversations" : "Save this conversation forever"
        };
      case 'feature_locked':
        return {
          icon: Sparkles,
          title: "Unlock Premium Features",
          description: "Get access to advanced agents, knowledge graphs, and evolution insights.",
          cta: user ? "Upgrade" : "Sign Up",
          benefit: "Full platform access"
        };
      case 'time_based':
        return {
          icon: Clock,
          title: "You've been here for a while!",
          description: `Enjoying the experience? ${user ? 'Upgrade' : 'Create an account'} to unlock the full potential.`,
          cta: user ? "View Plans" : "Get Started",
          benefit: user ? "More power, more features" : "Save your progress"
        };
    }
  };

  if (!isVisible) return null;

  const content = getPromptContent();
  const Icon = content.icon;

  return (
    <Card
      className={`fixed bottom-20 right-4 w-80 p-4 shadow-xl border-primary/20 transition-all duration-300 z-40 ${
        isDismissed ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">{content.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">{content.description}</p>

        <div className="flex items-center gap-2 text-xs text-primary">
          <Sparkles className="h-3 w-3" />
          <span>{content.benefit}</span>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleUpgrade} size="sm" className="flex-1">
            {content.cta}
          </Button>
          <Button onClick={handleDismiss} size="sm" variant="ghost">
            Later
          </Button>
        </div>
      </div>
    </Card>
  );
}
