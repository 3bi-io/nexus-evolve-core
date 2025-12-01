/**
 * Dynamic Transformers.js Loader
 * Only loads the library when browser AI is actually needed AND CSP allows it
 * Prevents CSP warnings on non-AI pages
 */

import { isBrowserAISupported } from './csp-detector';

type TransformersModule = typeof import('@huggingface/transformers');

let cachedModule: TransformersModule | null = null;

/**
 * Dynamically load transformers.js only when needed
 * @returns The transformers module or null if CSP blocks it
 */
export const loadTransformers = async (): Promise<TransformersModule | null> => {
  // Check CSP support first
  if (!isBrowserAISupported()) {
    console.info('[Transformers] CSP blocks eval, browser AI unavailable');
    return null;
  }

  // Return cached module if already loaded
  if (cachedModule) {
    return cachedModule;
  }

  try {
    console.info('[Transformers] Dynamically loading transformers.js...');
    cachedModule = await import('@huggingface/transformers');
    console.info('[Transformers] Module loaded successfully');
    return cachedModule;
  } catch (error) {
    console.error('[Transformers] Failed to load:', error);
    return null;
  }
};

/**
 * Reset cached module (for testing)
 */
export const resetTransformersCache = (): void => {
  cachedModule = null;
};
