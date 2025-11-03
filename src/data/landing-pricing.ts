// Phase 2.2 & 3.1: Updated pricing with AI interactions terminology
export interface PricingTier {
  name: string;
  price: number | null;
  originalPrice?: number;
  credits: string;
  features: string[];
  cta: string;
  popular: boolean;
  badge: string;
  isFounderRate?: boolean;
  slotsRemaining?: number;
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 0,
    credits: '500 daily AI interactions',
    features: ['500 daily AI interactions', '9 AI systems', 'Multi-agent orchestration', 'Voice AI', 'Agent marketplace', 'Beta tester badge'],
    cta: 'Join Beta Free',
    popular: false,
    badge: '🎁 Forever Free',
  },
  {
    name: 'Professional',
    price: 29,
    originalPrice: 49,
    credits: '10,000 AI interactions/month',
    features: ['10,000 AI interactions/month', 'All 9 AI systems', 'Priority support', 'Advanced analytics', 'Enhanced security', 'Founder badge', 'Rate locked forever'],
    cta: 'Lock In Founder Rate',
    popular: true,
    badge: '🔥 Founder Rate',
    isFounderRate: true,
    slotsRemaining: 87, // Updated dynamically
  },
  {
    name: 'Enterprise',
    price: null,
    credits: 'Unlimited AI interactions',
    features: ['Unlimited AI interactions', 'Everything in Professional', 'Dedicated support', 'Custom integrations', 'White-label options', 'Direct dev access'],
    cta: 'Schedule Call',
    popular: false,
    badge: '🚀 Beta Custom',
  },
];
