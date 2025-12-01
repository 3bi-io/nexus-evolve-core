/**
 * Browser AI Wrapper with Server Fallback
 * Provides graceful degradation when CSP blocks browser AI
 */

import { isBrowserAISupported } from './csp-detector';
import { supabase } from '@/integrations/supabase/client';

export type BrowserAITask = 
  | 'embeddings'
  | 'classification'
  | 'speech-recognition'
  | 'image-captioning'
  | 'object-detection'
  | 'background-removal';

/**
 * Execute AI task with automatic fallback to server
 */
export const executeWithFallback = async <T>(
  task: BrowserAITask,
  browserFn: () => Promise<T>,
  serverFallback?: () => Promise<T>
): Promise<{ result: T; usedServer: boolean }> => {
  // Check CSP support
  if (!isBrowserAISupported()) {
    if (serverFallback) {
      console.info(`[Browser AI] Using server fallback for ${task}`);
      const result = await serverFallback();
      return { result, usedServer: true };
    } else {
      throw new Error('Browser AI blocked by CSP and no server fallback available');
    }
  }

  try {
    const result = await browserFn();
    return { result, usedServer: false };
  } catch (error) {
    // Check if it's a CSP error
    const isCSPError = error instanceof Error && (
      error.message.includes('eval') ||
      error.message.includes('Content Security Policy') ||
      error.message.includes('unsafe-eval')
    );

    if (isCSPError && serverFallback) {
      console.warn(`[Browser AI] CSP error detected for ${task}, falling back to server`, error);
      const result = await serverFallback();
      return { result, usedServer: true };
    }

    throw error;
  }
};

/**
 * Server-side embeddings via huggingface-inference
 */
export const serverEmbeddings = async (texts: string[]): Promise<number[][]> => {
  const { data, error } = await supabase.functions.invoke('huggingface-inference', {
    body: {
      modelId: 'sentence-transformers/all-MiniLM-L6-v2',
      task: 'feature-extraction',
      inputs: texts,
    }
  });

  if (error) throw error;
  return data.result;
};

/**
 * Server-side text classification
 */
export const serverClassification = async (
  text: string,
  candidateLabels: string[]
): Promise<{ labels: string[]; scores: number[] }> => {
  const { data, error } = await supabase.functions.invoke('huggingface-inference', {
    body: {
      modelId: 'facebook/bart-large-mnli',
      task: 'zero-shot-classification',
      inputs: text,
      parameters: { candidate_labels: candidateLabels }
    }
  });

  if (error) throw error;
  return data.result;
};

/**
 * Server-side image captioning
 */
export const serverImageCaptioning = async (imageBase64: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('huggingface-inference', {
    body: {
      modelId: 'nlpconnect/vit-gpt2-image-captioning',
      task: 'image-to-text',
      inputs: imageBase64,
    }
  });

  if (error) throw error;
  return data.result[0]?.generated_text || '';
};

/**
 * Server-side object detection
 */
export const serverObjectDetection = async (imageBase64: string): Promise<any[]> => {
  const { data, error } = await supabase.functions.invoke('huggingface-inference', {
    body: {
      modelId: 'facebook/detr-resnet-50',
      task: 'object-detection',
      inputs: imageBase64,
    }
  });

  if (error) throw error;
  return data.result;
};
