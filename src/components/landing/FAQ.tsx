import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: 'How is Oneiros different from ChatGPT or Claude?',
    answer: 'Unlike single-model AI chatbots, Oneiros is a complete AI ecosystem with 9 integrated systems: multi-agent orchestration, temporal memory that never forgets, voice conversations, autonomous evolution, predictive capabilities, an agent marketplace, and more. ChatGPT forgets your conversations. Oneiros builds a permanent knowledge graph and gets smarter over time.',
  },
  {
    question: 'Do I need to configure everything myself?',
    answer: 'No! Oneiros works out of the box with smart defaults. Our AI automatically learns your patterns, routes tasks to the best agents, and improves itself daily. Advanced users can customize everything, but beginners can start chatting immediately.',
  },
  {
    question: 'What happens if I run out of credits?',
    answer: 'You get 500 free credits daily that reset automatically - that\'s enough for 40+ hours of AI use. If you need more, upgrade to Professional (10,000 credits/mo) or Enterprise (unlimited). You can also earn bonus credits through referrals and achievements.',
  },
  {
    question: 'Can Oneiros integrate with my existing tools?',
    answer: 'Yes! Oneiros supports webhooks, API access, and can integrate with 1,000+ tools. Our agent marketplace includes pre-built integrations for popular services. Enterprise plans include custom integration support.',
  },
  {
    question: 'Is my data secure and private?',
    answer: 'Absolutely. All data is encrypted in transit and at rest. We offer Browser AI mode where models run locally on your device - your data never leaves your computer. Enterprise plans include SSO, audit logs, and compliance certifications (SOC 2, GDPR, HIPAA available).',
  },
  {
    question: 'What happens when I cancel?',
    answer: 'You can cancel anytime with no penalties. Your data remains accessible for 30 days, giving you time to export everything. We also offer a 14-day money-back guarantee on paid plans - if you\'re not satisfied, we\'ll refund you completely.',
  },
  {
    question: 'How does the AI "learn" and improve?',
    answer: 'Oneiros has an autonomous evolution system. After each conversation, it extracts learnings and updates your knowledge graph. Every night, it analyzes performance metrics, discovers new capabilities, optimizes prompts, and improves routing decisions. It literally gets smarter while you sleep.',
  },
  {
    question: 'Can I build and monetize my own AI agents?',
    answer: 'Yes! Use Agent Studio to create custom agents with specific personalities, knowledge, and capabilities. List them on our marketplace to share with the community or monetize them. Creators earn credits when others use their agents.',
  },
];

export function FAQ() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}