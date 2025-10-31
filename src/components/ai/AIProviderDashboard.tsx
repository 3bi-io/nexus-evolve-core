import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Server, Cpu, Zap, DollarSign, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProviderInfo {
  name: string;
  icon: typeof Sparkles;
  description: string;
  benefits: string[];
  route: string;
  color: string;
}

const providers: ProviderInfo[] = [
  {
    name: "Lovable AI",
    icon: Sparkles,
    description: "Premium AI with Gemini & GPT-5 models",
    benefits: ["Highest quality", "Fast response", "Multimodal support"],
    route: "/advanced-ai",
    color: "text-purple-500"
  },
  {
    name: "HuggingFace",
    icon: Server,
    description: "400,000+ open-source models",
    benefits: ["60-90% cheaper", "Model variety", "Community driven"],
    route: "/model-comparison",
    color: "text-yellow-500"
  },
  {
    name: "Browser AI",
    icon: Cpu,
    description: "Client-side AI with WebGPU",
    benefits: ["100% private", "Zero cost", "Instant response"],
    route: "/browser-ai",
    color: "text-blue-500"
  }
];

export const AIProviderDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI Provider Overview</h2>
        <p className="text-muted-foreground">
          Choose the best AI provider for your needs - quality, cost, or privacy.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {providers.map((provider) => {
          const Icon = provider.icon;
          return (
            <Card key={provider.name} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <Icon className={`h-8 w-8 ${provider.color}`} />
                <Badge variant="secondary">Active</Badge>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-1">{provider.name}</h3>
                <p className="text-sm text-muted-foreground">{provider.description}</p>
              </div>

              <div className="space-y-2">
                {provider.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => navigate(provider.route)}
                className="w-full"
                variant="outline"
              >
                Explore {provider.name}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-start gap-4">
          <Zap className="h-6 w-6 text-yellow-500 mt-1" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Smart AI Routing</h3>
            <p className="text-sm text-muted-foreground">
              Our intelligent router automatically selects the best provider based on your task, 
              budget, and device capabilities. Get the optimal balance of quality, speed, and cost.
            </p>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm">Cost optimized</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Privacy aware</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Auto fallback</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">AI Providers</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-2xl font-bold">400K+</p>
            <p className="text-sm text-muted-foreground">Available Models</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-2xl font-bold">90%</p>
            <p className="text-sm text-muted-foreground">Potential Savings</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
