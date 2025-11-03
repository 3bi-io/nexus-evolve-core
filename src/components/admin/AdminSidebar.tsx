import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  AlertTriangle,
  CreditCard,
  FileText,
  Flag,
  Key,
  Lock,
  MessageSquare,
  TrendingUp,
  UserCog,
  FileWarning,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  section: string;
  onSectionChange: (section: string) => void;
}

const sidebarSections = [
  {
    id: "overview",
    label: "System Overview",
    icon: Home,
    description: "Dashboard & stats",
  },
  {
    id: "user-analytics",
    label: "User Analytics",
    icon: TrendingUp,
    description: "Growth & retention",
  },
  {
    id: "agent-analytics",
    label: "Agent Analytics",
    icon: Activity,
    description: "Agent performance",
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    description: "Manage users & roles",
  },
  {
    id: "agents",
    label: "Agent Management",
    icon: Bot,
    description: "Moderate agents",
  },
  {
    id: "data",
    label: "Data Management",
    icon: Database,
    description: "Knowledge & memory",
  },
  {
    id: "financial",
    label: "Financial",
    icon: DollarSign,
    description: "Revenue & credits",
  },
  {
    id: "config",
    label: "System Config",
    icon: Settings,
    description: "Feature flags",
  },
  {
    id: "security",
    label: "Security Center",
    icon: Shield,
    description: "Security & RLS",
  },
  {
    id: "announcements",
    label: "Announcements",
    icon: Megaphone,
    description: "System messages",
  },
  {
    id: "audit-log",
    label: "Audit Log",
    icon: FileWarning,
    description: "Admin actions",
  },
  {
    id: "devtools",
    label: "Dev Tools",
    icon: Code,
    description: "Developer utils",
  },
];

export function AdminSidebar({ section, onSectionChange }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <div className="w-64 border-r bg-card h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-destructive" />
          <span>Super Admin</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-1">System Management</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sidebarSections.map((item) => {
            const Icon = item.icon;
            const isActive = section === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-auto py-3 px-3",
                  isActive && "bg-secondary"
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <Link to="/chat">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Home className="w-4 h-4" />
            Back to App
          </Button>
        </Link>
      </div>
    </div>
  );
}
