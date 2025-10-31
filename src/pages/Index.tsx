import { ChatInterface } from "@/components/ChatInterface";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { PersonalizedUpgradePrompt } from "@/components/conversion/PersonalizedUpgradePrompt";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagementTracking } from "@/hooks/useEngagementTracking";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { UsageTimer } from "@/components/UsageTimer";
import { useMobile } from "@/hooks/useMobile";

const Index = () => {
  const { user } = useAuth();
  const { isMobile } = useMobile();
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
    <PageLayout 
      transition={false}
      title="Chat"
      showBottomNav={isMobile}
      showBack={false}
    >
      <UsageTimer />
      <ChatInterface />
      {user && <OnboardingChecklist />}
      {showPrompt && promptTrigger && !user && (
        <PersonalizedUpgradePrompt 
          trigger={promptTrigger}
          messageCount={metrics.messagesCount}
          sessionDuration={metrics.sessionDuration}
        />
      )}
    </PageLayout>
  );
};

export default Index;
