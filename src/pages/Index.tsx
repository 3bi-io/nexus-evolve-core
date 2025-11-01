import { ChatInterface } from "@/components/ChatInterface";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { PersonalizedUpgradePrompt } from "@/components/conversion/PersonalizedUpgradePrompt";
import { ProductTour } from "@/components/onboarding/ProductTour";
import { HelpWidget } from "@/components/onboarding/HelpWidget";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagementTracking } from "@/hooks/useEngagementTracking";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useMobile } from "@/hooks/useMobile";
import { SEO } from "@/components/SEO";

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
      <SEO 
        title="AI Chat - Intelligent Conversations with Multi-Agent System"
        description="Chat with our advanced AI powered by 5 specialized agents. Get intelligent responses for reasoning, creativity, learning, and real-time data with Grok integration."
        keywords="AI chat, chatbot, multi-agent AI, intelligent conversation, GPT alternative"
        canonical="https://oneiros.me/chat"
      />
      
      <ChatInterface />
      {user && <OnboardingChecklist />}
      {showPrompt && promptTrigger && !user && (
        <PersonalizedUpgradePrompt 
          trigger={promptTrigger}
          messageCount={metrics.messagesCount}
          sessionDuration={metrics.sessionDuration}
        />
      )}
      <ProductTour />
      <HelpWidget />
    </PageLayout>
  );
};

export default Index;
