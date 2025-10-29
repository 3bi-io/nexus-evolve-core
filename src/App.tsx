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
import Capabilities from "./pages/Capabilities";
import Evolution from "./pages/Evolution";
import SuperAdmin from "./pages/SuperAdmin";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";

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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Onboarding />
            <BrowserRouter>
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
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <SuperAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route path="/pricing" element={<Pricing />} />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
