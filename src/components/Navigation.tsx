import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Network, Brain, Zap, TrendingUp, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
              <span className="font-semibold text-lg hidden sm:inline">Self-Learning AI</span>
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
            <CreditBalance />
            <ThemeToggle />
            <Button onClick={signOut} variant="ghost" className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
