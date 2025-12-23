import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { TierName, TIERS, FEATURE_TIERS } from "@/config/tiers";

interface UseFeatureAccessReturn {
  canAccess: boolean;
  requiredTier: TierName | null;
  currentTier: TierName;
  upgradeMessage: string;
}

export function useFeatureAccess(feature: string): UseFeatureAccessReturn {
  const { tier, canAccess } = useSubscriptionContext();
  
  const hasAccess = canAccess(feature);
  const allowedTiers = FEATURE_TIERS[feature];
  
  // Find the minimum required tier
  let requiredTier: TierName | null = null;
  if (allowedTiers && !hasAccess) {
    // Get the "cheapest" tier that has access
    const tierOrder: TierName[] = ["starter", "professional", "enterprise"];
    requiredTier = tierOrder.find(t => allowedTiers.includes(t)) || null;
  }

  const upgradeMessage = requiredTier
    ? `Upgrade to ${TIERS[requiredTier].displayName} to unlock this feature`
    : "";

  return {
    canAccess: hasAccess,
    requiredTier,
    currentTier: tier,
    upgradeMessage,
  };
}

// Hook for checking multiple features at once
export function useMultipleFeatureAccess(features: string[]): Record<string, UseFeatureAccessReturn> {
  const { tier, canAccess } = useSubscriptionContext();
  
  const results: Record<string, UseFeatureAccessReturn> = {};
  
  for (const feature of features) {
    const hasAccess = canAccess(feature);
    const allowedTiers = FEATURE_TIERS[feature];
    
    let requiredTier: TierName | null = null;
    if (allowedTiers && !hasAccess) {
      const tierOrder: TierName[] = ["starter", "professional", "enterprise"];
      requiredTier = tierOrder.find(t => allowedTiers.includes(t)) || null;
    }

    results[feature] = {
      canAccess: hasAccess,
      requiredTier,
      currentTier: tier,
      upgradeMessage: requiredTier
        ? `Upgrade to ${TIERS[requiredTier].displayName} to unlock this feature`
        : "",
    };
  }

  return results;
}
