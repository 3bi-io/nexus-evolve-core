// Stripe product and price configuration for Oneiros
export const STRIPE_CONFIG = {
  products: {
    pro: {
      id: "prod_TesCNFzJKIiWJy",
      name: "Oneiros Pro",
      description: "500 credits/month, all 9 AI systems, multi-agent orchestration, priority support",
    },
    proAnnual: {
      id: "prod_TesDcc7CpEAPyA",
      name: "Oneiros Pro Annual",
      description: "500 credits/month, all 9 AI systems, multi-agent orchestration, priority support - Annual billing (save 20%)",
    },
    enterprise: {
      id: "prod_TesDFtBSqeaQL7",
      name: "Oneiros Enterprise",
      description: "Unlimited credits, dedicated support, custom integrations, SLA guarantee",
    },
  },
  prices: {
    proMonthly: {
      id: "price_1ShYSY2MfT7Ozvjx6cXRwG9P",
      amount: 1900, // $19.00
      interval: "month",
      productId: "prod_TesCNFzJKIiWJy",
    },
    proAnnual: {
      id: "price_1ShYSa2MfT7OzvjxBRe5TZTb",
      amount: 18200, // $182.00 (save 20%)
      interval: "year",
      productId: "prod_TesDcc7CpEAPyA",
    },
    enterprise: {
      id: "price_1ShYSc2MfT7OzvjxF6wCMyax",
      amount: 9900, // $99.00
      interval: "month",
      productId: "prod_TesDFtBSqeaQL7",
    },
  },
} as const;

export const PRICING_TIERS = [
  {
    name: "Free",
    tier: "free",
    price: 0,
    interval: "forever",
    description: "Get started with basic AI features",
    features: [
      "100 credits/month",
      "Access to 5 AI systems",
      "Basic multi-agent support",
      "Community support",
      "Browser AI",
      "Basic analytics",
    ],
    popular: false,
    priceId: null,
  },
  {
    name: "Pro",
    tier: "pro",
    price: 19,
    interval: "month",
    annualPrice: 182,
    description: "For power users and small teams",
    features: [
      "500 credits/month",
      "All 9 AI systems",
      "Full multi-agent orchestration",
      "Priority support",
      "Voice AI",
      "Advanced analytics",
      "Knowledge graphs",
      "Custom agents",
    ],
    popular: true,
    priceId: "price_1ShYSY2MfT7Ozvjx6cXRwG9P",
    annualPriceId: "price_1ShYSa2MfT7OzvjxBRe5TZTb",
  },
  {
    name: "Enterprise",
    tier: "enterprise",
    price: 99,
    interval: "month",
    description: "For organizations with advanced needs",
    features: [
      "Unlimited credits",
      "All Pro features",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Team management",
      "API access",
      "White-label options",
    ],
    popular: false,
    priceId: "price_1ShYSc2MfT7OzvjxF6wCMyax",
  },
] as const;
