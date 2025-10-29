import { useLocation, useNavigate } from "react-router-dom";
import { Home, Network, Brain, Trophy, User, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useMobile";

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { light } = useHaptics();

  const navItems = [
    { icon: Home, label: "Chat", path: "/chat" },
    { icon: Network, label: "Knowledge", path: "/knowledge-graph" },
    { icon: Brain, label: "Solver", path: "/problem-solver" },
    { icon: BarChart3, label: "Stats", path: "/analytics" },
    { icon: User, label: "Account", path: "/account" },
  ];

  const handleNavigation = (path: string) => {
    light();
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground active:bg-muted"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "animate-bounce-subtle")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
