import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Onboarding } from "@/components/Onboarding";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { NavigationNew as Navigation } from "@/components/NavigationNew";
import { InstallPrompt } from "@/components/mobile/InstallPrompt";
import { ConnectionStatus } from "@/components/mobile/ConnectionStatus";
import { CommandPalette } from "./components/onboarding/CommandPalette";
import { KeyboardShortcutsDialog } from "./components/onboarding/KeyboardShortcutsDialog";
import { useGlobalShortcuts } from "./hooks/useKeyboardShortcuts";
import { useReferralProcessor } from "./hooks/useReferralProcessor";
import { useReferralConversion } from "./hooks/useReferralConversion";
import { SelfLearningBadge } from "./components/SelfLearningBadge";
import { lazy, Suspense } from "react";
import { LoadingPage } from "@/components/layout/LoadingPage";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import GettingStarted from "./pages/GettingStarted";
import Account from "./pages/Account";

// Lazy load heavy pages for better performance
const Analytics = lazy(() => import("./pages/Analytics"));
const LLMAnalytics = lazy(() => import("./pages/LLMAnalytics"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const KnowledgeGraph = lazy(() => import("./pages/KnowledgeGraph"));
const ProblemSolver = lazy(() => import("./pages/ProblemSolver"));
const Capabilities = lazy(() => import("./pages/Capabilities"));
const Evolution = lazy(() => import("./pages/Evolution"));
const SuperAdmin = lazy(() => import("./pages/SuperAdmin"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Referrals = lazy(() => import("./pages/Referrals"));
const SocialIntelligence = lazy(() => import("./pages/SocialIntelligence"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const AgentStudio = lazy(() => import("./pages/AgentStudio"));
const AgentMarketplace = lazy(() => import("./pages/AgentMarketplace"));
const AgentRevenue = lazy(() => import("./pages/AgentRevenue"));
const Integrations = lazy(() => import("./pages/Integrations"));
const AdvancedAI = lazy(() => import("./pages/AdvancedAI"));
const MultimodalStudio = lazy(() => import("./pages/MultimodalStudio"));
const VoiceAgent = lazy(() => import("./pages/VoiceAgent"));
const ModelComparison = lazy(() => import("./pages/ModelComparison"));
const BrowserAI = lazy(() => import("./pages/BrowserAI"));
const AIHub = lazy(() => import("./pages/AIHub"));
const AdvancedBrowserAI = lazy(() => import("./pages/AdvancedBrowserAI"));
const RouterDashboard = lazy(() => import("./pages/RouterDashboard"));
const EnterpriseRouter = lazy(() => import("./pages/EnterpriseRouter"));
const UnifiedRouterDemo = lazy(() => import("./pages/UnifiedRouterDemo"));
const Collaboration = lazy(() => import("./pages/Collaboration"));
const Teams = lazy(() => import("./pages/Teams"));
const APIAccess = lazy(() => import("./pages/APIAccess"));
const Webhooks = lazy(() => import("./pages/Webhooks"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const RoutesWithShortcuts = () => {
  useGlobalShortcuts();
  useReferralProcessor(); // Process referral codes after signup
  useReferralConversion(); // Track conversion after 3+ interactions
  return (
    <>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/chat" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge-graph"
            element={
              <ProtectedRoute>
                <KnowledgeGraph />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problem-solver"
            element={
              <ProtectedRoute>
                <ProblemSolver />
              </ProtectedRoute>
            }
          />
          <Route
            path="/capabilities"
            element={
              <ProtectedRoute>
                <Capabilities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evolution"
            element={
              <ProtectedRoute>
                <Evolution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/llm-analytics"
            element={
              <ProtectedRoute>
                <LLMAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <SuperAdmin />
              </ProtectedRoute>
            }
          />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <Referrals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/social-intelligence"
            element={
              <ProtectedRoute>
                <SocialIntelligence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent-studio"
            element={
              <ProtectedRoute>
                <AgentStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent-marketplace"
            element={
              <ProtectedRoute>
                <AgentMarketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/integrations"
            element={
              <ProtectedRoute>
                <Integrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advanced-ai"
            element={
              <ProtectedRoute>
                <AdvancedAI />
              </ProtectedRoute>
            }
          />
          <Route
            path="/multimodal"
            element={
              <ProtectedRoute>
                <MultimodalStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voice-agent"
            element={
              <ProtectedRoute>
                <VoiceAgent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-health"
            element={
              <ProtectedRoute>
                <SystemHealth />
              </ProtectedRoute>
            }
          />
          <Route
            path="/model-comparison"
            element={
              <ProtectedRoute>
                <ModelComparison />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browser-ai"
            element={
              <ProtectedRoute>
                <BrowserAI />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-hub"
            element={
              <ProtectedRoute>
                <AIHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advanced-browser-ai"
            element={
              <ProtectedRoute>
                <AdvancedBrowserAI />
              </ProtectedRoute>
            }
          />
          <Route
            path="/router-dashboard"
            element={
              <ProtectedRoute>
                <RouterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enterprise-router"
            element={
              <ProtectedRoute>
                <EnterpriseRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unified-router"
            element={
              <ProtectedRoute>
                <UnifiedRouterDemo />
              </ProtectedRoute>
            }
          />
          <Route path="/getting-started" element={<GettingStarted />} />
          <Route
            path="/collaboration"
            element={
              <ProtectedRoute>
                <Collaboration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/api-access"
            element={
              <ProtectedRoute>
                <APIAccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advanced-analytics"
            element={
              <ProtectedRoute>
                <AdvancedAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/webhooks"
            element={
              <ProtectedRoute>
                <Webhooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent-revenue"
            element={
              <ProtectedRoute>
                <AgentRevenue />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const AppContent = () => {
  return (
    <>
      <Onboarding />
      <SelfLearningBadge />
      <InstallPrompt />
      <ConnectionStatus />
      <BrowserRouter>
        <CommandPalette />
        <KeyboardShortcutsDialog />
        <RoutesWithShortcuts />
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
