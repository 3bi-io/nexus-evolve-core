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
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: string[];
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export class SEOHelper {
  private static readonly BASE_URL = 'https://oneiros.me';
  private static readonly DEFAULT_IMAGE = '/og-platform-automation.png';

  static generatePageMetadata(page: string): PageMetadata {
    const metadata: Record<string, PageMetadata> = {
      '/': {
        title: 'Oneiros.me - Advanced AI Automation Platform | 38+ Edge Functions',
        description: 'Production-ready AI automation platform with 38+ edge functions, vision AI, multi-agent workflows, and real-time monitoring. Transform your business with cutting-edge AI technology.',
        keywords: ['AI automation', 'edge functions', 'vision AI', 'multi-agent', 'workflow automation', 'artificial intelligence', 'machine learning', 'AI platform', 'enterprise AI', 'business automation'],
        image: '/og-platform-automation.png',
        type: 'website',
        section: 'Technology',
        tags: ['AI', 'Automation', 'Platform']
      },
      '/chat': {
        title: 'AI Chat Interface - Intelligent Conversations | Oneiros.me',
        description: 'Engage with advanced AI models through our intelligent chat interface. Get instant, context-aware responses powered by state-of-the-art language models.',
        keywords: ['AI chat', 'conversational AI', 'chatbot', 'AI assistant', 'natural language processing', 'GPT'],
        image: '/og-platform-automation.png',
        type: 'website',
        section: 'Product'
      },
      '/pricing': {
        title: 'Pricing Plans - Flexible AI Solutions | Oneiros.me',
        description: 'Choose the perfect AI automation plan for your needs. Flexible pricing for individuals, teams, and enterprises with transparent, usage-based billing.',
        keywords: ['AI pricing', 'subscription plans', 'enterprise AI', 'automation pricing', 'API pricing'],
        image: '/og-pricing-v2.png',
        type: 'website',
        section: 'Pricing'
      },
      '/agent-marketplace': {
        title: 'AI Agent Marketplace - Pre-Built AI Solutions | Oneiros.me',
        description: 'Discover and deploy pre-built AI agents for various business needs. Browse our marketplace of specialized AI solutions ready to automate your workflows.',
        keywords: ['AI agents', 'marketplace', 'automation agents', 'AI solutions', 'pre-built AI'],
        image: '/og-agents-v2.png',
        type: 'website',
        section: 'Marketplace'
      },
      '/voice-agent': {
        title: 'Voice AI Agent - Natural Conversations | Oneiros.me',
        description: 'Deploy intelligent voice AI agents with natural language understanding. Create conversational experiences that feel human with our voice AI technology.',
        keywords: ['voice AI', 'speech recognition', 'conversational AI', 'voice assistant', 'speech synthesis'],
        image: '/og-voice-v2.png',
        type: 'website',
        section: 'Product'
      },
      '/social-intelligence': {
        title: 'Social Intelligence - AI-Powered Social Media | Oneiros.me',
        description: 'Leverage AI for social media monitoring, sentiment analysis, and trend detection. Make data-driven decisions with advanced social intelligence.',
        keywords: ['social intelligence', 'sentiment analysis', 'social monitoring', 'AI analytics', 'social media AI'],
        image: '/og-social-v2.png',
        type: 'website',
        section: 'Product'
      }
    };
    
    return metadata[page] || metadata['/'];
  }

  static generateOrganizationSchema(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Oneiros.me',
      url: this.BASE_URL,
      logo: `${this.BASE_URL}/favicon-oneiros.png`,
      description: 'Advanced AI automation platform with 38+ edge functions, vision AI, and multi-agent workflows',
      foundingDate: '2024',
      sameAs: [
        'https://twitter.com/oneiros',
        'https://linkedin.com/company/oneiros',
        'https://github.com/oneiros'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@oneiros.me',
        availableLanguage: ['English']
      }
    };
  }

  static generateWebSiteSchema(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Oneiros.me',
      url: this.BASE_URL,
      description: 'Production-ready AI automation platform',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.BASE_URL}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Oneiros.me',
        logo: {
          '@type': 'ImageObject',
          url: `${this.BASE_URL}/favicon-oneiros.png`
        }
      }
    };
  }

  static generateStructuredData(
    type: 'website' | 'software' | 'product',
    data?: Partial<StructuredData>
  ): StructuredData {
    const bases = {
      website: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Oneiros.me - AI Automation Platform',
        description: 'Advanced AI automation platform',
        url: this.BASE_URL,
        inLanguage: 'en-US',
        isPartOf: {
          '@type': 'WebSite',
          name: 'Oneiros.me',
          url: this.BASE_URL
        }
      },
      software: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Oneiros.me AI Platform',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '250',
          bestRating: '5',
          worstRating: '1'
        },
        featureList: [
          '38+ Edge Functions',
          'Vision AI Integration',
          'Multi-Agent Workflows',
          'Real-time Monitoring',
          'Enterprise Security'
        ]
      },
      product: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Oneiros.me AI Automation',
        description: 'Production-ready AI automation platform',
        brand: {
          '@type': 'Brand',
          name: 'Oneiros.me'
        },
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: '0',
          highPrice: '999',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        }
      }
    };
    
    return { ...bases[type], ...data };
  }

  static generateBreadcrumbs(items: BreadcrumbItem[]): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${this.BASE_URL}${item.url}`
      }))
    };
  }

  static generateArticleSchema(article: {
    title: string;
    description: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    author: string;
  }): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: article.image,
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      author: {
        '@type': 'Person',
        name: article.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'Oneiros.me',
        logo: {
          '@type': 'ImageObject',
          url: `${this.BASE_URL}/favicon-oneiros.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': this.BASE_URL
      }
    };
  }

  static generateFAQ(questions: Array<{ question: string; answer: string }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer
        }
      }))
    };
  }

  static generateVideoSchema(video: {
    name: string;
    description: string;
    thumbnailUrl: string;
    uploadDate: string;
    duration?: string;
  }): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: video.name,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      uploadDate: video.uploadDate,
      duration: video.duration,
      publisher: {
        '@type': 'Organization',
        name: 'Oneiros.me',
        logo: {
          '@type': 'ImageObject',
          url: `${this.BASE_URL}/favicon-oneiros.png`
        }
      }
    };
  }

  static generateServiceSchema(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'AI Automation Platform',
      provider: {
        '@type': 'Organization',
        name: 'Oneiros.me'
      },
      areaServed: 'Worldwide',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'AI Automation Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Vision AI Processing',
              description: 'Advanced computer vision and image analysis'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Multi-Agent Workflows',
              description: 'Intelligent multi-agent coordination and automation'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Edge Functions',
              description: '38+ serverless functions for AI automation'
            }
          }
        ]
      }
    };
  }

  static getCanonicalUrl(path: string): string {
    // Remove trailing slash except for root
    const cleanPath = path === '/' ? path : path.replace(/\/$/, '');
    // Remove query params and hash for canonical
    const pathWithoutParams = cleanPath.split('?')[0].split('#')[0];
    return `${this.BASE_URL}${pathWithoutParams}`;
  }

  static generateAlternateLinks(path: string): Array<{ hreflang: string; href: string }> {
    return [
      { hreflang: 'en', href: `${this.BASE_URL}${path}` },
      { hreflang: 'x-default', href: `${this.BASE_URL}${path}` }
    ];
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
