import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Onboarding } from "@/components/Onboarding";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import ProblemSolver from "./pages/ProblemSolver";
import Analytics from "./pages/Analytics";
import { CommandPalette } from "./components/onboarding/CommandPalette";
import { KeyboardShortcutsDialog } from "./components/onboarding/KeyboardShortcutsDialog";
import { useGlobalShortcuts } from "./hooks/useKeyboardShortcuts";
import { useReferralProcessor } from "./hooks/useReferralProcessor";
import { useReferralConversion } from "./hooks/useReferralConversion";
import { SelfLearningBadge } from "./components/SelfLearningBadge";
import Capabilities from "./pages/Capabilities";
import Evolution from "./pages/Evolution";
import SuperAdmin from "./pages/SuperAdmin";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import Achievements from "./pages/Achievements";
import Referrals from "./pages/Referrals";
import SocialIntelligence from "./pages/SocialIntelligence";
import AgentStudio from "./pages/AgentStudio";
import AgentMarketplace from "./pages/AgentMarketplace";
import Integrations from "./pages/Integrations";
import MultimodalStudio from "./pages/MultimodalStudio";
import VoiceAgent from "./pages/VoiceAgent";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

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
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/chat" element={<Index />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
  );
};

const AppContent = () => {
  return (
    <>
      <Onboarding />
      <SelfLearningBadge />
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
  </ErrorBoundary>
);

export default App;
