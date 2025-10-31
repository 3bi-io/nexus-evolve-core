import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Network, Brain, Zap, TrendingUp, LogOut, Shield, Trophy, BarChart3, Keyboard, Sparkles, Store, Phone, Plug, Cpu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Navigation = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-card hidden md:block">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 lg:gap-4 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            <Link to="/chat" className="flex items-center gap-2 mr-2 lg:mr-4 flex-shrink-0">
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg hidden lg:inline">Oneiros.me</span>
            </Link>
            <Link to="/chat" className="flex-shrink-0">
              <Button
                variant={isActive("/chat") ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden xl:inline">Chat</span>
              </Button>
            </Link>
            {user && (
              <>
                <Link to="/knowledge-graph" className="flex-shrink-0">
                  <Button
                    variant={isActive("/knowledge-graph") ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Network className="w-4 h-4" />
                    <span className="hidden xl:inline">Knowledge</span>
                  </Button>
                </Link>
                <Link to="/problem-solver" className="flex-shrink-0">
                  <Button
                    variant={isActive("/problem-solver") ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    <span className="hidden xl:inline">Solver</span>
                  </Button>
                </Link>
                <Link to="/analytics" className="flex-shrink-0">
                  <Button
                    variant={isActive("/analytics") ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden xl:inline">Analytics</span>
                  </Button>
                </Link>
                <Link to="/agent-marketplace" className="flex-shrink-0">
                  <Button
                    variant={isActive("/agent-marketplace") ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Store className="w-4 h-4" />
                    <span className="hidden xl:inline">Market</span>
                  </Button>
                </Link>
                <Link to="/voice-agent" className="flex-shrink-0">
                  <Button
                    variant={isActive("/voice-agent") ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden xl:inline">Voice AI</span>
                  </Button>
                </Link>
                <Link to="/integrations" className="flex-shrink-0">
                  <Button
                    variant={isActive("/integrations") ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Plug className="w-4 h-4" />
                    <span className="hidden xl:inline">Phase 2</span>
                  </Button>
                </Link>
                <Link to="/advanced-ai" className="flex-shrink-0">
                  <Button
                    variant={isActive("/advanced-ai") ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Cpu className="w-4 h-4" />
                    <span className="hidden xl:inline">Phase 3</span>
                  </Button>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="flex-shrink-0">
                <Button
                  variant={isActive("/admin") ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden xl:inline">Admin</span>
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.dispatchEvent(new CustomEvent('show-shortcuts'))}
                    className="hidden lg:flex"
                  >
                    <Keyboard className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keyboard shortcuts (Ctrl+/)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <CreditBalance />
            <ThemeToggle />
            {user ? (
              <Button onClick={signOut} variant="ghost" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2">
                  <span className="hidden lg:inline">Sign Up Free</span>
                  <span className="lg:hidden">Sign Up</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
