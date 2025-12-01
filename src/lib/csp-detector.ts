/**
 * CSP Detection Utility
 * Detects if Content Security Policy blocks eval() and transformers.js
 */

let cachedResult: boolean | null = null;

/**
 * Check if eval is allowed by CSP
 */
export const canUseEval = (): boolean => {
  try {
    new Function('return true')();
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if browser AI (transformers.js) is supported
 * Cached to avoid repeated checks
 */
export const isBrowserAISupported = (): boolean => {
  if (cachedResult === null) {
    cachedResult = canUseEval();
    if (!cachedResult) {
      console.info('[CSP] Browser AI blocked by Content Security Policy - using server fallback');
    }
  }
  return cachedResult;
};

/**
 * Reset cache (for testing)
 */
export const resetCSPCache = (): void => {
  cachedResult = null;
};
