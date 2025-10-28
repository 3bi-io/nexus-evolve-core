import { ChatInterface } from "@/components/ChatInterface";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ChatInterface />
    </div>
  );
};

export default Index;
