import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCredits: number;
  suggestedTier?: string;
}

export const UpgradePrompt = ({
  open,
  onOpenChange,
  currentCredits,
  suggestedTier = "starter",
}: UpgradePromptProps) => {
  const navigate = useNavigate();

  const tierInfo = {
    starter: {
      name: "Professional",
      price: 29,
      credits: "10,000",
      savings: "Get 20x more AI interactions",
    },
    professional: {
      name: "Professional",
      price: 29,
      credits: "10,000",
      savings: "Best value - founder rate",
    },
    enterprise: {
      name: "Enterprise",
      price: 199,
      credits: "Unlimited",
      savings: "Never worry about limits again",
    },
  };

  const tier = tierInfo[suggestedTier as keyof typeof tierInfo] || tierInfo.starter;

  const handleUpgrade = () => {
    navigate("/pricing", { state: { selectedTier: suggestedTier } });
    onOpenChange(false);
  };

  const handleViewPlans = () => {
    navigate("/pricing");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <DialogTitle className="text-center text-2xl">
            You're Out of AI Interactions
          </DialogTitle>
          <DialogDescription className="text-center">
            You have {currentCredits} interactions remaining. Upgrade to continue using
            all platform features without interruption.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">{tier.name} Plan</h4>
              <div className="text-right">
                <div className="text-2xl font-bold">${tier.price}</div>
                <div className="text-xs text-muted-foreground">/month</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span>{tier.credits} AI interactions per month</span>
            </div>
            <p className="text-sm text-muted-foreground">{tier.savings}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleUpgrade} className="w-full">
              Upgrade to {tier.name}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button onClick={handleViewPlans} variant="outline" className="w-full">
              View All Plans
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Free users get 500 daily AI interactions. Come back tomorrow for more!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
