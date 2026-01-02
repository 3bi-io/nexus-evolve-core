// Unified tier configuration - Single source of truth for all subscription data
// This aligns with database subscription_tiers table

export type TierName = "starter" | "professional" | "enterprise";
export type BillingCycle = "monthly" | "yearly";

export interface TierConfig {
  name: TierName;
  displayName: string;
  monthlyPrice: number; // in cents
  yearlyPrice: number; // in cents
  credits: number;
  features: readonly string[];
  stripeProductId: string | null;
  stripePriceId: string | null;
  stripeAnnualPriceId?: string | null;
  popular?: boolean;
}

// These product/price IDs match what's in Stripe
export const STRIPE_PRODUCTS = {
  pro: "prod_TesCNFzJKIiWJy",
  proAnnual: "prod_TesDcc7CpEAPyA",
  enterprise: "prod_TesDFtBSqeaQL7",
} as const;

export const STRIPE_PRICES = {
  proMonthly: "price_1ShYSY2MfT7Ozvjx6cXRwG9P",
  proAnnual: "price_1ShYSa2MfT7OzvjxBRe5TZTb",
  enterprise: "price_1ShYSc2MfT7OzvjxF6wCMyax",
} as const;

// Map Stripe products to tier names (for edge functions)
export const STRIPE_PRODUCT_TO_TIER: Record<string, { tierName: TierName; credits: number; billingCycle: BillingCycle }> = {
  [STRIPE_PRODUCTS.pro]: { tierName: "professional", credits: 10000, billingCycle: "monthly" },
  [STRIPE_PRODUCTS.proAnnual]: { tierName: "professional", credits: 10000, billingCycle: "yearly" },
  [STRIPE_PRODUCTS.enterprise]: { tierName: "enterprise", credits: 999999, billingCycle: "monthly" },
};

// Full tier configurations
export const TIERS: Record<TierName, TierConfig> = {
  starter: {
    name: "starter",
    displayName: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 500,
    features: [
      "500 credits/month",
      "Access to 5 AI systems",
      "Basic multi-agent support",
      "Community support",
      "Browser AI",
      "Basic analytics",
    ],
    stripeProductId: null,
    stripePriceId: null,
    popular: false,
  },
  professional: {
    name: "professional",
    displayName: "Pro",
    monthlyPrice: 2900, // $29
    yearlyPrice: 27800, // $278/year (~$23/mo, save ~20%)
    credits: 10000,
    features: [
      "10,000 credits/month",
      "All 9 AI systems",
      "Full multi-agent orchestration",
      "Priority support",
      "Voice AI",
      "Advanced analytics",
      "Knowledge graphs",
      "Custom agents",
    ],
    stripeProductId: STRIPE_PRODUCTS.pro,
    stripePriceId: STRIPE_PRICES.proMonthly,
    stripeAnnualPriceId: STRIPE_PRICES.proAnnual,
    popular: true,
  },
  enterprise: {
    name: "enterprise",
    displayName: "Enterprise",
    monthlyPrice: 9900, // $99
    yearlyPrice: 99000, // $990/year
    credits: 999999, // Effectively unlimited
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
    stripeProductId: STRIPE_PRODUCTS.enterprise,
    stripePriceId: STRIPE_PRICES.enterprise,
    popular: false,
  },
};

// Helper to get tier by Stripe product ID
export function getTierByProductId(productId: string): TierConfig | null {
  const mapping = STRIPE_PRODUCT_TO_TIER[productId];
  if (!mapping) return null;
  return TIERS[mapping.tierName];
}

// Helper to format credits display
export function formatCredits(credits: number): string {
  if (credits >= 999999) return "Unlimited";
  if (credits >= 1000) return `${(credits / 1000).toFixed(0)}k`;
  return credits.toString();
}

// Helper to check if tier has feature
export function tierHasFeature(tierName: TierName, feature: string): boolean {
  const tier = TIERS[tierName];
  return tier?.features.some(f => f.toLowerCase().includes(feature.toLowerCase())) ?? false;
}

// Feature gating configuration
export const FEATURE_TIERS: Record<string, TierName[]> = {
  voiceAI: ["professional", "enterprise"],
  customAgents: ["professional", "enterprise"],
  knowledgeGraphs: ["professional", "enterprise"],
  automation: ["enterprise"],
  apiAccess: ["enterprise"],
  teamManagement: ["enterprise"],
  dedicatedSupport: ["enterprise"],
  slaGuarantee: ["enterprise"],
};

// Check if user's tier can access a feature
export function canAccessFeature(userTier: TierName, feature: string): boolean {
  const allowedTiers = FEATURE_TIERS[feature];
  if (!allowedTiers) return true; // Feature not restricted
  return allowedTiers.includes(userTier);
}

// Get all tiers as array for pricing display
export const TIER_LIST = Object.values(TIERS);
