import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Network, Brain, Zap, TrendingUp, LogOut, Shield, Trophy, BarChart3, Keyboard } from "lucide-react";
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
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/chat" className="flex items-center gap-2 mr-4">
              <Brain className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg hidden sm:inline">Oneiros.me</span>
            </Link>
            <Link to="/chat">
              <Button
                variant={isActive("/chat") ? "default" : "ghost"}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </Button>
            </Link>
            {user && (
              <>
                <Link to="/knowledge-graph">
                  <Button
                    variant={isActive("/knowledge-graph") ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <Network className="w-4 h-4" />
                    Knowledge
                  </Button>
                </Link>
                <Link to="/problem-solver">
                  <Button
                    variant={isActive("/problem-solver") ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    Solver
                  </Button>
                </Link>
                <Link to="/capabilities">
                  <Button
                    variant={isActive("/capabilities") ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Capabilities
                  </Button>
                </Link>
                <Link to="/evolution">
                  <Button
                    variant={isActive("/evolution") ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Evolution
                  </Button>
                </Link>
                <Link to="/achievements">
                  <Button
                    variant={isActive("/achievements") ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Achievements
                  </Button>
                </Link>

                <Link to="/analytics">
                  <Button
                    variant={isActive("/analytics") ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Button>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant={isActive("/admin") ? "default" : "ghost"}
                  className="gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.dispatchEvent(new CustomEvent('show-shortcuts'))}
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
              <Button onClick={signOut} variant="ghost" className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="gap-2">
                  Sign Up Free
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
