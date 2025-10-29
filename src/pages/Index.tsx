import { ChatInterface } from "@/components/ChatInterface";
import { Navigation } from "@/components/Navigation";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ChatInterface />
      {user && <OnboardingChecklist />}
    </div>
  );
};

export default Index;
