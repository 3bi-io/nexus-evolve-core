import { MessageSquare, BookOpen, BarChart3, GitBranch, TestTube, Calendar, LucideIcon } from 'lucide-react';

export interface AgentFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export const agentFeatures: AgentFeature[] = [
  {
    icon: MessageSquare,
    title: "Persistent Conversations",
    description: "Save, search, and continue conversations with auto-generated titles",
    color: "text-blue-500"
  },
  {
    icon: BookOpen,
    title: "Knowledge Bases",
    description: "Upload documents, auto-chunk content, enable RAG-powered search",
    color: "text-green-500"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track performance, tool usage, success rates with detailed insights",
    color: "text-purple-500"
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Snapshot configs, compare versions, rollback changes safely",
    color: "text-orange-500"
  },
  {
    icon: TestTube,
    title: "Testing Suite",
    description: "Test scenarios, run suites, ensure quality before deployment",
    color: "text-pink-500"
  },
  {
    icon: Calendar,
    title: "Automation",
    description: "Schedule runs with cron, webhooks, and email integration",
    color: "text-red-500"
  }
];
