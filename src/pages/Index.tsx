import { ChatInterface } from "@/components/ChatInterface";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { HelpWidget } from "@/components/onboarding/HelpWidget";
import { GoalWizard } from "@/components/onboarding/GoalWizard";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { useResponsive } from "@/hooks/useResponsive";
import { SEO } from "@/components/SEO";
const Index = () => {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  
  return (
    <PageLayout 
      transition={false}
      title="Chat"
      showBottomNav={isMobile}
      showBack={false}
    >
      <SEO 
        title="Oneiros | Black Friday AI Platform - Vision, Generation, Workflows & Monitoring"
        description="Black Friday special - AI platform with vision analysis, image generation, automated workflows, and intelligent monitoring. Limited time unlimited access to all features."
        keywords="AI platform, Black Friday AI, vision analysis, image generation, automated workflows, multi-agent AI, ChatGPT alternative"
        canonical="https://oneiros.me/"
      />
      
      <ChatInterface />
      {user && <OnboardingChecklist />}
      <HelpWidget />
      <GoalWizard />
    </PageLayout>
  );
};

export default Index;
