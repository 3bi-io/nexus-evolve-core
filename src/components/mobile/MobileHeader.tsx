import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { useHaptics, useMobile } from "@/hooks/useMobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
}

export function MobileHeader({ 
  title, 
  showBack = false, 
  showMenu = true 
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { light } = useHaptics();
  const { isOled } = useMobile();
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

  const handleBack = () => {
    light();
    navigate(-1);
  };

  return (
    <header className={`sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b mobile-strong-border safe-top md:hidden ${isOled ? 'dark:oled:oled-card' : ''}`}>
      <div className="flex items-center justify-between px-3 py-2.5 gap-2 min-h-[56px]">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="touch-active transition-transform h-10 w-10 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {title && (
            <h1 className="text-base font-semibold truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <CreditBalance />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const html = document.documentElement;
              html.classList.toggle('dark');
            }}
            className="h-10 w-10 touch-active"
            aria-label="Toggle theme"
          >
            <span className="sr-only">Toggle theme</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path className="dark:hidden" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              <path className="hidden dark:block" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </Button>
          
          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="touch-active transition-transform h-10 w-10"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-[70vh] overflow-y-auto bg-card border-border z-50">
                <DropdownMenuLabel>AI Studio</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/agent-studio")}>
                  Agent Studio
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/multimodal-studio")}>
                  Multimodal Studio
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/problem-solver")}>
                  Problem Solver
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/ai-hub")}>
                  AI Hub
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/browser-ai")}>
                  Browser AI
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/advanced-browser-ai")}>
                  Advanced Browser AI
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/voice-agent")}>
                  Voice Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/voice-agent-manager")}>
                  Voice Agent Manager
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/model-comparison")}>
                  Model Comparison
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Intelligence</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/knowledge-graph")}>
                  Knowledge Graph
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/memory-graph")}>
                  Memory Graph
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/analytics")}>
                  Analytics Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/llm-analytics")}>
                  LLM Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/usage-analytics")}>
                  Usage Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/advanced-analytics")}>
                  Advanced Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/social-intelligence")}>
                  Social Intelligence
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/unified-router")}>
                  Unified Router
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/router-dashboard")}>
                  Router Metrics
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Agents</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/agent-marketplace")}>
                  Agent Marketplace
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/agent-revenue")}>
                  Revenue Dashboard
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Enterprise</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/teams")}>
                  Teams
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/collaboration")}>
                  Collaboration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/api-access")}>
                  API Access
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/webhooks")}>
                  Webhooks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/integrations")}>
                  Integrations
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>System</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/system-health")}>
                  System Health
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/evolution")}>
                  Evolution System
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/agi-dashboard")}>
                  AGI Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/capabilities")}>
                  Capabilities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/achievements")}>
                  Achievements
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/referrals")}>
                  Referrals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/advanced-ai")}>
                  Advanced AI
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/enterprise-router")}>
                  Enterprise Router
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/getting-started")}>
                  Getting Started
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate("/admin")}
                      className="text-destructive font-semibold"
                    >
                      🛡️ Super Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
