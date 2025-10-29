import { ChatInterface } from "@/components/ChatInterface";
import { Navigation } from "@/components/Navigation";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { PersonalizedUpgradePrompt } from "@/components/conversion/PersonalizedUpgradePrompt";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagementTracking } from "@/hooks/useEngagementTracking";
import { useState, useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  const { metrics, shouldShowUpgradePrompt } = useEngagementTracking();
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptTrigger, setPromptTrigger] = useState<'credits_low' | 'session_value' | 'time_based' | null>(null);

  useEffect(() => {
    const { show, trigger } = shouldShowUpgradePrompt();
    if (show && trigger) {
      setShowPrompt(true);
      setPromptTrigger(trigger);
    }
  }, [metrics]);
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ChatInterface />
      {user && <OnboardingChecklist />}
      {showPrompt && promptTrigger && !user && (
        <PersonalizedUpgradePrompt 
          trigger={promptTrigger}
          messageCount={metrics.messagesCount}
          sessionDuration={metrics.sessionDuration}
        />
      )}
    </div>
  );
};

export default Index;
