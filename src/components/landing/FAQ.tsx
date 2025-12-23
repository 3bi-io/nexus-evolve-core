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
    question: 'Is the Free Forever plan really unlimited?',
    answer: 'Yes! Our Free Forever plan gives you unlimited usage on every feature. No credit limits, no time restrictions on usage. We believe AI should be accessible to everyone.',
  },
  {
    question: 'Can Oneiros integrate with my existing tools?',
    answer: 'Yes! Oneiros supports webhooks, API access, and can integrate with 1,000+ tools. Our agent marketplace includes pre-built integrations for popular services. All integration features are free.',
  },
  {
    question: 'Is my data secure and private?',
    answer: 'Absolutely. All data is encrypted in transit and at rest. We offer Browser AI mode where models run locally on your device - your data never leaves your computer. Optional accounts include SSO and audit logs.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No! You can start using Oneiros immediately without any account. Creating an account is optional and only needed if you want to save your chat history and preferences across devices.',
  },
  {
    question: 'How does the AI "learn" and improve?',
    answer: 'Oneiros has an autonomous evolution system. After each conversation, it extracts learnings and updates your knowledge graph. Every night, it analyzes performance metrics, discovers new capabilities, optimizes prompts, and improves routing decisions. It literally gets smarter while you sleep.',
  },
  {
    question: 'Can I build and share my own AI agents?',
    answer: 'Yes! Use Agent Studio to create custom agents with specific personalities, knowledge, and capabilities. List them on our marketplace to share with the community. All agent creation and sharing features are completely free.',
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