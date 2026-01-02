import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { ResponsiveSection, MobileSafeArea } from "@/components/layout/ResponsiveSection";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PricingCard } from "@/components/stripe/PricingCard";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";
import { PRICING_TIERS } from "@/config/stripe";
import { toast } from "sonner";
import { Zap, Shield, Users, Headphones, CheckCircle, XCircle } from "lucide-react";

const COMPARISON_FEATURES = [
  { feature: "Monthly Credits", free: "100", pro: "500", enterprise: "Unlimited" },
  { feature: "AI Systems", free: "5", pro: "All 9", enterprise: "All 9" },
  { feature: "Multi-Agent", free: "Basic", pro: "Full", enterprise: "Full" },
  { feature: "Voice AI", free: false, pro: true, enterprise: true },
  { feature: "Custom Agents", free: false, pro: true, enterprise: true },
  { feature: "Knowledge Graphs", free: false, pro: true, enterprise: true },
  { feature: "API Access", free: false, pro: false, enterprise: true },
  { feature: "Team Management", free: false, pro: false, enterprise: true },
  { feature: "Dedicated Support", free: false, pro: false, enterprise: true },
  { feature: "SLA Guarantee", free: false, pro: false, enterprise: true },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const { tier: currentTier, loading, createCheckout, openCustomerPortal, checkSubscription } = useSubscription();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("Subscription successful! Welcome to Oneiros Pro.", { duration: 5000 });
      checkSubscription();
      navigate("/pricing", { replace: true });
    } else if (canceled === "true") {
      toast.info("Checkout canceled. You can try again anytime.");
      navigate("/pricing", { replace: true });
    }
  }, [searchParams, navigate, checkSubscription]);

  const handleSubscribe = async (priceId: string) => {
    try {
      setCheckoutLoading(true);
      await createCheckout(priceId);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManage = async () => {
    try {
      setCheckoutLoading(true);
      await openCustomerPortal();
    } catch (error) {
      console.error("Portal error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to open customer portal");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLoginRequired = () => {
    navigate("/auth?redirect=/pricing");
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <PageLayout showHeader={true} showFooter={true} transition={true}>
      <SEO
        title="Pricing | Oneiros - AI Platform Plans"
        description="Choose the perfect plan for your AI needs. From free to enterprise, Oneiros offers flexible pricing for individuals and teams."
        keywords="AI pricing, subscription plans, AI platform pricing, Oneiros plans"
        canonical="https://oneiros.me/pricing"
        ogImage="/og-pricing-v2.png"
      />

      <ResponsiveContainer size="xl" padding="md">
        <MobileSafeArea bottom>
          <div className="space-y-10 md:space-y-16 py-6 md:py-12">
            {/* Header */}
            <ResponsiveSection spacing="md">
              <div className="text-center space-y-4 md:space-y-6">
                <Badge variant="outline" className="text-sm md:text-base px-4 py-2 md:px-6 md:py-3">
                  <Zap className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Simple, Transparent Pricing
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Power Your AI{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Journey
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Start free and scale as you grow. No hidden fees, cancel anytime.
                </p>

                {/* Billing Toggle - Touch Friendly */}
                <div className="flex items-center justify-center gap-3 md:gap-4 pt-4">
                  <Label
                    htmlFor="billing-toggle"
                    className={`text-sm md:text-base cursor-pointer py-2 px-3 rounded-lg transition-colors ${billingInterval === "month" ? "text-foreground bg-muted" : "text-muted-foreground"}`}
                  >
                    Monthly
                  </Label>
                  <Switch
                    id="billing-toggle"
                    checked={billingInterval === "year"}
                    onCheckedChange={(checked) => setBillingInterval(checked ? "year" : "month")}
                    className="scale-110"
                  />
                  <Label
                    htmlFor="billing-toggle"
                    className={`text-sm md:text-base cursor-pointer py-2 px-3 rounded-lg transition-colors flex items-center gap-2 ${billingInterval === "year" ? "text-foreground bg-muted" : "text-muted-foreground"}`}
                  >
                    Annual
                    <Badge variant="secondary" className="text-xs">
                      Save 20%
                    </Badge>
                  </Label>
                </div>
              </div>
            </ResponsiveSection>

            {/* Pricing Cards */}
            <ResponsiveSection spacing="md">
              <div className="grid md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
                {PRICING_TIERS.map((tier) => (
                  <PricingCard
                    key={tier.tier}
                    {...tier}
                    currentTier={currentTier}
                    billingInterval={billingInterval}
                    loading={loading || checkoutLoading}
                    onSubscribe={handleSubscribe}
                    onManage={handleManage}
                    isLoggedIn={!!user}
                    onLoginRequired={handleLoginRequired}
                  />
                ))}
              </div>
            </ResponsiveSection>

            {/* Feature Comparison - Mobile Accordion / Desktop Table */}
            <ResponsiveSection spacing="md" background="muted">
              <div className="p-4 md:p-8 lg:p-12 max-w-5xl mx-auto">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-6 md:mb-8">
                  Compare Plans
                </h2>

                {isMobile ? (
                  // Mobile: Accordion View
                  <Accordion type="single" collapsible className="space-y-2">
                    {["Free", "Pro", "Enterprise"].map((plan, planIndex) => (
                      <AccordionItem key={plan} value={plan} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-lg font-semibold py-4">
                          {plan}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="space-y-3">
                            {COMPARISON_FEATURES.map((row) => {
                              const value = planIndex === 0 ? row.free : planIndex === 1 ? row.pro : row.enterprise;
                              return (
                                <div key={row.feature} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                  <span className="text-sm">{row.feature}</span>
                                  <div className="flex items-center">
                                    {renderFeatureValue(value)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  // Desktop: Table View
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-4 px-4">Feature</th>
                          <th className="text-center py-4 px-4">Free</th>
                          <th className="text-center py-4 px-4">Pro</th>
                          <th className="text-center py-4 px-4">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {COMPARISON_FEATURES.map((row) => (
                          <tr key={row.feature}>
                            <td className="py-4 px-4 font-medium">{row.feature}</td>
                            <td className="text-center py-4 px-4">{renderFeatureValue(row.free)}</td>
                            <td className="text-center py-4 px-4">{renderFeatureValue(row.pro)}</td>
                            <td className="text-center py-4 px-4">{renderFeatureValue(row.enterprise)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </ResponsiveSection>

            {/* Trust Signals */}
            <ResponsiveSection spacing="md">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto text-center">
                <div className="space-y-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Powered by Stripe with bank-level encryption
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Cancel Anytime</h3>
                  <p className="text-sm text-muted-foreground">
                    No long-term commitments, cancel with one click
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Headphones className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">24/7 Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Priority support for Pro and Enterprise users
                  </p>
                </div>
              </div>
            </ResponsiveSection>

            {/* CTA */}
            <ResponsiveSection spacing="md">
              <div className="text-center space-y-4 md:space-y-6 py-8 md:py-12 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl px-4">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                  Ready to Get Started?
                </h2>
                <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Start with our free plan and upgrade when you're ready.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate("/chat")} className="text-base md:text-lg px-8 md:px-12 py-6 md:py-7 h-auto">
                    Try Free Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/contact")}
                    className="text-base md:text-lg px-8 md:px-12 py-6 md:py-7 h-auto"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </ResponsiveSection>
          </div>
        </MobileSafeArea>
      </ResponsiveContainer>
    </PageLayout>
  );
};

export default Pricing;
