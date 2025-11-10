import "./App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingPage } from "@/components/layout/LoadingPage";
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useReferralProcessor } from "@/hooks/useReferralProcessor";
import { useReferralConversion } from "@/hooks/useReferralConversion";
import { MobileOnboarding } from "@/components/mobile/MobileOnboarding";
import { InstallPrompt } from "@/components/mobile/InstallPrompt";

// Lazy load pages for better performance and code splitting
const Index = lazy(() => import("./pages/Index"));
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const About = lazy(() => import("./pages/About"));
const Features = lazy(() => import("./pages/Features"));
const Solutions = lazy(() => import("./pages/Solutions"));
const Contact = lazy(() => import("./pages/Contact"));
const Security = lazy(() => import("./pages/Security"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Analytics = lazy(() => import("./pages/Analytics"));
const LLMAnalytics = lazy(() => import("./pages/LLMAnalytics"));
const SuperAdmin = lazy(() => import("./pages/SuperAdmin"));
const ProblemSolver = lazy(() => import("./pages/ProblemSolver"));
const Evolution = lazy(() => import("./pages/Evolution"));
const AGIDashboard = lazy(() => import("./pages/AGIDashboard"));
const Referrals = lazy(() => import("./pages/Referrals"));
const Integrations = lazy(() => import("./pages/Integrations"));
const UsageAnalytics = lazy(() => import("./pages/UsageAnalytics"));
const SocialIntelligence = lazy(() => import("./pages/SocialIntelligence"));
const AgentMarketplace = lazy(() => import("./pages/AgentMarketplace"));
const AgentStudio = lazy(() => import("./pages/AgentStudio"));
const AgentRevenue = lazy(() => import("./pages/AgentRevenue"));
const AgentExecutor = lazy(() => import("./pages/AgentExecutor"));
const AgentAnalytics = lazy(() => import("./pages/AgentAnalytics"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const AdvancedAI = lazy(() => import("./pages/AdvancedAI"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const KnowledgeGraph = lazy(() => import("./pages/KnowledgeGraph"));
const MemoryGraph = lazy(() => import("./pages/MemoryGraph"));
const Capabilities = lazy(() => import("./pages/Capabilities"));
const GettingStarted = lazy(() => import("./pages/GettingStarted"));
const MultimodalStudio = lazy(() => import("./pages/MultimodalStudio"));
const VoiceAgent = lazy(() => import("./pages/VoiceAgent"));
const VoiceAgentManager = lazy(() => import("./pages/VoiceAgentManager"));
const ModelComparison = lazy(() => import("./pages/ModelComparison"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
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
const PlatformOptimizer = lazy(() => import("./pages/PlatformOptimizer"));
const XAIStudio = lazy(() => import("./pages/XAIStudio"));
const XAIDashboard = lazy(() => import("./pages/XAIDashboard"));
const XAIAnalytics = lazy(() => import("./pages/XAIAnalytics"));
const AutomationHub = lazy(() => import("./pages/AutomationHub"));
const Install = lazy(() => import("./pages/Install"));

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
          <Route path="/chat" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/security" element={<Security />} />
          <Route path="/install" element={<Install />} />
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
            path="/memory-graph"
            element={
              <ProtectedRoute>
                <MemoryGraph />
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
            path="/problem-solver"
            element={
              <ProtectedRoute>
                <ProblemSolver />
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
            path="/agi-dashboard"
            element={
              <ProtectedRoute>
                <AGIDashboard />
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
          <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/super-admin" element={<Navigate to="/admin/overview" replace />} />
          <Route
            path="/admin/:section"
            element={
              <ProtectedRoute>
                <SuperAdmin />
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
            path="/integrations"
            element={
              <ProtectedRoute>
                <Integrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usage-analytics"
            element={
              <ProtectedRoute>
                <UsageAnalytics />
              </ProtectedRoute>
            }
          />
          <Route path="/social-intelligence" element={
            <ProtectedRoute>
              <SocialIntelligence />
            </ProtectedRoute>
          } />
          <Route path="/xai-studio" element={
            <ProtectedRoute>
              <XAIStudio />
            </ProtectedRoute>
          } />
          <Route path="/xai-dashboard" element={
            <ProtectedRoute>
              <XAIDashboard />
            </ProtectedRoute>
          } />
          <Route path="/xai-analytics" element={
            <ProtectedRoute>
              <XAIAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/automation-hub" element={
            <ProtectedRoute>
              <AutomationHub />
            </ProtectedRoute>
          } />
          <Route path="/agent-marketplace" element={<AgentMarketplace />} />
          <Route path="/voice-agent" element={<VoiceAgent />} />
          <Route
            path="/voice-agent-manager"
            element={
              <ProtectedRoute>
                <VoiceAgentManager />
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
            path="/agent-studio/edit/:agentId"
            element={
              <ProtectedRoute>
                <AgentStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent-executor/:agentId"
            element={
              <ProtectedRoute>
                <AgentExecutor />
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
          <Route
            path="/agent-analytics/:agentId"
            element={
              <ProtectedRoute>
                <AgentAnalytics />
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
            path="/advanced-ai"
            element={
              <ProtectedRoute>
                <AdvancedAI />
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
            path="/webhooks"
            element={
              <ProtectedRoute>
                <Webhooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/multimodal-studio"
            element={
              <ProtectedRoute>
                <MultimodalStudio />
              </ProtectedRoute>
            }
          />
          <Route path="/model-comparison" element={<ModelComparison />} />
          <Route path="/sitemap" element={<Sitemap />} />
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
          <Route
            path="/platform-optimizer"
            element={
              <ProtectedRoute>
                <PlatformOptimizer />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="top-center" />
    </>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <BrowserRouter>
                <MobileOnboarding />
                <InstallPrompt />
                <RoutesWithShortcuts />
              </BrowserRouter>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
