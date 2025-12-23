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
        title="Oneiros | Free AI Platform - Vision, Generation, Workflows & Monitoring"
        description="Free forever AI platform with vision analysis, image generation, automated workflows, and intelligent monitoring. Unlimited access to all features."
        keywords="AI platform, free AI, vision analysis, image generation, automated workflows, multi-agent AI, ChatGPT alternative"
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
