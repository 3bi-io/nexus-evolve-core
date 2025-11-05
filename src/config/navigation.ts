import { 
  MessageSquare, Network, Brain, BarChart3, Store, Phone, 
  Sparkles, Shield, Rocket, GitBranch, Layers, Cpu, Activity, 
  Settings, Plug, TrendingUp, Users, Zap, Trophy, Keyboard,
  Webhook, Globe, BookOpen, Target, LineChart, Bot, Mic
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  shortLabel?: string;
  public?: boolean;
  adminOnly?: boolean;
  badge?: string | number | null;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

// Primary navigation items (shown prominently)
export const primaryNavItems: NavItem[] = [
  { to: "/chat", icon: MessageSquare, label: "Chat", shortLabel: "Chat", public: false },
  { to: "/getting-started", icon: Rocket, label: "Getting Started", shortLabel: "Start", public: true },
  { to: "/agent-marketplace", icon: Store, label: "Marketplace", shortLabel: "Market", public: true },
  { to: "/voice-agent", icon: Phone, label: "Voice AI", shortLabel: "Voice", public: true },
  { to: "/pricing", icon: Sparkles, label: "Pricing", shortLabel: "Price", public: true },
];

// Mobile bottom nav items (simplified, most important routes)
export const mobileBottomNavItems = {
  authenticated: [
    { to: "/chat", icon: MessageSquare, label: "Chat" },
    { to: "/agent-marketplace", icon: Store, label: "Market" },
    { to: "/agi-dashboard", icon: Sparkles, label: "AGI" },
    { to: "/analytics", icon: BarChart3, label: "Stats" },
    { to: "/account", icon: Users, label: "Account" },
  ],
  public: [
    { to: "/", icon: MessageSquare, label: "Home" },
    { to: "/agent-marketplace", icon: Store, label: "Market" },
    { to: "/pricing", icon: Sparkles, label: "Pricing" },
    { to: "/auth", icon: Users, label: "Sign In" },
  ],
};

// Organized navigation sections for dropdown/sidebar menus
export const navSections: NavSection[] = [
  {
    id: "main",
    label: "Main",
    items: [
      { to: "/chat", icon: MessageSquare, label: "Chat" },
      { to: "/getting-started", icon: Rocket, label: "Getting Started" },
      { to: "/agent-marketplace", icon: Store, label: "Marketplace" },
      { to: "/pricing", icon: Sparkles, label: "Pricing" },
    ],
  },
  {
    id: "ai-studio",
    label: "AI Studio",
    items: [
      { to: "/agent-studio", icon: Bot, label: "Agent Studio" },
      { to: "/multimodal-studio", icon: Layers, label: "Multimodal Studio" },
      { to: "/voice-agent", icon: Phone, label: "Voice Agent" },
      { to: "/voice-agent-manager", icon: Mic, label: "Voice Agent Manager" },
      { to: "/problem-solver", icon: Target, label: "Problem Solver" },
      { to: "/ai-hub", icon: Cpu, label: "AI Hub" },
      { to: "/browser-ai", icon: Globe, label: "Browser AI" },
      { to: "/advanced-browser-ai", icon: Sparkles, label: "Advanced Browser AI" },
      { to: "/model-comparison", icon: BarChart3, label: "Model Comparison" },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    items: [
      { to: "/knowledge-graph", icon: Network, label: "Knowledge Graph" },
      { to: "/memory-graph", icon: GitBranch, label: "Memory Graph" },
      { to: "/analytics", icon: BarChart3, label: "Analytics Dashboard" },
      { to: "/llm-analytics", icon: LineChart, label: "LLM Analytics" },
      { to: "/usage-analytics", icon: TrendingUp, label: "Usage Analytics" },
      { to: "/advanced-analytics", icon: Activity, label: "Advanced Analytics" },
      { to: "/social-intelligence", icon: Users, label: "Social Intelligence" },
      { to: "/unified-router", icon: Zap, label: "Unified Router" },
      { to: "/router-dashboard", icon: Activity, label: "Router Metrics" },
    ],
  },
  {
    id: "agents",
    label: "Agents",
    items: [
      { to: "/agent-marketplace", icon: Store, label: "Agent Marketplace" },
      { to: "/agent-revenue", icon: TrendingUp, label: "Revenue Dashboard" },
      { to: "/agent-analytics", icon: BarChart3, label: "Agent Analytics" },
    ],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    items: [
      { to: "/teams", icon: Users, label: "Teams" },
      { to: "/collaboration", icon: Users, label: "Collaboration" },
      { to: "/api-access", icon: Plug, label: "API Access" },
      { to: "/webhooks", icon: Webhook, label: "Webhooks" },
      { to: "/integrations", icon: Plug, label: "Integrations" },
      { to: "/enterprise-router", icon: Settings, label: "Enterprise Router" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { to: "/system-health", icon: Shield, label: "System Health" },
      { to: "/evolution", icon: Zap, label: "Evolution System" },
      { to: "/agi-dashboard", icon: Brain, label: "AGI Dashboard" },
      { to: "/capabilities", icon: BookOpen, label: "Capabilities" },
      { to: "/achievements", icon: Trophy, label: "Achievements" },
      { to: "/referrals", icon: TrendingUp, label: "Referrals" },
      { to: "/advanced-ai", icon: Cpu, label: "Advanced AI" },
    ],
  },
];

// Helper function to get all navigation items flattened
export const getAllNavItems = (): NavItem[] => {
  return navSections.flatMap(section => section.items);
};

// Helper function to get public navigation items
export const getPublicNavItems = (): NavItem[] => {
  return primaryNavItems.filter(item => item.public);
};

// Helper function to get user navigation items (authenticated only)
export const getUserNavItems = (): NavItem[] => {
  return getAllNavItems().filter(item => !item.public && !item.adminOnly);
};
