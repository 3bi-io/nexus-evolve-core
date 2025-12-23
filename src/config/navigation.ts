import { 
  MessageSquare, Network, Brain, BarChart3, Store, Phone, 
  Sparkles, Shield, Rocket, GitBranch, Layers, Cpu, Activity, 
  Settings, Plug, TrendingUp, Users, Zap, Trophy, Keyboard,
  Webhook, Globe, BookOpen, Target, LineChart, Bot, Mic, Download
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  shortLabel?: string;
  description?: string;
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
  { to: "/", icon: MessageSquare, label: "Chat", shortLabel: "Chat", description: "AI Chat Interface", public: true },
  { to: "/getting-started", icon: Rocket, label: "Getting Started", shortLabel: "Start", description: "Quick Start Guide", public: true },
  { to: "/agent-marketplace", icon: Store, label: "Marketplace", shortLabel: "Market", description: "Browse AI Agents", public: true },
  { to: "/voice-agent", icon: Phone, label: "Voice AI", shortLabel: "Voice", description: "Voice Agent Studio", public: true },
];

// Public header navigation items (for marketing pages)
export const publicHeaderNavItems: NavItem[] = [
  { to: "/features", icon: Rocket, label: "Features", description: "Platform Features" },
  { to: "/solutions", icon: Target, label: "Solutions", description: "Industry Solutions" },
  { to: "/agent-marketplace", icon: Store, label: "Marketplace", description: "Browse AI Agents" },
];

// Mobile bottom nav items (simplified to 5 core items)
export const mobileBottomNavItems = {
  authenticated: [
    { to: "/", icon: MessageSquare, label: "Chat" },
    { to: "/agent-marketplace", icon: Store, label: "Agents" },
    { to: "/multimodal-studio", icon: Layers, label: "Create" },
    { to: "/analytics", icon: BarChart3, label: "Stats" },
    { to: "/account", icon: Users, label: "More" },
  ],
  public: [
    { to: "/", icon: MessageSquare, label: "Chat" },
    { to: "/agent-marketplace", icon: Store, label: "Agents" },
    { to: "/voice-agent", icon: Mic, label: "Voice" },
    { to: "/multimodal-studio", icon: Layers, label: "Create" },
    { to: "/getting-started", icon: Rocket, label: "Start" },
  ],
};

// Organized navigation sections for dropdown/sidebar menus - Consolidated to 5 categories
export const navSections: NavSection[] = [
  {
    id: "chat",
    label: "Chat",
    items: [
      { to: "/", icon: MessageSquare, label: "Chat", description: "AI Chat Interface", public: true },
      { to: "/getting-started", icon: Rocket, label: "Getting Started", description: "Quick Start Guide", public: true },
      { to: "/install", icon: Download, label: "Install App", description: "Install as PWA", public: true },
    ],
  },
  {
    id: "agents",
    label: "Agents",
    items: [
      { to: "/agent-marketplace", icon: Store, label: "Marketplace", description: "Browse AI Agents", public: true },
      { to: "/agent-studio", icon: Bot, label: "Agent Studio", description: "Build custom agents", public: true },
      { to: "/voice-agent", icon: Phone, label: "Voice AI", description: "Voice conversations", public: true },
      { to: "/voice-agent-manager", icon: Mic, label: "Voice Manager", description: "Manage voice agents", public: true },
      { to: "/agent-revenue", icon: TrendingUp, label: "Revenue", description: "Agent revenue", public: true },
      { to: "/agent-analytics", icon: BarChart3, label: "Agent Analytics", description: "Agent performance", public: true },
    ],
  },
  {
    id: "create",
    label: "Create",
    items: [
      { to: "/multimodal-studio", icon: Layers, label: "Multimodal Studio", description: "Images, audio, video", public: true },
      { to: "/automation-hub", icon: Zap, label: "Automation", description: "Automated workflows", public: true },
      { to: "/problem-solver", icon: Target, label: "Problem Solver", description: "AI problem solving", public: true },
      { to: "/xai-studio", icon: Sparkles, label: "XAI Studio", description: "Explainable AI tools", public: true },
      { to: "/browser-ai", icon: Globe, label: "Browser AI", description: "In-browser AI", public: true },
    ],
  },
  {
    id: "intelligence",
    label: "Analytics",
    items: [
      { to: "/analytics", icon: BarChart3, label: "Dashboard", description: "Analytics overview", public: true },
      { to: "/xai-dashboard", icon: Sparkles, label: "XAI Dashboard", description: "AI insights", public: true },
      { to: "/knowledge-graph", icon: Network, label: "Knowledge Graph", description: "Visual knowledge", public: true },
      { to: "/memory-graph", icon: GitBranch, label: "Memory Graph", description: "AI memory visualization", public: true },
      { to: "/agi-dashboard", icon: Brain, label: "AGI Dashboard", description: "AGI Control Center", public: true },
      { to: "/router-dashboard", icon: Activity, label: "Router Metrics", description: "AI routing metrics", public: true },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    items: [
      { to: "/account", icon: Users, label: "Account", description: "Your account", public: true },
      { to: "/system-health", icon: Shield, label: "System Health", description: "Monitor status", public: true },
      { to: "/teams", icon: Users, label: "Teams", description: "Team management", public: true },
      { to: "/api-access", icon: Plug, label: "API Access", description: "API keys", public: true },
      { to: "/webhooks", icon: Webhook, label: "Webhooks", description: "Webhook management", public: true },
      { to: "/integrations", icon: Plug, label: "Integrations", description: "Third-party integrations", public: true },
      { to: "/achievements", icon: Trophy, label: "Achievements", description: "Your achievements", public: true },
      { to: "/referrals", icon: TrendingUp, label: "Referrals", description: "Referral program", public: true },
      { to: "/super-admin", icon: Settings, label: "Admin", description: "Admin Dashboard", adminOnly: true },
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
