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

// Mobile bottom nav items (simplified, most important routes)
export const mobileBottomNavItems = {
  authenticated: [
    { to: "/", icon: MessageSquare, label: "Chat" },
    { to: "/agent-marketplace", icon: Store, label: "Market" },
    { to: "/agi-dashboard", icon: Sparkles, label: "AGI" },
    { to: "/analytics", icon: BarChart3, label: "Stats" },
    { to: "/account", icon: Users, label: "Account" },
  ],
  public: [
    { to: "/", icon: MessageSquare, label: "Chat" },
    { to: "/agent-marketplace", icon: Store, label: "Market" },
    { to: "/voice-agent", icon: Mic, label: "Voice" },
    { to: "/features", icon: Sparkles, label: "Features" },
    { to: "/getting-started", icon: Rocket, label: "More" },
  ],
};

// Organized navigation sections for dropdown/sidebar menus
export const navSections: NavSection[] = [
  {
    id: "main",
    label: "Main",
    items: [
      { to: "/", icon: MessageSquare, label: "Chat", description: "AI Chat Interface", public: true },
      { to: "/getting-started", icon: Rocket, label: "Getting Started", description: "Quick Start Guide", public: true },
      { to: "/agent-marketplace", icon: Store, label: "Marketplace", description: "Browse AI Agents", public: true },
      { to: "/install", icon: Download, label: "Install App", description: "Install as PWA", public: true },
      { to: "/voice-agent", icon: Mic, label: "Voice AI", description: "Voice conversations", public: true },
    ],
  },
  {
    id: "ai-studio",
    label: "AI Studio",
    items: [
      { to: "/agent-studio", icon: Bot, label: "Agent Studio", public: true },
      { to: "/multimodal-studio", icon: Layers, label: "Multimodal Studio", public: true },
      { to: "/voice-agent", icon: Phone, label: "Voice Agent", public: true },
      { to: "/voice-agent-manager", icon: Mic, label: "Voice Agent Manager", public: true },
      { to: "/problem-solver", icon: Target, label: "Problem Solver", public: true },
      { to: "/ai-hub", icon: Cpu, label: "AI Hub", public: true },
      { to: "/browser-ai", icon: Globe, label: "Browser AI", public: true },
      { to: "/advanced-browser-ai", icon: Sparkles, label: "Advanced Browser AI", public: true },
      { to: "/model-comparison", icon: BarChart3, label: "Model Comparison", public: true },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    items: [
      { to: "/knowledge-graph", icon: Network, label: "Knowledge Graph", public: true },
      { to: "/memory-graph", icon: GitBranch, label: "Memory Graph", public: true },
      { to: "/analytics", icon: BarChart3, label: "Analytics Dashboard", public: true },
      { to: "/llm-analytics", icon: LineChart, label: "LLM Analytics", public: true },
      { to: "/usage-analytics", icon: TrendingUp, label: "Usage Analytics", public: true },
      { to: "/advanced-analytics", icon: Activity, label: "Advanced Analytics", public: true },
      { to: "/social-intelligence", icon: Users, label: "Social Intelligence", public: true },
      { to: "/xai-dashboard", icon: Sparkles, label: "XAI Dashboard", public: true },
      { to: "/xai-studio", icon: Sparkles, label: "XAI Studio", public: true },
      { to: "/xai-analytics", icon: BarChart3, label: "XAI Analytics", public: true },
      { to: "/automation-hub", icon: Zap, label: "Automation Hub", public: true },
      { to: "/unified-router", icon: Zap, label: "Unified Router", public: true },
      { to: "/router-dashboard", icon: Activity, label: "Router Metrics", public: true },
    ],
  },
  {
    id: "agents",
    label: "Agents",
    items: [
      { to: "/agent-marketplace", icon: Store, label: "Agent Marketplace", public: true },
      { to: "/agent-revenue", icon: TrendingUp, label: "Revenue Dashboard", public: true },
      { to: "/agent-analytics", icon: BarChart3, label: "Agent Analytics", public: true },
    ],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    items: [
      { to: "/teams", icon: Users, label: "Teams", public: true },
      { to: "/collaboration", icon: Users, label: "Collaboration", public: true },
      { to: "/api-access", icon: Plug, label: "API Access", public: true },
      { to: "/webhooks", icon: Webhook, label: "Webhooks", public: true },
      { to: "/integrations", icon: Plug, label: "Integrations", public: true },
      { to: "/enterprise-router", icon: Settings, label: "Enterprise Router", public: true },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { to: "/system-health", icon: Shield, label: "System Health", description: "Monitor System Status", public: true },
      { to: "/evolution", icon: Zap, label: "Evolution System", description: "Self-Learning AI", public: true },
      { to: "/agi-dashboard", icon: Brain, label: "AGI Dashboard", description: "AGI Control Center", public: true },
      { to: "/capabilities", icon: BookOpen, label: "Capabilities", description: "System Capabilities", public: true },
      { to: "/achievements", icon: Trophy, label: "Achievements", description: "Your Achievements", public: true },
      { to: "/referrals", icon: TrendingUp, label: "Referrals", description: "Referral Program", public: true },
      { to: "/advanced-ai", icon: Cpu, label: "Advanced AI", description: "Advanced AI Features", public: true },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    items: [
      { to: "/super-admin", icon: Settings, label: "Super Admin", description: "Admin Dashboard", adminOnly: true },
      { to: "/platform-optimizer", icon: Sparkles, label: "Platform Optimizer", description: "AI Auto-Improvements", adminOnly: true },
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
