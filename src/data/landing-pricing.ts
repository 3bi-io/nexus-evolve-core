export interface PricingTier {
  name: string;
  price: number | null;
  originalPrice?: number;
  credits: string;
  features: string[];
  cta: string;
  popular: boolean;
  badge: string;
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: 0,
    credits: '500 daily credits forever',
    features: ['9 AI systems', 'Enterprise security', 'Multi-agent orchestration', 'Voice AI', 'Agent marketplace', 'Beta tester badge'],
    cta: 'Join Beta Free',
    popular: false,
    badge: '🎁 Forever Free',
  },
  {
    name: 'Professional',
    price: 29,
    originalPrice: 49,
    credits: '10,000 credits/month',
    features: ['Everything in Starter', 'Priority support', 'Advanced analytics', 'Enhanced security monitoring', 'Founder badge', 'Locked-in rate forever'],
    cta: 'Lock In Founder Rate',
    popular: true,
    badge: '🔥 Founder Rate',
  },
  {
    name: 'Enterprise',
    price: null,
    credits: 'Custom credits',
    features: ['Everything in Professional', 'Dedicated support', 'Custom security rules', 'White-label options', 'Shape development', 'Direct dev access'],
    cta: 'Schedule Call',
    popular: false,
    badge: '🚀 Beta Custom',
  },
];
