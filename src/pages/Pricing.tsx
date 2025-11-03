import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PricingCards } from "@/components/pricing/PricingCards";
import { PageLayout } from "@/components/layout/PageLayout";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { ROICalculator } from "@/components/conversion/ROICalculator";
import { TrendingUp, Shield, Zap, DollarSign, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Pricing = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How is this different from ChatGPT or Claude pricing?",
      answer:
        "Unlike ChatGPT/Claude which charge per message or monthly subscriptions with limited features, Oneiros gives you 9 integrated AI systems (multi-agent, voice, memory, evolution, marketplace) for one price. Our free tier alone (500 daily credits) offers more than most paid AI services. Plus, you get permanent memory, agent building, and autonomous learning - features not available elsewhere at any price.",
    },
    {
      question: "What's included in the free tier?",
      answer:
        "The free tier includes: 500 daily credits (resets every day), access to all 9 AI systems, multi-agent orchestration, temporal memory, voice AI, agent marketplace access, browser AI, knowledge graphs, and community support. It's genuinely free forever - no credit card required, no surprise charges.",
    },
    {
      question: "How does the ROI work out to 2 weeks?",
      answer:
        "Based on our customers: A 5-person team spending 10 hours/week on AI tasks sees 3x productivity gains within 2 weeks. That's 30 hours saved weekly (worth $2,250 at $75/hr). Professional plan costs $49/mo. ROI = ($2,250 x 4 weeks - $49) / $49 = 18,267% return in first month. Even conservative estimates show positive ROI within 14 days.",
    },
    {
      question: "Can I upgrade or downgrade anytime?",
      answer:
        "Yes! Upgrade instantly and we'll prorate your remaining credits. Downgrade at any time - you keep your paid features until the billing cycle ends. No penalties, no hassle. If you're not satisfied within 14 days of upgrading, we'll refund you 100%.",
    },
    {
      question: "What happens when I run out of credits?",
      answer:
        "Free users get 500 fresh credits every day automatically. Paid subscribers can upgrade mid-cycle for instant access to more credits, or wait until next billing cycle for automatic refill. You'll get notifications at 80% and 95% usage so you're never surprised. Credits never expire within your billing period.",
    },
    {
      question: "How much does it cost compared to hiring?",
      answer:
        "A junior AI engineer costs $75K+/year ($6,250/mo) plus benefits, training, and management overhead. Our Enterprise plan at $999/mo gives you unlimited AI capacity that works 24/7, never takes vacation, and continuously improves. That's 84% cost savings with 10x the availability. Even our $49/mo Professional plan replaces $600+/mo in AI subscriptions.",
    },
    {
      question: "Do you offer annual discounts?",
      answer:
        "Yes! Pay annually and save 20% on Professional and Enterprise plans. That's 2+ months free. Annual customers also get priority support, early access to new features, and dedicated onboarding. Contact sales@oneiros.me for annual billing options and volume discounts for teams.",
    },
    {
      question: "What's your refund policy?",
      answer:
        "We offer a 14-day money-back guarantee on all paid plans. If Oneiros doesn't deliver 3x productivity gains or you're unsatisfied for any reason, email us within 14 days and we'll refund you completely - no questions asked. We also offer a 30-day trial extension for teams evaluating Enterprise plans.",
    },
  ];

  return (
    <PageLayout showHeader={true} showFooter={true} transition={true}>
      <SEO 
        title="Pricing That Scales - Save $8,400/Year vs Hiring | ROI in 2 Weeks"
        description="Start free with 500 daily credits forever. Professional at $49/mo. Enterprise unlimited at $999. No credit card required. Money-back guarantee."
        keywords="AI pricing, subscription plans, AI ROI calculator, enterprise AI pricing, AI cost savings"
        canonical="https://oneiros.me/pricing"
        ogImage="/og-pricing-v2.png"
      />

      <div className="container mx-auto px-4 py-12 max-w-7xl space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <Badge variant="outline" className="text-base px-4 py-2">
            <TrendingUp className="h-4 w-4 mr-2" />
            Save $8,400/Year vs Hiring
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Pricing That Scales With You
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Start free with 500 daily credits. Scale to Professional at $49/mo. 
            Enterprise for unlimited growth. <strong>ROI in 2 weeks.</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm pt-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>14-day money-back guarantee</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <PricingCards />

        {/* Value Comparison */}
        <div className="bg-muted/30 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-8">Compare the Value</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <DollarSign className="h-10 w-10 text-destructive mx-auto mb-3" />
              <p className="text-3xl font-bold text-destructive">$6,250/mo</p>
              <p className="text-sm font-semibold">Junior AI Engineer</p>
              <p className="text-xs text-muted-foreground">Plus benefits, training, management</p>
            </div>
            <div className="text-center space-y-2">
              <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-3xl font-bold">$600+/mo</p>
              <p className="text-sm font-semibold">Multiple AI Subscriptions</p>
              <p className="text-xs text-muted-foreground">ChatGPT, Claude, voice AI, etc.</p>
            </div>
            <div className="text-center space-y-2">
              <DollarSign className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-3xl font-bold text-primary">$49/mo</p>
              <p className="text-sm font-semibold">Oneiros Professional</p>
              <p className="text-xs text-muted-foreground">9 AI systems, 24/7 availability</p>
            </div>
          </div>
        </div>

        {/* ROI Calculator */}
        <ROICalculator />

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg py-5 hover:no-underline font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center space-y-6 py-12 bg-gradient-to-br from-primary/5 to-transparent rounded-lg">
          <Clock className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-3xl font-bold">
            Still Have Questions?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Talk to our team about Enterprise plans, custom integrations, or volume discounts for your organization.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = "mailto:sales@oneiros.me"}>
              Schedule a Call
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/getting-started')}>
              View Quick Start Guide
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Pricing;
