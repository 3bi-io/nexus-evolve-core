import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { ResponsiveSection, MobileSafeArea } from "@/components/layout/ResponsiveSection";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Heart, Users, Gift, Star } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  const features = [
    "Unlimited AI interactions",
    "All 9 AI systems",
    "Multi-agent orchestration",
    "Temporal memory",
    "Voice AI",
    "Agent marketplace access",
    "Browser AI",
    "Knowledge graphs",
    "Keyboard shortcuts",
    "Advanced analytics",
    "All features unlocked",
    "Priority support"
  ];

  return (
    <PageLayout showHeader={true} showFooter={true} transition={true}>
      <SEO 
        title="Everything Free Forever | Oneiros AI Platform"
        description="Access all premium features for free. Unlimited AI interactions, 9 AI systems, multi-agent orchestration, and more. No credit card required."
        keywords="free AI platform, unlimited AI, free AI tools, AI for everyone"
        canonical="https://oneiros.me/pricing"
        ogImage="/og-platform-automation.png"
      />

      <ResponsiveContainer size="xl" padding="md">
        <MobileSafeArea bottom>
          <div className="space-y-12 md:space-y-16 py-8 md:py-12">
            {/* Header */}
            <ResponsiveSection spacing="md">
              <div className="text-center space-y-6">
                <Badge variant="outline" className="text-base px-6 py-3 animate-pulse">
                  <Gift className="h-5 w-5 mr-2" />
                  Everything Free Forever
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                  No Pricing. Just{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Free Access
                  </span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  We believe AI should be accessible to everyone. That's why{" "}
                  <strong className="text-primary">every feature is completely free</strong>{" "}
                  with <strong>unlimited usage</strong>. No credit card required. No hidden fees. Ever.
                </p>
              </div>
            </ResponsiveSection>

            {/* Main Free Card */}
            <ResponsiveSection spacing="md">
              <div className="max-w-4xl mx-auto">
                <Card className="p-8 md:p-12 border-2 border-primary shadow-2xl bg-gradient-to-br from-primary/10 via-transparent to-primary/5">
                  <CardHeader className="text-center pb-8">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/20 rounded-full">
                        <Sparkles className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-bold mb-2">
                      Free Forever Plan
                    </CardTitle>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-6xl font-bold">$0</span>
                      <span className="text-2xl text-muted-foreground">/forever</span>
                    </div>
                    <p className="text-lg text-muted-foreground mt-4">
                      Unlimited everything. No strings attached.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 fill-primary" />
                          <span className="text-base">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-6 space-y-4">
                      <Button 
                        size="lg"
                        className="w-full text-lg py-7 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                        onClick={() => navigate('/chat')}
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        Start Using Now - It's Free
                      </Button>
                      <p className="text-center text-sm text-muted-foreground">
                        No sign-up required to explore • Optional account for saving preferences
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ResponsiveSection>

            {/* Why Free Section */}
            <ResponsiveSection spacing="md" background="muted">
              <div className="p-8 md:p-12 max-w-4xl mx-auto">
                <div className="text-center space-y-6">
                  <Heart className="h-16 w-16 text-primary mx-auto" />
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Why Everything Is Free
                  </h2>
                  <div className="space-y-4 text-lg text-muted-foreground text-left max-w-2xl mx-auto">
                    <p>
                      We're building Oneiros as a <strong className="text-foreground">community-driven platform</strong>.
                      Our goal is to democratize AI and make advanced automation accessible to everyone.
                    </p>
                    <p>
                      Instead of paywalls, we're focusing on creating the best AI platform possible and
                      growing an engaged community. Your feedback and usage help us improve constantly.
                    </p>
                    <p className="text-primary font-semibold">
                      Every feature. Every AI system. Unlimited usage. Completely free. Forever.
                    </p>
                  </div>
                </div>
              </div>
            </ResponsiveSection>

            {/* Community CTA */}
            <ResponsiveSection spacing="md">
              <div className="text-center space-y-6 py-12 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl">
                <Users className="h-16 w-16 text-primary mx-auto" />
                <h2 className="text-3xl md:text-4xl font-bold">
                  Join Our Growing Community
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Be part of a movement to make AI accessible to everyone.
                  Start building, automating, and creating today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/chat')}
                    className="text-lg px-12 py-7"
                  >
                    Get Started Free
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/getting-started')}
                    className="text-lg px-12 py-7"
                  >
                    Explore Features
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
