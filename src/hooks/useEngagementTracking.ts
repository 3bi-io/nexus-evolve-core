/**
 * @deprecated Use useAnalytics instead
 * This file is kept for backward compatibility
 */
import { useAnalytics } from './useAnalytics';

export function useEngagementTracking() {
  const analytics = useAnalytics();
  
  return {
    metrics: analytics.engagementMetrics,
    trackMessage: analytics.trackMessage,
    shouldShowUpgradePrompt: analytics.shouldShowUpgradePrompt,
  };
}
