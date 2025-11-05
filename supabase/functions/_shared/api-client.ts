/**
 * Shared API client utilities for edge functions
 * Provides retry logic, timeouts, and connection pooling for external API calls
 */

export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  timeout?: number;
  retryableStatuses?: number[];
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  timeout: 30000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const calculateDelay = (attempt: number, initialDelay: number, maxDelay: number): number => {
  const delay = initialDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
};

/**
 * Check if error is retryable
 */
const isRetryableError = (error: Error | Response, retryableStatuses: number[]): boolean => {
  if (error instanceof Response) {
    return retryableStatuses.includes(error.status);
  }
  // Network errors are retryable
  return error.name === 'TypeError' || error.message.includes('fetch');
};

/**
 * Fetch with timeout
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
};

/**
 * Fetch with retry logic and timeout
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  config: RetryConfig = {}
): Promise<Response> => {
  const {
    maxRetries,
    initialDelay,
    maxDelay,
    timeout,
    retryableStatuses,
  } = { ...DEFAULT_CONFIG, ...config };

  let lastError: Error | Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[API Client] Attempt ${attempt + 1}/${maxRetries + 1} for ${url}`);
      
      const response = await fetchWithTimeout(url, options, timeout);

      // Check if response is successful or non-retryable error
      if (response.ok || !retryableStatuses.includes(response.status)) {
        if (!response.ok) {
          console.error(`[API Client] Non-retryable error: ${response.status}`);
        }
        return response;
      }

      // Store response for potential retry
      lastError = response;
      console.warn(`[API Client] Retryable status ${response.status}, attempt ${attempt + 1}`);

      // Don't sleep on last attempt
      if (attempt < maxRetries) {
        const delay = calculateDelay(attempt, initialDelay, maxDelay);
        console.log(`[API Client] Retrying after ${delay}ms`);
        await sleep(delay);
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`[API Client] Request failed:`, error);

      // Check if error is retryable
      if (!isRetryableError(lastError, retryableStatuses)) {
        throw error;
      }

      // Don't sleep on last attempt
      if (attempt < maxRetries) {
        const delay = calculateDelay(attempt, initialDelay, maxDelay);
        console.log(`[API Client] Retrying after ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  if (lastError instanceof Response) {
    throw new Error(`API request failed after ${maxRetries + 1} attempts: ${lastError.status}`);
  }
  throw lastError || new Error(`API request failed after ${maxRetries + 1} attempts`);
};

/**
 * OpenAI API client with retry and timeout
 */
export const openAIFetch = async (
  endpoint: string,
  options: RequestInit = {},
  config: RetryConfig = {}
): Promise<Response> => {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const url = `https://api.openai.com${endpoint}`;
  
  return fetchWithRetry(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }, config);
};

/**
 * Anthropic API client with retry and timeout
 */
export const anthropicFetch = async (
  endpoint: string,
  options: RequestInit = {},
  config: RetryConfig = {}
): Promise<Response> => {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const url = `https://api.anthropic.com${endpoint}`;
  
  return fetchWithRetry(url, {
    ...options,
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }, config);
};

/**
 * Lovable AI Gateway client with retry and timeout
 */
export const lovableAIFetch = async (
  endpoint: string,
  options: RequestInit = {},
  config: RetryConfig = {}
): Promise<Response> => {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');

  const url = `https://ai.gateway.lovable.dev${endpoint}`;
  
  return fetchWithRetry(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }, config);
};
