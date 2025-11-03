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
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 500,
    features: [
      "500 daily credits forever",
      "All 9 AI systems",
      "Multi-agent orchestration",
      "Beta tester badge",
      "Community support",
    ],
  },
  {
    name: "Professional",
    monthlyPrice: 29,
    yearlyPrice: 290,
    credits: 10000,
    popular: true,
    features: [
      "10,000 credits/month",
      "Everything in Starter",
      "Priority support",
      "Advanced analytics",
      "Founder badge",
      "Locked-in rate forever",
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 0,
    features: [
      "Custom credits",
      "Everything in Professional",
      "Dedicated support",
      "Custom integrations",
      "Shape development roadmap",
      "Direct dev access",
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
              {tier.popular && (
                <Badge variant="secondary" className="w-fit mt-2">🔥 Founder Rate</Badge>
              )}
              {tier.name === "Starter" && (
                <Badge variant="secondary" className="w-fit mt-2">🎁 Forever Free</Badge>
              )}
              {tier.name === "Enterprise" && (
                <Badge variant="secondary" className="w-fit mt-2">🚀 Beta Custom</Badge>
              )}
              <div className="mt-3 sm:mt-4">
                {tier.monthlyPrice === 0 && tier.name === "Enterprise" ? (
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold">Custom</span>
                ) : (
                  <>
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold">
                      ${isYearly ? Math.round(tier.yearlyPrice / 12) : tier.monthlyPrice}
                    </span>
                    <span className="text-base sm:text-lg text-muted-foreground">/month</span>
                  </>
                )}
              </div>
              {isYearly && tier.yearlyPrice > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Billed ${tier.yearlyPrice} annually
                </p>
              )}
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                {tier.credits === 0 ? "Custom credits" : tier.credits === 500 ? "500 daily credits" : `${tier.credits} credits/month`}
              </p>
            </CardHeader>
            <CardContent className="space-mobile">
              <Button
                onClick={() => handleSelectPlan(tier.name.toLowerCase())}
                variant={tier.popular ? "default" : "outline"}
                className="w-full h-12 sm:h-14 text-base sm:text-lg touch-feedback mb-6"
              >
                {tier.name === "Starter" ? "Join Beta Free" : tier.name === "Enterprise" ? "Schedule Call" : tier.popular ? "Lock In Founder Rate" : "Get Started"}
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
          <strong>Beta Pricing:</strong> Lock in founder rates for life. All plans include access to our 
          9 AI systems, multi-agent orchestration, and autonomous evolution. 
          Rates increase after beta launch.
        </p>
      </div>
    </div>
  );
};
