import { Code, Users, PenTool, Search, TrendingUp, LucideIcon } from 'lucide-react';

export interface EnhancedUseCase {
  id: string;
  title: string;
  icon: LucideIcon;
  tagline: string;
  
  // The story
  problem: string;
  solution: string;
  
  // Visual proof
  beforeState: string;
  afterState: string;
  
  // Metrics
  timeSaved: string;
  productivityGain: string;
  roi: string;
  
  // Features used
  keyFeatures: string[];
  
  // Social proof
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company: string;
  };
  
  // CTA
  demoPrompt?: string;
}

export const enhancedUseCases: EnhancedUseCase[] = [
  {
    id: 'product-teams',
    title: 'Product Teams',
    icon: Code,
    tagline: 'Ship features 3x faster with AI coordination',
    problem: 'Product teams waste 60% of their time context-switching between tools, writing documentation, and coordinating across functions.',
    solution: 'Multi-agent AI coordinates design, development, testing, and documentation automatically. One conversation replaces 10 meetings.',
    beforeState: 'Feature takes 3 weeks → 15 meetings → 200 Slack messages → Manual docs',
    afterState: 'Same feature takes 1 week → 3 AI conversations → Auto-generated docs',
    timeSaved: '14 days per feature',
    productivityGain: '3x faster delivery',
    roi: '$50K+ saved per quarter',
    keyFeatures: [
      'Multi-agent coordination',
      'Code generation & review',
      'Automated testing suites',
      'Requirements analysis',
      'Technical documentation'
    ],
    testimonial: {
      quote: 'We shipped our MVP in 3 weeks instead of 3 months. The AI handled all the boilerplate and coordination.',
      author: 'Sarah Chen',
      role: 'VP Product',
      company: 'TechStartup Inc'
    },
    demoPrompt: 'Help me build a user authentication system with email verification'
  },
  {
    id: 'customer-success',
    title: 'Customer Success',
    icon: Users,
    tagline: '24/7 intelligent support that never sleeps',
    problem: 'Support teams can\'t scale. Every new customer adds support load. Response times increase. Quality drops. Burnout rises.',
    solution: 'Voice AI handles 89% of support tickets automatically. Learns from your knowledge base. Escalates complex issues to humans seamlessly.',
    beforeState: '2-hour response time → 50 tickets/day limit → Burned out team',
    afterState: '30-second response time → Unlimited capacity → Happy team focuses on complex cases',
    timeSaved: '160 hours per week',
    productivityGain: '89% automation',
    roi: '$120K+ saved annually',
    keyFeatures: [
      'Voice AI support',
      'Knowledge base search',
      'Sentiment analysis',
      'Auto-responses',
      'Smart escalation'
    ],
    testimonial: {
      quote: 'Our NPS increased 40 points after implementing AI support. Customers love the instant, accurate responses.',
      author: 'Mike Rodriguez',
      role: 'Head of Customer Success',
      company: 'SaaS Platform'
    },
    demoPrompt: 'Create a customer support bot that can search our documentation'
  },
  {
    id: 'content-creators',
    title: 'Content Creators',
    icon: PenTool,
    tagline: 'Generate & optimize content at scale',
    problem: 'Content creation doesn\'t scale. Quality writers are expensive. SEO is complex. Maintaining consistency across channels is impossible.',
    solution: 'AI generates blog posts, images, social content, and SEO metadata. Maintains your brand voice. Optimizes for search and engagement.',
    beforeState: '1 blog post per week → 8 hours writing → Manual SEO → Inconsistent voice',
    afterState: '5 blog posts per week → 2 hours oversight → Auto-SEO → Perfect consistency',
    timeSaved: '30 hours per week',
    productivityGain: '5x content output',
    roi: '$80K+ saved annually',
    keyFeatures: [
      'AI writing assistant',
      'Image generation',
      'SEO optimization',
      'Trend analysis',
      'Multi-channel publishing'
    ],
    testimonial: {
      quote: 'We went from 4 blog posts a month to 20, with better engagement. The AI nailed our brand voice.',
      author: 'Emma Taylor',
      role: 'Content Director',
      company: 'Marketing Agency'
    },
    demoPrompt: 'Write a blog post about AI trends in 2025 with SEO optimization'
  },
  {
    id: 'researchers',
    title: 'Researchers',
    icon: Search,
    tagline: 'Analyze & synthesize data in minutes',
    problem: 'Research is buried in papers, PDFs, and databases. Finding relevant information takes weeks. Synthesizing insights is manual and error-prone.',
    solution: 'AI reads thousands of documents, builds knowledge graphs, extracts key insights, and generates summaries with citations.',
    beforeState: '3 weeks literature review → Manual note-taking → Missed connections',
    afterState: '2 days AI-assisted review → Auto-citation → Discovered hidden patterns',
    timeSaved: '70% time saved',
    productivityGain: '10x faster insights',
    roi: '$60K+ saved per project',
    keyFeatures: [
      'Document analysis',
      'Knowledge graphs',
      'Citation finder',
      'Summary generation',
      'Pattern detection'
    ],
    testimonial: {
      quote: 'The AI found connections between papers that took us months to discover manually. Game-changer for research.',
      author: 'Dr. James Liu',
      role: 'Research Lead',
      company: 'BioTech Labs'
    },
    demoPrompt: 'Analyze these research papers and find common themes'
  },
  {
    id: 'sales-teams',
    title: 'Sales Teams',
    icon: TrendingUp,
    tagline: 'Personalized outreach at scale',
    problem: 'Sales doesn\'t scale. Every prospect needs personalized outreach. Follow-ups fall through cracks. CRM becomes a graveyard of stale leads.',
    solution: 'AI scores leads, generates personalized emails, automates follow-ups, and integrates with your CRM. Sales team focuses on closing.',
    beforeState: '20 manual emails per day → Generic templates → 2% response rate',
    afterState: '100 AI-personalized emails per day → Unique copy → 8% response rate',
    timeSaved: '25 hours per week',
    productivityGain: '2.5x conversion',
    roi: '$200K+ additional revenue',
    keyFeatures: [
      'Lead scoring',
      'Email generation',
      'CRM integration',
      'Follow-up automation',
      'Pipeline analytics'
    ],
    testimonial: {
      quote: 'Our close rate doubled. The AI-generated emails feel more personal than our manual ones ever did.',
      author: 'Alex Morgan',
      role: 'Sales Director',
      company: 'Enterprise Software'
    },
    demoPrompt: 'Generate personalized outreach emails for our top 10 leads'
  },
];
