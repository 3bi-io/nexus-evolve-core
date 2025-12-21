/**
 * Centralized AI Model Configuration
 * Single source of truth for all model versions and capabilities
 * Update this file when new model versions are released
 */

// =============================================================================
// Model Version Constants
// =============================================================================

export const MODELS = {
  // OpenAI GPT Models
  GPT_5: 'gpt-5-2025-08-07',
  GPT_5_MINI: 'gpt-5-mini-2025-08-07',
  GPT_5_NANO: 'gpt-5-nano-2025-08-07',
  GPT_4_1: 'gpt-4.1-2025-04-14',
  GPT_4_1_MINI: 'gpt-4.1-mini-2025-04-14',
  O3: 'o3-2025-04-16',
  O4_MINI: 'o4-mini-2025-04-16',
  // Legacy (avoid using)
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_4: 'gpt-4',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',

  // Anthropic Claude Models
  CLAUDE_SONNET_4_5: 'claude-sonnet-4-5',
  CLAUDE_OPUS_4_1: 'claude-opus-4-1-20250805',
  CLAUDE_SONNET_4: 'claude-sonnet-4-20250514',
  CLAUDE_3_7_SONNET: 'claude-3-7-sonnet-20250219',
  CLAUDE_3_5_HAIKU: 'claude-3-5-haiku-20241022',

  // xAI Grok Models
  GROK_3: 'grok-3',
  GROK_3_MINI: 'grok-3-mini',
  GROK_3_FAST: 'grok-3-fast',
  GROK_2: 'grok-2-1212',
  GROK_2_VISION: 'grok-2-vision-1212',
  // Legacy
  GROK_BETA: 'grok-beta',

  // Google Gemini Models (via Lovable AI Gateway)
  GEMINI_2_5_PRO: 'google/gemini-2.5-pro',
  GEMINI_2_5_FLASH: 'google/gemini-2.5-flash',
  GEMINI_2_5_FLASH_LITE: 'google/gemini-2.5-flash-lite',
  GEMINI_3_PRO_PREVIEW: 'google/gemini-3-pro-preview',
  GEMINI_2_5_FLASH_IMAGE: 'google/gemini-2.5-flash-image',
  GEMINI_3_PRO_IMAGE_PREVIEW: 'google/gemini-3-pro-image-preview',

  // ElevenLabs TTS Models
  ELEVENLABS_MULTILINGUAL_V2: 'eleven_multilingual_v2',
  ELEVENLABS_TURBO_V2_5: 'eleven_turbo_v2_5',
  ELEVENLABS_FLASH_V2_5: 'eleven_flash_v2_5',
} as const;

// =============================================================================
// Default Models by Use Case
// =============================================================================

export const DEFAULT_MODELS = {
  // General chat
  CHAT: MODELS.GROK_3,
  CHAT_FAST: MODELS.GROK_3_MINI,
  
  // Reasoning tasks
  REASONING: MODELS.CLAUDE_SONNET_4_5,
  REASONING_HEAVY: MODELS.CLAUDE_OPUS_4_1,
  
  // Code analysis
  CODE: MODELS.CLAUDE_SONNET_4_5,
  
  // Creative writing
  CREATIVE: MODELS.CLAUDE_SONNET_4_5,
  
  // Vision/Image
  VISION: MODELS.GROK_2_VISION,
  IMAGE_GEN: MODELS.GEMINI_2_5_FLASH_IMAGE,
  
  // Lovable AI Gateway default
  LOVABLE_GATEWAY: MODELS.GEMINI_2_5_FLASH,
  
  // TTS default
  TTS: MODELS.ELEVENLABS_TURBO_V2_5,
} as const;

// =============================================================================
// Model Capabilities
// =============================================================================

export type ModelCapability = 
  | 'chat'
  | 'reasoning'
  | 'code'
  | 'vision'
  | 'image-gen'
  | 'long-context'
  | 'streaming'
  | 'function-calling'
  | 'web-search';

export const MODEL_CAPABILITIES: Record<string, ModelCapability[]> = {
  // GPT-5 family
  [MODELS.GPT_5]: ['chat', 'reasoning', 'code', 'vision', 'long-context', 'streaming', 'function-calling'],
  [MODELS.GPT_5_MINI]: ['chat', 'reasoning', 'code', 'vision', 'streaming', 'function-calling'],
  [MODELS.GPT_5_NANO]: ['chat', 'streaming', 'function-calling'],
  
  // Claude family
  [MODELS.CLAUDE_SONNET_4_5]: ['chat', 'reasoning', 'code', 'vision', 'long-context', 'streaming'],
  [MODELS.CLAUDE_OPUS_4_1]: ['chat', 'reasoning', 'code', 'vision', 'long-context', 'streaming'],
  
  // Grok family
  [MODELS.GROK_3]: ['chat', 'reasoning', 'code', 'long-context', 'streaming', 'web-search'],
  [MODELS.GROK_3_MINI]: ['chat', 'code', 'streaming'],
  [MODELS.GROK_2_VISION]: ['chat', 'vision', 'streaming'],
  
  // Gemini family
  [MODELS.GEMINI_2_5_PRO]: ['chat', 'reasoning', 'code', 'vision', 'long-context', 'streaming'],
  [MODELS.GEMINI_2_5_FLASH]: ['chat', 'code', 'vision', 'streaming'],
  [MODELS.GEMINI_2_5_FLASH_IMAGE]: ['image-gen'],
};

// =============================================================================
// API Version Constants
// =============================================================================

export const API_VERSIONS = {
  ANTHROPIC: '2024-01-01',
  OPENAI: '2024-01-01',
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a model supports a specific capability
 */
export function modelSupports(model: string, capability: ModelCapability): boolean {
  const capabilities = MODEL_CAPABILITIES[model];
  return capabilities ? capabilities.includes(capability) : false;
}

/**
 * Get recommended model for a capability
 */
export function getModelForCapability(capability: ModelCapability): string {
  switch (capability) {
    case 'reasoning':
      return DEFAULT_MODELS.REASONING;
    case 'code':
      return DEFAULT_MODELS.CODE;
    case 'vision':
      return DEFAULT_MODELS.VISION;
    case 'image-gen':
      return DEFAULT_MODELS.IMAGE_GEN;
    case 'chat':
    default:
      return DEFAULT_MODELS.CHAT;
  }
}

/**
 * Check if model is legacy/deprecated
 */
export function isLegacyModel(model: string): boolean {
  const legacyModels = [
    MODELS.GPT_4,
    MODELS.GPT_3_5_TURBO,
    MODELS.GPT_4O,
    MODELS.GPT_4O_MINI,
    MODELS.GROK_BETA,
  ];
  return legacyModels.includes(model as typeof legacyModels[number]);
}

/**
 * Get current version of a model family
 */
export function getCurrentVersion(modelFamily: 'gpt' | 'claude' | 'grok' | 'gemini'): string {
  switch (modelFamily) {
    case 'gpt':
      return MODELS.GPT_5;
    case 'claude':
      return MODELS.CLAUDE_SONNET_4_5;
    case 'grok':
      return MODELS.GROK_3;
    case 'gemini':
      return MODELS.GEMINI_2_5_FLASH;
    default:
      return MODELS.GEMINI_2_5_FLASH;
  }
}
