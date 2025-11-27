import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Fragment } from "react";

const routeLabels: Record<string, string> = {
  chat: "Chat",
  account: "Account Settings",
  pricing: "Pricing & Plans",
  "knowledge-graph": "Knowledge Graph",
  "memory-graph": "Memory Graph",
  capabilities: "Capabilities",
  "problem-solver": "Problem Solver",
  evolution: "Evolution",
  "agi-dashboard": "AGI Dashboard",
  achievements: "Achievements",
  analytics: "Analytics",
  "llm-analytics": "LLM Analytics",
  admin: "Super Admin",
  referrals: "Referrals",
  integrations: "Integrations",
  "usage-analytics": "Usage Analytics",
  "social-intelligence": "Social Intelligence",
  "agent-marketplace": "Agent Marketplace",
  "voice-agent": "Voice Agent",
  "agent-studio": "Agent Studio",
  "agent-executor": "Agent Executor",
  "agent-revenue": "Agent Revenue",
  "advanced-analytics": "Advanced Analytics",
  "advanced-ai": "Advanced AI",
  "system-health": "System Health",
  collaboration: "Collaboration",
  teams: "Teams",
  "api-access": "API Access",
  webhooks: "Webhooks",
  "multimodal-studio": "Multimodal Studio",
  "model-comparison": "Model Comparison",
  "browser-ai": "Browser AI",
  "ai-hub": "AI Hub",
  "advanced-browser-ai": "Advanced Browser AI",
  "router-dashboard": "Router Dashboard",
  "enterprise-router": "Enterprise Router",
  "unified-router": "Unified Router",
  "getting-started": "Getting Started",
  // Admin subsections
  overview: "System Overview",
  users: "User Management",
  agents: "Agent Management",
  data: "Data Management",
  financial: "Financial Dashboard",
  config: "System Configuration",
  security: "Security Center",
  announcements: "Announcements",
  devtools: "Developer Tools",
  "audit-log": "Audit Log",
  "user-analytics": "User Analytics",
};

export function BreadcrumbNav() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0 || pathSegments[0] === "landing") {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.map((segment, index) => {
          const path = "/" + pathSegments.slice(0, index + 1).join("/");
          const isLast = index === pathSegments.length - 1;
          const label = routeLabels[segment] || segment.replace(/-/g, " ");

          return (
            <Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="capitalize">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path} className="capitalize">
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
