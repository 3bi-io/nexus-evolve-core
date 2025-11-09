// Runtime validation for demo prompts array
if (import.meta.env.DEV) {
  const validateDemoPrompts = () => {
    // Will be validated after DEMO_PROMPTS is defined
    setTimeout(() => {
      if (!DEMO_PROMPTS || DEMO_PROMPTS.length === 0) {
        console.warn('[demo-prompts] DEMO_PROMPTS array is empty or undefined');
      }
    }, 0);
  };
  validateDemoPrompts();
}

import {
  Brain, 
  Mic, 
  TrendingUp,
  Shield,
  Network,
  MessageSquare,
  LucideIcon
} from "lucide-react";

export interface DemoPrompt {
  icon: LucideIcon;
  prompt: string;
  response: string;
  badge: string;
  credits: number;
}

export const DEMO_PROMPTS: DemoPrompt[] = [
  {
    icon: MessageSquare,
    prompt: "Analyze this business idea and give me strategic insights",
    response: "I'll analyze your business idea using the Reasoning Agent for strategic insights and the Creative Agent for innovative angles. Let me break down market opportunity, competitive advantages, potential challenges, and growth strategies...",
    badge: "Multi-Agent",
    credits: 8
  },
  {
    icon: Mic,
    prompt: "Start a voice conversation about AI trends",
    response: "🎙️ Starting voice conversation with ElevenLabs integration... I can hear you clearly! Let's discuss the latest AI trends including multimodal models, autonomous agents, and real-time voice interactions with function calling...",
    badge: "Voice AI",
    credits: 12
  },
  {
    icon: TrendingUp,
    prompt: "What's trending on social media about AI?",
    response: "📊 Using Grok for real-time social intelligence... Top trends: 1) GPT-4 Vision applications (↑45%), 2) Open-source LLMs (↑32%), 3) AI safety debates (↑28%). Sentiment: 78% positive. Best posting time: 2-4 PM EST.",
    badge: "Social Intel",
    credits: 10
  },
  {
    icon: Shield,
    prompt: "Check my account security status",
    response: "🛡️ Security systems active: Bot detection scanning 100+ signals, geographic risk assessment blocking 6 sanctioned countries, brute-force protection with progressive delays. Your account is protected by bank-level security with real-time threat monitoring and advanced fraud detection.",
    badge: "Security",
    credits: 5
  },
  {
    icon: Network,
    prompt: "Build a knowledge graph from my research notes",
    response: "🕸️ Creating semantic knowledge graph with vector embeddings... Identified 24 key concepts, 156 relationships, and 8 knowledge clusters. Visual graph ready with interactive exploration and intelligent search capabilities.",
    badge: "Knowledge",
    credits: 20
  },
  {
    icon: Brain,
    prompt: "Create a custom agent for customer support",
    response: "🤖 Launching Agent Studio... Your custom support agent can handle: FAQ responses, ticket routing, sentiment analysis, and escalation detection. Includes NLP training on your data and webhook integration for CRM systems.",
    badge: "Agent Builder",
    credits: 25
  },
];
