import { ChatInterface } from "@/components/ChatInterface";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { ProductTour } from "@/components/onboarding/ProductTour";
import { HelpWidget } from "@/components/onboarding/HelpWidget";
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
        title="AI Chat - Black Friday Unlimited Conversations with Multi-Agent System"
        description="Black Friday special - unlimited AI chat powered by 5 specialized agents. Get intelligent responses for reasoning, creativity, learning, and real-time data with Grok integration."
        keywords="free AI chat, unlimited chatbot, multi-agent AI, intelligent conversation, GPT alternative"
        canonical="https://oneiros.me/chat"
      />
      
      <ChatInterface />
      {user && <OnboardingChecklist />}
      <ProductTour />
      <HelpWidget />
    </PageLayout>
  );
};

export default Index;
