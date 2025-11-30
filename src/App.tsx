import "./App.css";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingPage } from "@/components/layout/LoadingPage";
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useReferralProcessor } from "@/hooks/useReferralProcessor";
import { useReferralConversion } from "@/hooks/useReferralConversion";
import "@/lib/observability";
import "@/lib/security-honeypot";
import { MobileOnboarding } from "@/components/mobile/MobileOnboarding";
import { InstallPrompt } from "@/components/mobile/InstallPrompt";
import { InstallSuccessDialog } from "@/components/mobile/InstallSuccessDialog";

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
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const RoutesWithShortcuts = () => {
  useGlobalShortcuts();
  useReferralProcessor();
  useReferralConversion();
  return (
    <>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<Navigate to="/" replace />} />
          <Route path="/welcome" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
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
          <Route path="/account" element={<Account />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="/memory-graph" element={<MemoryGraph />} />
          <Route path="/capabilities" element={<Capabilities />} />
          <Route path="/problem-solver" element={<ProblemSolver />} />
          <Route path="/evolution" element={<Evolution />} />
          <Route path="/agi-dashboard" element={<AGIDashboard />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/llm-analytics" element={<LLMAnalytics />} />
          <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/super-admin" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/admin/:section" element={<SuperAdmin />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/usage-analytics" element={<UsageAnalytics />} />
          <Route path="/social-intelligence" element={<SocialIntelligence />} />
          <Route path="/xai-studio" element={<XAIStudio />} />
          <Route path="/xai-dashboard" element={<XAIDashboard />} />
          <Route path="/xai-analytics" element={<XAIAnalytics />} />
          <Route path="/automation-hub" element={<AutomationHub />} />
          <Route path="/agent-marketplace" element={<AgentMarketplace />} />
          <Route path="/voice-agent" element={<VoiceAgent />} />
          <Route path="/voice-agent-manager" element={<VoiceAgentManager />} />
          <Route path="/agent-studio" element={<AgentStudio />} />
          <Route path="/agent-studio/edit/:agentId" element={<AgentStudio />} />
          <Route path="/agent-executor/:agentId" element={<AgentExecutor />} />
          <Route path="/agent-revenue" element={<AgentRevenue />} />
          <Route path="/agent-analytics/:agentId" element={<AgentAnalytics />} />
          <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
          <Route path="/advanced-ai" element={<AdvancedAI />} />
          <Route path="/system-health" element={<SystemHealth />} />
          <Route path="/collaboration" element={<Collaboration />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/api-access" element={<APIAccess />} />
          <Route path="/webhooks" element={<Webhooks />} />
          <Route path="/multimodal-studio" element={<MultimodalStudio />} />
          <Route path="/model-comparison" element={<ModelComparison />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/browser-ai" element={<BrowserAI />} />
          <Route path="/ai-hub" element={<AIHub />} />
          <Route path="/advanced-browser-ai" element={<AdvancedBrowserAI />} />
          <Route path="/router-dashboard" element={<RouterDashboard />} />
          <Route path="/enterprise-router" element={<EnterpriseRouter />} />
          <Route path="/unified-router" element={<UnifiedRouterDemo />} />
          <Route path="/platform-optimizer" element={<PlatformOptimizer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="top-center" />
    </>
  );
};

// Initialize OLED mode as default for first-time visitors
function OLEDInitializer() {
  useEffect(() => {
    const hasOledPreference = localStorage.getItem('oled-mode');
    if (hasOledPreference === null) {
      // First-time visitor - enable OLED mode by default
      localStorage.setItem('oled-mode', 'true');
      document.documentElement.classList.add('oled');
    }
  }, []);
  return null;
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <OLEDInitializer />
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <BrowserRouter>
                <MobileOnboarding />
                <InstallPrompt />
                <InstallSuccessDialog />
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
