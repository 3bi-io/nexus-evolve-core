import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  tier: string;
  price: number;
  interval: string;
  annualPrice?: number;
  description: string;
  features: readonly string[];
  popular: boolean;
  priceId: string | null;
  annualPriceId?: string;
  currentTier: string;
  billingInterval: "month" | "year";
  loading: boolean;
  onSubscribe: (priceId: string) => void;
  onManage: () => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

export function PricingCard({
  name,
  tier,
  price,
  interval,
  annualPrice,
  description,
  features,
  popular,
  priceId,
  annualPriceId,
  currentTier,
  billingInterval,
  loading,
  onSubscribe,
  onManage,
  isLoggedIn,
  onLoginRequired,
}: PricingCardProps) {
  const isCurrentPlan = currentTier === tier || 
    (tier === "pro" && currentTier === "pro_annual") ||
    (tier === "pro" && billingInterval === "year" && currentTier === "pro_annual");
  
  const displayPrice = billingInterval === "year" && annualPrice ? annualPrice : price;
  const displayInterval = billingInterval === "year" && annualPrice ? "year" : interval;
  const activePriceId = billingInterval === "year" && annualPriceId ? annualPriceId : priceId;

  const handleClick = () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    
    if (isCurrentPlan) {
      onManage();
    } else if (activePriceId) {
      onSubscribe(activePriceId);
    }
  };

  const getButtonText = () => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isCurrentPlan) return "Manage Subscription";
    if (!priceId) return "Current Plan";
    if (!isLoggedIn) return "Sign Up to Subscribe";
    return `Upgrade to ${name}`;
  };

  return (
    <Card
      className={cn(
        "relative flex flex-col h-full transition-all duration-300",
        popular && "border-primary shadow-lg shadow-primary/20 scale-[1.02]",
        isCurrentPlan && "ring-2 ring-primary"
      )}
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1">
          <Sparkles className="h-3 w-3 mr-1" />
          Most Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge variant="secondary" className="absolute -top-3 right-4 px-3 py-1">
          <Crown className="h-3 w-3 mr-1" />
          Your Plan
        </Badge>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl">{name}</span>
          {tier === "enterprise" && <Crown className="h-5 w-5 text-primary" />}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">
              ${displayPrice === 0 ? "0" : (displayPrice / 100).toFixed(0)}
            </span>
            {displayPrice > 0 && (
              <span className="text-muted-foreground">/{displayInterval}</span>
            )}
          </div>
          {billingInterval === "year" && annualPrice && price > 0 && (
            <p className="text-sm text-green-500 mt-1">
              Save ${((price * 12 - annualPrice) / 100).toFixed(0)}/year
            </p>
          )}
        </div>

        <ul className="space-y-3 flex-1 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={handleClick}
          disabled={loading || (!priceId && !isCurrentPlan)}
          variant={popular ? "default" : isCurrentPlan ? "outline" : "secondary"}
          className="w-full"
          size="lg"
        >
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
}
