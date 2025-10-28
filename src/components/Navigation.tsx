import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Network, Brain, Zap, TrendingUp, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Navigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
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
          </div>
          <Button onClick={signOut} variant="ghost" className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};
