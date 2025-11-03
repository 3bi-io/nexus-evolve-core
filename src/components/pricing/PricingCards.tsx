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
    if (!user) {
      // Redirect to auth with post-login redirect to account with plan selection
      navigate('/auth', { 
        state: { 
          redirectTo: '/account', 
          selectedTier: tierName, 
          isYearly 
        } 
      });
    } else {
      // Navigate to account page where subscription management will be handled
      navigate('/account', { 
        state: { 
          selectedTier: tierName, 
          isYearly,
          openSubscription: true 
        } 
      });
    }
  };

  const calculateSavings = (monthly: number, yearly: number) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return percentage;
  };

  return (
    <div className="space-mobile">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
        <Label htmlFor="billing-toggle" className="text-base sm:text-lg font-medium">
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
          className="data-[state=checked]:bg-primary scale-110"
        />
        <Label htmlFor="billing-toggle" className="text-base sm:text-lg font-medium flex items-center gap-2">
          Yearly
          <Badge variant="secondary" className="text-xs sm:text-sm">
            Save {calculateSavings(149, 1430)}%
          </Badge>
        </Label>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`card-mobile relative ${
              tier.popular
                ? "border-2 border-primary shadow-lg md:scale-105"
                : "border-border"
            }`}
          >
            {tier.popular && (
              <Badge
                variant="default"
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1.5 text-sm"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            )}
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl">{tier.name}</CardTitle>
              <div className="mt-3 sm:mt-4">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold">
                  ${isYearly ? Math.round(tier.yearlyPrice / 12) : tier.monthlyPrice}
                </span>
                <span className="text-base sm:text-lg text-muted-foreground">/month</span>
              </div>
              {isYearly && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Billed ${tier.yearlyPrice} annually
                </p>
              )}
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                {tier.credits === 999999 ? "Unlimited" : tier.credits} credits/month
              </p>
            </CardHeader>
            <CardContent className="space-mobile">
              <Button
                onClick={() => handleSelectPlan(tier.name.toLowerCase())}
                variant={tier.popular ? "default" : "outline"}
                className="w-full h-12 sm:h-14 text-base sm:text-lg touch-feedback mb-6"
              >
                {user ? "Subscribe Now" : "Get Started"}
              </Button>
              <ul className="space-y-3 sm:space-y-4">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mt-8 px-4">
        <p>
          All plans include access to our multi-agent system, temporal memory, and
          autonomous evolution features. Credits are used for AI interactions and
          replenish monthly.
        </p>
      </div>
    </div>
  );
};
