// Stripe product and price configuration for Oneiros
// These must align with the tiers.ts configuration

import { TIERS, STRIPE_PRODUCTS, STRIPE_PRICES } from "./tiers";

export const STRIPE_CONFIG = {
  products: {
    pro: {
      id: STRIPE_PRODUCTS.pro,
      name: "Oneiros Pro",
      description: `${TIERS.professional.credits.toLocaleString()} credits/month, all 9 AI systems, multi-agent orchestration, priority support`,
    },
    proAnnual: {
      id: STRIPE_PRODUCTS.proAnnual,
      name: "Oneiros Pro Annual",
      description: `${TIERS.professional.credits.toLocaleString()} credits/month, all 9 AI systems, multi-agent orchestration, priority support - Annual billing (save 20%)`,
    },
    enterprise: {
      id: STRIPE_PRODUCTS.enterprise,
      name: "Oneiros Enterprise",
      description: "Unlimited credits, dedicated support, custom integrations, SLA guarantee",
    },
  },
  prices: {
    proMonthly: {
      id: STRIPE_PRICES.proMonthly,
      amount: TIERS.professional.monthlyPrice,
      interval: "month",
      productId: STRIPE_PRODUCTS.pro,
    },
    proAnnual: {
      id: STRIPE_PRICES.proAnnual,
      amount: TIERS.professional.yearlyPrice,
      interval: "year",
      productId: STRIPE_PRODUCTS.proAnnual,
    },
    enterprise: {
      id: STRIPE_PRICES.enterprise,
      amount: TIERS.enterprise.monthlyPrice,
      interval: "month",
      productId: STRIPE_PRODUCTS.enterprise,
    },
  },
} as const;

// Pricing tiers for the pricing page - derived from unified TIERS config
export const PRICING_TIERS = [
  {
    name: TIERS.starter.displayName,
    tier: "free" as const, // For backward compatibility with PricingCard
    price: 0,
    interval: "forever" as const,
    description: "Get started with basic AI features",
    features: TIERS.starter.features,
    popular: false,
    priceId: null,
  },
  {
    name: TIERS.professional.displayName,
    tier: "pro" as const, // For backward compatibility with PricingCard
    price: TIERS.professional.monthlyPrice,
    interval: "month" as const,
    annualPrice: TIERS.professional.yearlyPrice,
    description: "For power users and small teams",
    features: TIERS.professional.features,
    popular: true,
    priceId: STRIPE_PRICES.proMonthly,
    annualPriceId: STRIPE_PRICES.proAnnual,
  },
  {
    name: TIERS.enterprise.displayName,
    tier: "enterprise" as const,
    price: TIERS.enterprise.monthlyPrice,
    interval: "month" as const,
    description: "For organizations with advanced needs",
    features: TIERS.enterprise.features,
    popular: false,
    priceId: STRIPE_PRICES.enterprise,
  },
] as const;
