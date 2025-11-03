import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PricingCards } from "@/components/pricing/PricingCards";
import { PageLayout } from "@/components/layout/PageLayout";
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
        "Each operation (chat message, image generation, voice synthesis, etc.) costs credits based on complexity. Simple chat messages cost 1 credit, while advanced operations like image generation cost 2-3 credits. You can see the exact cost before each operation.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. You'll retain access to your paid features until the end of your current billing period.",
    },
  ];

  return (
    <PageLayout showHeader={true} showFooter={true} transition={true}>
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

      {/* Pricing Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4">
        <div className="container-mobile mx-auto max-w-6xl">
          <div className="text-center space-mobile mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Choose Your Plan
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Start free with 500 daily credits. Upgrade for more credits and advanced features.
            </p>
          </div>

          <PricingCards />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing px-4 bg-muted/30">
        <div className="container-mobile mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4 sm:px-6">
                <AccordionTrigger className="text-left text-base sm:text-lg py-4 sm:py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4 sm:pb-5">
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
    </PageLayout>
  );
};

export default Pricing;
