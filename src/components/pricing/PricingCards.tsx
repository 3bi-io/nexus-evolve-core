import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PricingTier {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Starter",
    monthlyPrice: 49,
    yearlyPrice: 470,
    credits: 500,
    features: [
      "500 credits per month",
      "All basic features",
      "Email support",
      "Community access",
      "Standard response time",
    ],
  },
  {
    name: "Professional",
    monthlyPrice: 149,
    yearlyPrice: 1430,
    credits: 2000,
    popular: true,
    features: [
      "2,000 credits per month",
      "All features unlocked",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Faster response time",
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    credits: 999999,
    features: [
      "Unlimited credits",
      "White-label options",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantees",
      "Custom AI training",
    ],
  },
];

export const PricingCards = () => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelectPlan = (tierName: string) => {
    // Allow both authenticated and anonymous users to proceed to checkout
    // Stripe will collect email during checkout for anonymous users
    navigate('/pricing', { state: { selectedTier: tierName, isYearly } });
  };

  const calculateSavings = (monthly: number, yearly: number) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return percentage;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-4">
        <Label htmlFor="billing-toggle" className={!isYearly ? "font-semibold" : ""}>
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Label htmlFor="billing-toggle" className={isYearly ? "font-semibold" : ""}>
          Yearly
        </Label>
        {isYearly && (
          <Badge variant="default" className="ml-2">
            Save up to {calculateSavings(tiers[1].monthlyPrice, tiers[1].yearlyPrice)}%
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`relative ${
              tier.popular
                ? "border-primary shadow-lg scale-105"
                : "border-border"
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    ${isYearly ? Math.round(tier.yearlyPrice / 12) : tier.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                {isYearly && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Billed annually (${tier.yearlyPrice}/year)
                  </p>
                )}
              </div>
              <p className="text-muted-foreground mt-2">
                {tier.credits === 999999 ? "Unlimited" : tier.credits} credits/month
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                className="w-full"
                variant={tier.popular ? "default" : "outline"}
                onClick={() => handleSelectPlan(tier.name.toLowerCase())}
              >
                {user ? "Subscribe Now" : "Get Started"}
              </Button>
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        <p>
          All plans include access to our multi-agent system, semantic memory, and
          autonomous evolution features. Credits are used for AI interactions and
          replenish monthly.
        </p>
      </div>
    </div>
  );
};
