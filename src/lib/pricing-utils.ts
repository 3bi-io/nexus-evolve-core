// Phase 2.1: Utility for converting credits to AI interactions terminology

export const formatCreditsAsInteractions = (credits: number, isDaily = false): string => {
  if (credits >= 999999) return "Unlimited AI interactions";
  const unit = isDaily ? "day" : "month";
  return `${credits.toLocaleString()} AI interactions/${unit}`;
};

export const getInteractionLabel = (credits: number): string => {
  if (credits >= 999999) return "Unlimited";
  if (credits >= 10000) return `${(credits / 1000).toFixed(0)}K interactions`;
  return `${credits} interactions`;
};

export const FOUNDER_RATE_SLOTS = 100; // First 100 users get founder rate
export const FOUNDER_RATE_PRICE = 29;
export const STANDARD_PROFESSIONAL_PRICE = 49;
