import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Network,
  Brain,
  LogOut,
  Shield,
  Trophy,
  BarChart3,
  Keyboard,
  Store,
  Phone,
  Plug,
  Cpu,
  Layers,
  Activity,
  Settings,
  Sparkles,
  ChevronDown,
  Zap,
  Bot,
  Users,
  BookOpen,
  Code,
  GitBranch,
  TestTube,
  Palette,
  Scale,
  TrendingUp,
  FileText,
  Gauge,
  Calendar,
  DollarSign,
  Gift,
  Rocket,
  Target,
  Workflow,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreditBalance } from "@/components/pricing/CreditBalance";
import { UserAccountMenu } from "@/components/UserAccountMenu";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useSecretValidation } from "@/hooks/useSecretValidation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const NavigationNew = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { hasIssues, criticalIssues } = useSecretValidation();

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
    <nav className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/chat" className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Brain className="w-7 h-7 text-primary" />
              <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="font-bold text-lg leading-tight">Oneiros</span>
              <span className="text-xs text-muted-foreground leading-tight">AI Platform</span>
            </div>
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center gap-1 lg:gap-2 flex-1 justify-center">
            {/* Core Features */}
            <Link to="/chat">
              <Button variant={isActive("/chat") ? "default" : "ghost"} size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden xl:inline">Chat</span>
              </Button>
            </Link>

            <Link to="/pricing">
              <Button variant={isActive("/pricing") ? "default" : "ghost"} size="sm" className="gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden xl:inline">Pricing</span>
              </Button>
            </Link>

            {user && (
              <>
                {/* AI Studio Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Palette className="w-4 h-4" />
                      <span className="hidden xl:inline">AI Studio</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Create & Build</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/agent-studio" className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        Agent Studio
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/multimodal-studio" className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Multimodal Studio
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/problem-solver" className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Problem Solver
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>AI Tools</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/ai-hub" className="flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        AI Hub
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/browser-ai" className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Browser AI
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/advanced-browser-ai" className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Advanced Browser AI
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/voice-agent" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Voice Agent
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/model-comparison" className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Model Comparison
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Intelligence Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Network className="w-4 h-4" />
                      <span className="hidden xl:inline">Intelligence</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Knowledge</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/knowledge-graph" className="flex items-center gap-2">
                        <Network className="w-4 h-4" />
                        Knowledge Graph
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/memory-graph" className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Memory Graph
                        <Badge variant="secondary" className="ml-auto text-xs">New</Badge>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Analytics</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/analytics" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Analytics Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/llm-analytics" className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        LLM Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/usage-analytics" className="flex items-center gap-2">
                        <Gauge className="w-4 h-4" />
                        Usage Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/advanced-analytics" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Advanced Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/social-intelligence" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Social Intelligence
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Routing</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/unified-router" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Unified Router
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/router-dashboard" className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Router Metrics
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Agents Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Bot className="w-4 h-4" />
                      <span className="hidden xl:inline">Agents</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/agent-marketplace" className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        Marketplace
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/agent-studio" className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Create Agent
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/agent-revenue" className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Revenue Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Enterprise Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Users className="w-4 h-4" />
                      <span className="hidden xl:inline">Enterprise</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/teams" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Teams
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/collaboration" className="flex items-center gap-2">
                        <Network className="w-4 h-4" />
                        Collaboration
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/api-access" className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        API Access
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/webhooks" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Webhooks
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/integrations" className="flex items-center gap-2">
                        <Plug className="w-4 h-4" />
                        Integrations
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* System Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1 relative">
                      <Settings className="w-4 h-4" />
                      <span className="hidden xl:inline">System</span>
                      <ChevronDown className="w-3 h-3" />
                      {hasIssues && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 h-4 text-xs min-w-4">
                          {criticalIssues || "!"}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/system-health" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        System Health
                        {hasIssues && (
                          <Badge variant="destructive" className="ml-auto">
                            {criticalIssues}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/evolution" className="flex items-center gap-2">
                        <Rocket className="w-4 h-4" />
                        Evolution System
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/agi-dashboard" className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        AGI Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/capabilities" className="flex items-center gap-2">
                        <Workflow className="w-4 h-4" />
                        Capabilities
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/achievements" className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Achievements
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/referrals" className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Referrals
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/advanced-ai" className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        Advanced AI
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/enterprise-router" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Enterprise Router
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/getting-started" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Getting Started
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-destructive" />
                            <span className="text-destructive font-semibold">Super Admin</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.dispatchEvent(new CustomEvent("show-shortcuts"))}
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

            {user && <CreditBalance />}
            <ThemeToggle />
            
            {user ? (
              <UserAccountMenu />
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2">
                  <span>Sign Up Free</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
