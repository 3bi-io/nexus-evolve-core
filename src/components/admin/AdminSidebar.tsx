import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";
import {
  BarChart3,
  Users,
  Bot,
  Database,
  DollarSign,
  Settings,
  Shield,
  Megaphone,
  Code,
  Home,
  Activity,
  FileWarning,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface AdminSidebarProps {
  section: string;
  onSectionChange: (section: string) => void;
}

const sidebarSections = [
  { id: "overview", label: "System Overview", icon: Home, description: "Dashboard & stats" },
  { id: "user-analytics", label: "User Analytics", icon: TrendingUp, description: "Growth & retention" },
  { id: "agent-analytics", label: "Agent Analytics", icon: Activity, description: "Agent performance" },
  { id: "users", label: "User Management", icon: Users, description: "Manage users & roles" },
  { id: "agents", label: "Agent Management", icon: Bot, description: "Moderate agents" },
  { id: "data", label: "Data Management", icon: Database, description: "Knowledge & memory" },
  { id: "financial", label: "Financial", icon: DollarSign, description: "Revenue & credits" },
  { id: "config", label: "System Config", icon: Settings, description: "Feature flags" },
  { id: "security", label: "Security Center", icon: Shield, description: "Security & RLS" },
  { id: "announcements", label: "Announcements", icon: Megaphone, description: "System messages" },
  { id: "audit-log", label: "Audit Log", icon: FileWarning, description: "Admin actions" },
  { id: "devtools", label: "Dev Tools", icon: Code, description: "Developer utils" },
];

export function AdminSidebar({ section, onSectionChange }: AdminSidebarProps) {
  const { isMobile, isOled } = useMobile();
  const [isOpen, setIsOpen] = useState(false);

  const sidebarContent = (
    <div className={cn(
      "h-full flex flex-col",
      "bg-sidebar text-sidebar-foreground",
      isOled && "dark:bg-black"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 sm:p-6 border-b border-sidebar-border",
        "bg-[hsl(var(--admin-sidebar-header))]",
        "text-white"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">Super Admin</h2>
              <p className="text-xs text-white/80 hidden sm:block">System Management</p>
            </div>
          </div>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <ScrollArea className="flex-1">
        <div className="p-2 sm:p-3 space-y-1">
          {sidebarSections.map((item) => {
            const Icon = item.icon;
            const isActive = section === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-auto py-3 px-3 sm:py-4 sm:px-4",
                  "rounded-xl transition-all duration-200",
                  "min-h-[56px] sm:min-h-[64px]", // Touch targets
                  "touch-active", // Mobile feedback
                  isActive && [
                    "bg-[hsl(var(--admin-sidebar-active))]",
                    "text-primary font-semibold",
                    "shadow-sm border border-primary/20"
                  ],
                  !isActive && [
                    "hover:bg-[hsl(var(--admin-sidebar-hover))]",
                    "active:scale-[0.98]"
                  ]
                )}
                onClick={() => {
                  onSectionChange(item.id);
                  if (isMobile) setIsOpen(false);
                }}
              >
                <Icon className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="flex-1 text-left">
                  <div className="text-sm sm:text-base font-medium leading-tight">
                    {item.label}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
                    {item.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-sidebar-border safe-bottom">
        <Link to="/chat">
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"}
            className="w-full gap-2 min-h-[48px]"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to App</span>
          </Button>
        </Link>
      </div>
    </div>
  );

  // Mobile: Sheet/Drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile Trigger Button (Floating) */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "fixed bottom-20 left-4 z-50",
                "w-14 h-14 rounded-full shadow-lg",
                "bg-[hsl(var(--admin-sidebar-header))] text-white",
                "hover:scale-110 transition-transform",
                "safe-bottom"
              )}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="p-0 w-[280px] sm:w-[320px]"
          >
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: Fixed Sidebar
  return (
    <aside className={cn(
      "w-64 lg:w-72 xl:w-80",
      "border-r border-sidebar-border",
      "hidden md:flex flex-col",
      "bg-sidebar",
      isOled && "dark:bg-black"
    )}>
      {sidebarContent}
    </aside>
  );
}
