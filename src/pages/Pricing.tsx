import { Button } from "@/components/ui/button";
import { Brain, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PricingCards } from "@/components/pricing/PricingCards";
import { PageTransition } from "@/components/ui/page-transition";
import { SEO } from "@/components/SEO";
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
      question: "What happens when I run out of credits?",
      answer:
        "Free users get 5 daily credits that reset each day if you visit consecutively. Paid subscribers can upgrade to a higher tier for more credits, or wait until the next billing cycle for an automatic refill.",
    },
    {
      question: "Can I upgrade mid-month?",
      answer:
        "Yes! When you upgrade, your remaining credits are prorated and added to your new tier's allocation. You'll be charged the difference and your billing cycle will reset.",
    },
    {
      question: "Do unused credits roll over?",
      answer:
        "No, credits reset at the beginning of each billing cycle. This ensures you always have a fresh allocation matched to your current tier.",
    },
    {
      question: "How do I track my usage?",
      answer:
        "View your credit balance in the navigation bar and detailed usage history on your account page. You'll also receive notifications when running low on credits.",
    },
    {
      question: "What counts as a credit?",
      answer:
        "Each credit provides 300 seconds (5 minutes) of usage time. Your session timer starts when you use the platform and credits are deducted based on elapsed time when you finish. 1 credit = 5 minutes, so 10 credits = 50 minutes of usage.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. You'll retain access to your paid features until the end of your current billing period.",
    },
  ];

  return (
    <PageTransition>
      <SEO 
        title="Pricing Plans - Starter $49, Professional $149, Enterprise $999"
        description="Choose the perfect AI plan for your needs. Starter: 500 credits/month at $49. Professional: 2,000 credits at $149. Enterprise: Unlimited at $999. Free tier with 500 daily credits available."
        keywords="AI pricing, subscription plans, AI platform pricing, credits pricing, enterprise AI"
        canonical="https://oneiros.me/pricing"
        ogImage="/og-pricing.png"
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "Offer",
              "name": "Free Tier",
              "price": "0",
              "priceCurrency": "USD",
              "description": "500 free daily credits"
            },
            {
              "@type": "Offer",
              "name": "Starter Plan",
              "price": "49",
              "priceCurrency": "USD",
              "description": "500 credits per month"
            },
            {
              "@type": "Offer",
              "name": "Professional Plan",
              "price": "149",
              "priceCurrency": "USD",
              "description": "2,000 credits per month"
            },
            {
              "@type": "Offer",
              "name": "Enterprise Plan",
              "price": "999",
              "priceCurrency": "USD",
              "description": "Unlimited credits"
            }
          ]
        }}
      />
      <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">Oneiros.me</span>
          </div>
          <div className="w-20" /> {/* Spacer for center alignment */}
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-5xl font-bold">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free with 5 daily credits (25 min/day). Upgrade for more time and features.
            </p>
          </div>

          <PricingCards />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Still have questions?
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Our team is here to help you choose the right plan for your needs.
          </p>
          <Button size="lg" onClick={() => window.location.href = "mailto:c@3bi.io"}>
            Contact Sales
          </Button>
        </div>
      </section>
      </div>
    </PageTransition>
  );
};

export default Pricing;
