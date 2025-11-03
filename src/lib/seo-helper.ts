export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export class SEOHelper {
  private static readonly BASE_URL = 'https://65580e8a-f56c-4de3-8418-f23a06a1eb6e.lovableproject.com';
  private static readonly DEFAULT_IMAGE = '/og-image.png';

  static generatePageMetadata(page: string): PageMetadata {
    const metadata: Record<string, PageMetadata> = {
      '/': {
        title: 'Oneiros: The AI That Gets Smarter While You Sleep | 10,847 Teams Ship 3x Faster',
        description: '9 AI systems working 24/7. Autonomous evolution. Temporal memory. Voice conversations. Join 10K+ teams using AI that learns, predicts, and improves itself. Start free with 500 daily credits.',
        keywords: ['AI platform that learns', 'autonomous AI system', 'AI with memory', 'multi-agent AI', 'ChatGPT alternative', 'AI that improves itself', 'enterprise AI platform'],
        image: '/og-landing-v2.png',
        type: 'website',
      },
      '/chat': {
        title: 'AI Chat - Oneiros.me',
        description: 'Chat with the most advanced AI systems. Multi-model routing, intelligent responses, and seamless context switching.',
        keywords: ['AI chat', 'chatbot', 'AI conversation', 'multi-model AI'],
        image: '/og-image.png',
      },
      '/voice-agent': {
        title: 'Voice AI - Have Conversations, Not Chats | 5-Minute Setup',
        description: 'Natural voice conversations with AI. Real-time speech recognition, intelligent responses, function calling. Talk to AI like talking to a person. Powered by ElevenLabs.',
        keywords: ['voice AI', 'speech recognition', 'AI voice assistant', 'ElevenLabs', 'conversational AI', 'voice chatbot', 'natural language'],
        image: '/og-voice-v2.png',
      },
      '/agent-marketplace': {
        title: 'Agent Marketplace - 1,000+ Ready AI Agents | Build & Monetize',
        description: 'Browse 1,000+ specialized AI agents or build your own. Earn credits by sharing agents with the community. Agents for productivity, coding, creativity, research, and business.',
        keywords: ['AI marketplace', 'custom agents', 'AI tools', 'specialized AI', 'agent builder', 'monetize AI', 'AI revenue'],
        image: '/og-marketplace.png',
      },
      '/pricing': {
        title: 'Pricing That Scales - Save $8,400/Year vs Hiring | ROI in 2 Weeks',
        description: 'Start free with 500 daily credits forever. Professional at $49/mo. Enterprise unlimited at $999. No credit card required. Money-back guarantee. Save thousands vs hiring.',
        keywords: ['AI pricing', 'subscription plans', 'AI ROI calculator', 'enterprise AI pricing', 'AI cost savings', 'affordable AI'],
        image: '/og-pricing-v2.png',
      },
      '/social-intelligence': {
        title: 'Social Intelligence - Oneiros.me',
        description: 'AI-powered social media analysis, sentiment tracking, and viral content creation. Understand and influence your audience.',
        keywords: ['social intelligence', 'sentiment analysis', 'viral content', 'social media AI'],
        image: '/og-social.png',
      },
    };

    return metadata[page] || metadata['/'];
  }

  static generateStructuredData(type: 'website' | 'software' | 'product', data?: Partial<StructuredData>): StructuredData {
    const baseData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': type === 'website' ? 'WebSite' : type === 'software' ? 'SoftwareApplication' : 'Product',
      name: 'Oneiros.me',
      url: this.BASE_URL,
    };

    if (type === 'website') {
      return {
        ...baseData,
        '@type': 'WebSite',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${this.BASE_URL}/chat?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        ...data,
      };
    }

    if (type === 'software') {
      return {
        ...baseData,
        '@type': 'SoftwareApplication',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, iOS, Android',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1250',
        },
        ...data,
      };
    }

    return { ...baseData, ...data };
  }

  static generateBreadcrumbs(items: Array<{ name: string; url: string }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${this.BASE_URL}${item.url}`,
      })),
    };
  }

  static generateFAQ(questions: Array<{ question: string; answer: string }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer,
        },
      })),
    };
  }

  static getCanonicalUrl(path: string): string {
    return `${this.BASE_URL}${path}`;
  }

  static generateSitemap(): string {
    const routes = [
      { path: '/', priority: 1.0, changefreq: 'daily' },
      { path: '/chat', priority: 0.9, changefreq: 'daily' },
      { path: '/voice-agent', priority: 0.9, changefreq: 'weekly' },
      { path: '/agent-marketplace', priority: 0.8, changefreq: 'daily' },
      { path: '/pricing', priority: 0.8, changefreq: 'weekly' },
      { path: '/getting-started', priority: 0.7, changefreq: 'weekly' },
      { path: '/capabilities', priority: 0.7, changefreq: 'weekly' },
      { path: '/browser-ai', priority: 0.6, changefreq: 'weekly' },
      { path: '/social-intelligence', priority: 0.6, changefreq: 'weekly' },
      { path: '/privacy', priority: 0.5, changefreq: 'monthly' },
      { path: '/terms', priority: 0.5, changefreq: 'monthly' },
    ];

    const urls = routes
      .map(
        (route) => `
  <url>
    <loc>${this.BASE_URL}${route.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }
}
