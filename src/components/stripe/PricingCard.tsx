import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Crown, Sparkles, Zap } from "lucide-react";
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
  // Map tier names for comparison (handle both old and new tier names)
  const normalizeTier = (t: string) => {
    if (t === "pro" || t === "pro_annual" || t === "professional") return "pro";
    if (t === "free" || t === "starter") return "free";
    return t;
  };
  
  const normalizedCurrentTier = normalizeTier(currentTier);
  const normalizedCardTier = normalizeTier(tier);
  
  const isCurrentPlan = normalizedCurrentTier === normalizedCardTier;
  
  const displayPrice = billingInterval === "year" && annualPrice ? annualPrice : price;
  const displayInterval = billingInterval === "year" && annualPrice ? "year" : interval;
  const activePriceId = billingInterval === "year" && annualPriceId ? annualPriceId : priceId;

  // Calculate monthly equivalent for annual plans
  const monthlyEquivalent = billingInterval === "year" && annualPrice 
    ? Math.round(annualPrice / 12) 
    : null;

  // Calculate savings for annual plan
  const annualSavings = billingInterval === "year" && annualPrice && price > 0
    ? (price * 12) - annualPrice
    : null;

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
    
    // Show upgrade/downgrade based on tier level
    const tierLevels: Record<string, number> = { free: 0, pro: 1, enterprise: 2 };
    const currentLevel = tierLevels[normalizedCurrentTier] ?? 0;
    const cardLevel = tierLevels[normalizedCardTier] ?? 0;
    
    if (cardLevel > currentLevel) return `Upgrade to ${name}`;
    if (cardLevel < currentLevel) return `Switch to ${name}`;
    return `Get ${name}`;
  };

  const getTierIcon = () => {
    if (tier === "enterprise") return <Crown className="h-5 w-5 text-amber-500" />;
    if (tier === "pro") return <Sparkles className="h-5 w-5 text-primary" />;
    return <Zap className="h-5 w-5 text-muted-foreground" />;
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return "outline";
    if (popular) return "default";
    return "secondary";
  };

  return (
    <Card
      className={cn(
        "relative flex flex-col h-full transition-all duration-300 hover:shadow-lg",
        popular && "border-primary shadow-lg shadow-primary/10 scale-[1.02]",
        isCurrentPlan && "ring-2 ring-primary bg-primary/5"
      )}
    >
      {popular && !isCurrentPlan && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 shadow-md">
          <Sparkles className="h-3 w-3 mr-1" />
          Most Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge variant="default" className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary">
          <Crown className="h-3 w-3 mr-1" />
          Your Plan
        </Badge>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl flex items-center gap-2">
            {getTierIcon()}
            {name}
          </span>
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
          
          {/* Show monthly equivalent for annual plans */}
          {monthlyEquivalent && price > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              ${(monthlyEquivalent / 100).toFixed(0)}/month billed annually
            </p>
          )}
          
          {/* Show savings for annual plans */}
          {annualSavings && annualSavings > 0 && (
            <Badge variant="secondary" className="mt-2 text-green-600 bg-green-500/10">
              Save ${(annualSavings / 100).toFixed(0)}/year
            </Badge>
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
          variant={getButtonVariant()}
          className={cn(
            "w-full transition-all",
            popular && !isCurrentPlan && "shadow-md hover:shadow-lg"
          )}
          size="lg"
        >
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
}
