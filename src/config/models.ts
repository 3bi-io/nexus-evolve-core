/**
 * Centralized Model Configuration
 * Single source of truth for all AI model definitions
 * Synced with backend model-config.ts
 */

// Lovable AI Gateway Models
export const LOVABLE_MODELS = {
  // Text Generation
  'google/gemini-2.5-flash': {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    cost: 0.001,
    speed: 'Fast',
    capabilities: ['text-generation', 'chat', 'reasoning'],
    description: 'Balanced choice: fast, multimodal, good reasoning',
    isDefault: true,
  },
  'google/gemini-2.5-flash-lite': {
    id: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    cost: 0.0005,
    speed: 'Fastest',
    capabilities: ['text-generation', 'chat'],
    description: 'Fastest and cheapest for simple workloads',
  },
  'google/gemini-2.5-pro': {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    cost: 0.005,
    speed: 'Medium',
    capabilities: ['text-generation', 'chat', 'reasoning', 'vision'],
    description: 'Top-tier for complex reasoning and big context',
  },
  'google/gemini-3-pro-preview': {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    provider: 'google',
    cost: 0.008,
    speed: 'Medium',
    capabilities: ['text-generation', 'chat', 'reasoning', 'vision'],
    description: 'Next-generation preview model',
  },
  'openai/gpt-5-mini': {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    cost: 0.002,
    speed: 'Fast',
    capabilities: ['text-generation', 'chat', 'reasoning'],
    description: 'Middle ground: lower cost with strong performance',
  },
  'openai/gpt-5': {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    cost: 0.01,
    speed: 'Slow',
    capabilities: ['text-generation', 'chat', 'reasoning', 'vision'],
    description: 'Powerful all-rounder, excellent reasoning',
  },
  'openai/gpt-5-nano': {
    id: 'openai/gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'openai',
    cost: 0.0005,
    speed: 'Fastest',
    capabilities: ['text-generation', 'chat'],
    description: 'Speed and cost optimized for simple tasks',
  },
  // Image Generation
  'google/gemini-2.5-flash-image': {
    id: 'google/gemini-2.5-flash-image',
    name: 'Gemini Image',
    provider: 'google',
    cost: 0.01,
    speed: 'Fast',
    capabilities: ['text-to-image'],
    description: 'Fast image generation from text',
  },
  'google/gemini-3-pro-image-preview': {
    id: 'google/gemini-3-pro-image-preview',
    name: 'Gemini 3 Image Preview',
    provider: 'google',
    cost: 0.015,
    speed: 'Medium',
    capabilities: ['text-to-image'],
    description: 'Next-generation image generation',
  },
} as const;

// Agent definitions
export const AI_AGENTS = [
  {
    id: 'auto',
    name: 'Auto (Coordinator)',
    description: 'Automatically selects the best agent',
    category: 'system',
  },
  {
    id: 'general',
    name: 'General Assistant',
    description: 'Standard conversational AI',
    category: 'general',
  },
  {
    id: 'reasoning',
    name: 'Reasoning Agent',
    description: 'Deep logical analysis & problem solving',
    category: 'specialized',
  },
  {
    id: 'creative',
    name: 'Creative Agent',
    description: 'Ideation & innovative solutions',
    category: 'specialized',
  },
  {
    id: 'learning',
    name: 'Learning Agent',
    description: 'Meta-learning & pattern analysis',
    category: 'specialized',
  },
  {
    id: 'huggingface',
    name: 'HuggingFace Models',
    description: 'Access to 400,000+ open-source models',
    category: 'specialized',
  },
  {
    id: 'negotiator',
    name: 'Negotiator Agent',
    description: 'Dynamic pricing negotiation',
    category: 'specialized',
  },
] as const;

// Kimi/Moonshot models
export const KIMI_MODELS = [
  {
    id: 'kimi-8k',
    name: 'Kimi 8K',
    description: 'Fast responses, 8K context window',
    contextWindow: 8192,
  },
  {
    id: 'kimi-32k',
    name: 'Kimi 32K',
    description: 'Balanced performance, 32K context',
    contextWindow: 32768,
  },
  {
    id: 'kimi-128k',
    name: 'Kimi 128K',
    description: 'Long documents, 128K context window',
    contextWindow: 131072,
  },
] as const;

// Helper functions
export const getModelsByTask = (task: 'text-generation' | 'text-to-image' | 'feature-extraction') => {
  const taskMapping: Record<string, string> = {
    'text-generation': 'text-generation',
    'text-to-image': 'text-to-image',
    'feature-extraction': 'text-generation', // Map to text-generation for feature extraction
  };
  const mappedTask = taskMapping[task] || task;
  
  return Object.values(LOVABLE_MODELS).filter(model => 
    (model.capabilities as readonly string[]).includes(mappedTask)
  );
};

export const getDefaultModel = () => LOVABLE_MODELS['google/gemini-2.5-flash'];

export const formatCost = (cost: number) => 
  cost < 0.001 ? `$${(cost * 1000).toFixed(4)}/1k` : `$${cost.toFixed(4)}/1k`;

export type LovableModelId = keyof typeof LOVABLE_MODELS;
export type AgentId = typeof AI_AGENTS[number]['id'];
export type KimiModelId = typeof KIMI_MODELS[number]['id'];
