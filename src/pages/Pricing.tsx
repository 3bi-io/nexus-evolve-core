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
import { PricingCard } from "@/components/stripe/PricingCard";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { PRICING_TIERS } from "@/config/stripe";
import { toast } from "sonner";
import { Zap, Shield, Users, Headphones, CheckCircle, XCircle } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { tier: currentTier, loading, createCheckout, openCustomerPortal, checkSubscription } = useSubscription();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Handle success/cancel redirects from Stripe
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("Subscription successful! Welcome to Oneiros Pro.", {
        duration: 5000,
      });
      checkSubscription();
      // Clear URL params
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
          <div className="space-y-12 md:space-y-16 py-8 md:py-12">
            {/* Header */}
            <ResponsiveSection spacing="md">
              <div className="text-center space-y-6">
                <Badge variant="outline" className="text-base px-6 py-3">
                  <Zap className="h-5 w-5 mr-2" />
                  Simple, Transparent Pricing
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                  Power Your AI{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Journey
                  </span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Start free and scale as you grow. No hidden fees, cancel anytime.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Label
                    htmlFor="billing-toggle"
                    className={billingInterval === "month" ? "text-foreground" : "text-muted-foreground"}
                  >
                    Monthly
                  </Label>
                  <Switch
                    id="billing-toggle"
                    checked={billingInterval === "year"}
                    onCheckedChange={(checked) => setBillingInterval(checked ? "year" : "month")}
                  />
                  <Label
                    htmlFor="billing-toggle"
                    className={billingInterval === "year" ? "text-foreground" : "text-muted-foreground"}
                  >
                    Annual
                    <Badge variant="secondary" className="ml-2">
                      Save 20%
                    </Badge>
                  </Label>
                </div>
              </div>
            </ResponsiveSection>

            {/* Pricing Cards */}
            <ResponsiveSection spacing="md">
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

            {/* Feature Comparison */}
            <ResponsiveSection spacing="md" background="muted">
              <div className="p-8 md:p-12 max-w-5xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                  Compare Plans
                </h2>
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
                      {[
                        { feature: "Monthly Credits", free: "100", pro: "500", enterprise: "Unlimited" },
                        { feature: "AI Systems", free: "5", pro: "All 9", enterprise: "All 9" },
                        { feature: "Multi-Agent Orchestration", free: "Basic", pro: "Full", enterprise: "Full" },
                        { feature: "Voice AI", free: false, pro: true, enterprise: true },
                        { feature: "Custom Agents", free: false, pro: true, enterprise: true },
                        { feature: "Knowledge Graphs", free: false, pro: true, enterprise: true },
                        { feature: "API Access", free: false, pro: false, enterprise: true },
                        { feature: "Team Management", free: false, pro: false, enterprise: true },
                        { feature: "Dedicated Support", free: false, pro: false, enterprise: true },
                        { feature: "SLA Guarantee", free: false, pro: false, enterprise: true },
                      ].map((row) => (
                        <tr key={row.feature}>
                          <td className="py-4 px-4 font-medium">{row.feature}</td>
                          <td className="text-center py-4 px-4">
                            {typeof row.free === "boolean" ? (
                              row.free ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                              )
                            ) : (
                              row.free
                            )}
                          </td>
                          <td className="text-center py-4 px-4">
                            {typeof row.pro === "boolean" ? (
                              row.pro ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                              )
                            ) : (
                              row.pro
                            )}
                          </td>
                          <td className="text-center py-4 px-4">
                            {typeof row.enterprise === "boolean" ? (
                              row.enterprise ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                              )
                            ) : (
                              row.enterprise
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ResponsiveSection>

            {/* Trust Signals */}
            <ResponsiveSection spacing="md">
              <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
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
              <div className="text-center space-y-6 py-12 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Start with our free plan and upgrade when you're ready.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate("/chat")} className="text-lg px-12 py-7">
                    Try Free Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/contact")}
                    className="text-lg px-12 py-7"
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
