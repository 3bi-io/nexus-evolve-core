/**
 * Batch conversion script for updating pages to new layout system
 * 
 * Marketing/Public pages -> MarketingLayout
 * Authenticated/App pages -> AppLayout
 */

// Marketing pages (public-facing, use MarketingLayout)
export const marketingPages = [
  'GettingStarted',
  'Install',
  'Sitemap',
  'Security',
  'Capabilities',
];

// App pages (authenticated, use AppLayout)
export const appPages = [
  'AGIDashboard',
  'APIAccess',
  'Achievements',
  'AdvancedAI',
  'AdvancedAnalytics',
  'AdvancedBrowserAI',
  'AgentAnalytics',
  'AgentExecutor',
  'AgentRevenue',
  'AgentStudio',
  'AutomationHub',
  'BrowserAI',
  'Collaboration',
  'EnterpriseRouter',
  'Evolution',
  'Index',
  'Integrations',
  'KnowledgeGraph',
  'LLMAnalytics',
  'MemoryGraph',
  'ModelComparison',
  'MultimodalStudio',
  'NotFound',
  'PlatformOptimizer',
  'ProblemSolver',
  'Referrals',
  'RouterDashboard',
  'SocialIntelligence',
  'SuperAdmin',
  'SystemHealth',
  'Teams',
  'UnifiedRouterDemo',
  'UsageAnalytics',
  'VoiceAgent',
  'VoiceAgentManager',
  'Webhooks',
  'XAIAnalytics',
  'XAIStudio',
];

export const conversionInstructions = `
For each page:
1. Replace: import { PageLayout } from "@/components/layout/PageLayout";
   With: import { AppLayout } from "@/components/layout/AppLayout"; (or MarketingLayout)

2. Replace: <PageLayout ...props>
   With: <AppLayout title="PageName" showBottomNav> (or MarketingLayout title="PageName")

3. Replace: </PageLayout>
   With: </AppLayout> (or </MarketingLayout>)

4. Add title prop to layout component for analytics tracking

5. Replace custom loading states with standardized components:
   - <Skeleton> loops -> <PageLoading /> or <CardLoading />
   - Custom empty states -> <EmptyState icon={Icon} title="..." description="..." />
   - Custom error displays -> <ErrorState message="..." onRetry={...} />
`;
