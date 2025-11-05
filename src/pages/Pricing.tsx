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
      question: "Why beta pricing? What's the catch?",
      answer:
        "No catch - we're transparent. We're in beta with a small but growing user base. Our tech is production-ready (68 database tables, 20+ edge functions, 9 AI systems, unified sidebar navigation), but we're building in public. Early users get lifetime founder rates as a thank you for joining early and providing feedback. When we officially launch, prices will increase - but yours stays locked in forever.",
    },
    {
      question: "What's included in the free tier?",
      answer:
        "The free tier includes: 500 daily AI interactions (resets every day), unified sidebar navigation across all 9 AI systems, multi-agent orchestration, temporal memory, voice AI, agent marketplace access, browser AI, knowledge graphs, keyboard shortcuts (Cmd+B), beta tester badge, and community support. It's genuinely free forever - no credit card required, no surprise charges.",
    },
    {
      question: "What does 'locked in forever' mean?",
      answer:
        "If you subscribe during beta at $29/mo, that's your rate forever - even after we raise prices post-launch. It's our way of rewarding early adopters. You'll never pay more as long as you stay subscribed. If you cancel and come back later, you'll pay the then-current rate. This is a genuine founder's benefit.",
    },
    {
      question: "Can I upgrade or downgrade anytime?",
      answer:
        "Yes! Upgrade instantly and we'll add remaining interactions to your new tier. Downgrade at any time - you keep your paid features until the billing cycle ends. No penalties, no hassle. Beta users get flexible terms because we want you to find the right fit.",
    },
    {
      question: "What happens when I run out of AI interactions?",
      answer:
        "Free users get 500 fresh AI interactions every day automatically. Paid subscribers can upgrade mid-cycle for instant access to more interactions, or wait until next billing cycle for automatic refill. You'll get notifications at 80% and 95% usage so you're never surprised. Interactions never expire within your billing period.",
    },
    {
      question: "Is this really production-ready if it's beta?",
      answer:
        "Yes! Beta refers to our user base size, not technical readiness. We have 68 production database tables, 20+ serverless edge functions, enterprise-grade security with Row Level Security, automated cron jobs for autonomous evolution, and all 9 AI systems fully operational. We're beta because we're building community and gathering feedback - not because the tech isn't ready.",
    },
    {
      question: "How long will beta pricing last?",
      answer:
        "We're aiming for the first 1,000 users, but we'll announce 30 days before any price increases. Current beta users will receive advance notice and keep their founder rates. We're committed to transparency - no surprise pricing changes. Join now to guarantee your rate.",
    },
    {
      question: "What's your refund policy?",
      answer:
        "We offer a 14-day money-back guarantee on all paid plans. If you're unsatisfied for any reason, email us within 14 days and we'll refund you completely - no questions asked. Beta users get extra flexibility as we iterate and improve.",
    },
  ];

  return (
    <PageLayout showHeader={true} showFooter={true} transition={true}>
      <SEO 
        title="Beta Pricing - Lock In Founder Rates Forever | Early Access"
        description="Join our beta. Start free with 500 daily credits forever. Founder rate $29/mo (normally $49). Lock in your rate for life. Limited to first 1,000 users."
        keywords="beta pricing, founder rates, early access pricing, AI beta launch, startup pricing"
        canonical="https://oneiros.me/pricing"
        ogImage="/og-pricing-v2.png"
      />

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl space-y-12 sm:space-y-16">
        {/* Header */}
        <div className="text-center space-mobile">
          <Badge variant="outline" className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 animate-pulse">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            🚀 Beta Launch - Lock In Founder Rates
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Beta Pricing for Early Users
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join the first 1,000 founder rate users. Start free forever or lock in <strong className="text-primary">$29/mo for life</strong>. 
            Price increases to $49/mo after beta. Includes unified platform experience with all features.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm pt-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span className="hidden sm:inline">No credit card required</span>
              <span className="sm:hidden">No card required</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span className="hidden sm:inline">Beta access to all features</span>
              <span className="sm:hidden">All features</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              <span className="hidden sm:inline">Lifetime founder pricing</span>
              <span className="sm:hidden">Locked price</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <PricingCards />

        {/* Value Comparison */}
        <div className="bg-muted/30 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-center mb-4">Beta Value Proposition</h3>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're in beta, building honestly. Here's what early users get vs. future pricing
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-3xl font-bold">$49/mo</p>
              <p className="text-sm font-semibold">After Beta Launch</p>
              <p className="text-xs text-muted-foreground">Standard Professional pricing</p>
            </div>
            <div className="text-center space-y-2">
              <DollarSign className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-3xl font-bold text-primary">$29/mo</p>
              <p className="text-sm font-semibold">Beta Founder Rate</p>
              <p className="text-xs text-muted-foreground">Locked in forever - Join now</p>
            </div>
            <div className="text-center space-y-2">
              <DollarSign className="h-10 w-10 text-success mx-auto mb-3" />
              <p className="text-3xl font-bold text-success">$0/mo</p>
              <p className="text-sm font-semibold">Forever Free Tier</p>
              <p className="text-xs text-muted-foreground">500 daily AI interactions, all features</p>
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
            Join the Beta Program
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about beta access, founder pricing, or enterprise needs? 
            Connect with our team.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = "mailto:sales@oneiros.me"}>
              Contact Us
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/getting-started')}>
              Try Demo First
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Pricing;
