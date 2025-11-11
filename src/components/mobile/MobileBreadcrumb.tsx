import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const routeLabels: Record<string, string> = {
  chat: "Chat",
  account: "Account",
  pricing: "Pricing",
  "knowledge-graph": "Knowledge",
  "memory-graph": "Memory",
  capabilities: "Capabilities",
  "problem-solver": "Solver",
  evolution: "Evolution",
  "agi-dashboard": "AGI",
  achievements: "Achievements",
  analytics: "Analytics",
  "llm-analytics": "LLM Analytics",
  admin: "Admin",
  referrals: "Referrals",
  integrations: "Integrations",
  "usage-analytics": "Usage",
  "social-intelligence": "Social",
  "agent-marketplace": "Marketplace",
  "voice-agent": "Voice",
  "agent-studio": "Studio",
  "agent-executor": "Executor",
  "agent-revenue": "Revenue",
  "advanced-analytics": "Advanced",
  "advanced-ai": "Advanced AI",
  "system-health": "Health",
  collaboration: "Collab",
  teams: "Teams",
  "api-access": "API",
  webhooks: "Webhooks",
  "multimodal-studio": "Multimodal",
  "model-comparison": "Models",
  "browser-ai": "Browser AI",
  "ai-hub": "AI Hub",
  "advanced-browser-ai": "Advanced",
  "router-dashboard": "Router",
  "enterprise-router": "Enterprise",
  "unified-router": "Unified",
  "getting-started": "Start",
  "xai-dashboard": "XAI",
  "xai-studio": "XAI Studio",
  "xai-analytics": "XAI Analytics",
  "automation-hub": "Automation",
  install: "Install",
  features: "Features",
  solutions: "Solutions",
  about: "About",
  contact: "Contact",
  security: "Security",
  auth: "Sign In",
  // Admin subsections
  overview: "Overview",
  users: "Users",
  agents: "Agents",
  data: "Data",
  financial: "Financial",
  config: "Config",
  announcements: "News",
  devtools: "Dev Tools",
  "audit-log": "Audit",
  "user-analytics": "Analytics",
};

interface MobileBreadcrumbProps {
  className?: string;
  showBackButton?: boolean;
}

export function MobileBreadcrumb({ className, showBackButton = true }: MobileBreadcrumbProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Don't show on landing or home
  if (pathSegments.length === 0 || pathSegments[0] === "landing" || location.pathname === "/") {
    return null;
  }

  const hasBack = pathSegments.length > 1 || location.pathname !== "/chat";

  // Get breadcrumb items
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = routeLabels[segment] || segment.replace(/-/g, " ");
    return { path, label, segment };
  });

  // For mobile, show max 2 items: second-to-last and last
  // If more than 2, show a dropdown for the rest
  const visibleItems = breadcrumbItems.slice(-2);
  const hiddenItems = breadcrumbItems.slice(0, -2);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/chat");
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-1 px-3 py-2 bg-background/95 backdrop-blur-sm border-b border-border",
      "sticky top-0 z-30",
      className
    )}>
      {/* Back Button */}
      {showBackButton && hasBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="h-9 w-9 p-0 touch-active"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      {/* Home Icon */}
      <Link
        to="/chat"
        className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors touch-active"
        aria-label="Home"
      >
        <Home className="w-4 h-4 text-muted-foreground" />
      </Link>

      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
        {/* Hidden Items Dropdown */}
        {hiddenItems.length > 0 && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2 touch-active"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {hiddenItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className="flex items-center gap-2 capitalize"
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </>
        )}

        {/* Visible Breadcrumb Items */}
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          
          return (
            <div key={item.path} className="flex items-center gap-1 min-w-0">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              
              {isLast ? (
                <span className="text-sm font-medium truncate capitalize px-2">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate capitalize px-2 py-1 rounded-md hover:bg-accent touch-active"
                >
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
