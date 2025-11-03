import { useLocation, useNavigate } from "react-router-dom";
import { Home, Store, BarChart3, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = user ? [
    { icon: Home, label: "Chat", path: "/" },
    { icon: Store, label: "Market", path: "/agent-marketplace" },
    { icon: Sparkles, label: "AGI", path: "/agi-dashboard" },
    { icon: BarChart3, label: "Stats", path: "/analytics" },
    { icon: User, label: "Account", path: "/account" },
  ] : [
    { icon: Home, label: "Home", path: "/" },
    { icon: Store, label: "Market", path: "/agent-marketplace" },
    { icon: Sparkles, label: "Pricing", path: "/pricing" },
    { icon: User, label: "Sign In", path: "/auth" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t mobile-strong-border safe-bottom md:hidden dark:oled:oled-card">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all",
                "min-w-[56px] min-h-[56px]", // Touch target
                "touch-active",
                isActive
                  ? "text-primary bg-primary/10 dark:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive && "scale-110"
              )} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
