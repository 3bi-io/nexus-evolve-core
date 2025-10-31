import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AIProvider = 'lovable' | 'huggingface' | 'browser';
export type TaskType = 'chat' | 'embedding' | 'classification' | 'image-gen' | 'object-detection' | 'captioning';

interface RouteDecision {
  provider: AIProvider;
  model: string;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
  fallbacks: AIProvider[];
}

interface ProviderMetrics {
  provider: AIProvider;
  successRate: number;
  avgLatency: number;
  totalCalls: number;
  failedCalls: number;
  totalCost: number;
}

export const useAdvancedRouter = () => {
  const [metrics, setMetrics] = useState<Record<AIProvider, ProviderMetrics>>({
    lovable: { provider: 'lovable', successRate: 0.95, avgLatency: 1200, totalCalls: 0, failedCalls: 0, totalCost: 0 },
    huggingface: { provider: 'huggingface', successRate: 0.92, avgLatency: 2500, totalCalls: 0, failedCalls: 0, totalCost: 0 },
    browser: { provider: 'browser', successRate: 0.98, avgLatency: 800, totalCalls: 0, failedCalls: 0, totalCost: 0 }
  });

  const [loadBalancing, setLoadBalancing] = useState<Record<AIProvider, number>>({
    lovable: 0,
    huggingface: 0,
    browser: 0
  });

  const routeTask = useCallback((
    task: TaskType,
    options: {
      priority?: 'speed' | 'cost' | 'quality' | 'privacy';
      maxCost?: number;
      maxLatency?: number;
      requiresAuth?: boolean;
    } = {}
  ): RouteDecision => {
    const { priority = 'quality', maxCost, maxLatency, requiresAuth = false } = options;

    // Task-specific routing logic
    const routingRules: Record<TaskType, () => RouteDecision> = {
      chat: () => {
        if (priority === 'speed' && metrics.lovable.avgLatency < 1500) {
          return {
            provider: 'lovable',
            model: 'google/gemini-2.5-flash',
            reason: 'Fastest API response for chat',
            estimatedCost: 0.0002,
            estimatedLatency: metrics.lovable.avgLatency,
            fallbacks: ['huggingface']
          };
        }
        if (priority === 'cost' && !requiresAuth) {
          return {
            provider: 'huggingface',
            model: 'gpt2',
            reason: 'Free tier available',
            estimatedCost: 0,
            estimatedLatency: metrics.huggingface.avgLatency,
            fallbacks: ['lovable']
          };
        }
        if (priority === 'quality') {
          return {
            provider: 'lovable',
            model: 'google/gemini-2.5-pro',
            reason: 'Highest quality responses',
            estimatedCost: 0.0005,
            estimatedLatency: 1800,
            fallbacks: ['lovable']
          };
        }
        return {
          provider: 'lovable',
          model: 'google/gemini-2.5-flash',
          reason: 'Default chat provider',
          estimatedCost: 0.0002,
          estimatedLatency: metrics.lovable.avgLatency,
          fallbacks: ['huggingface']
        };
      },

      embedding: () => {
        if (priority === 'privacy' || priority === 'cost') {
          return {
            provider: 'browser',
            model: 'mixedbread-ai/mxbai-embed-xsmall-v1',
            reason: 'Free and private in-browser processing',
            estimatedCost: 0,
            estimatedLatency: metrics.browser.avgLatency,
            fallbacks: ['huggingface', 'lovable']
          };
        }
        if (priority === 'speed' && metrics.browser.successRate > 0.95) {
          return {
            provider: 'browser',
            model: 'mixedbread-ai/mxbai-embed-xsmall-v1',
            reason: 'Fastest with WebGPU',
            estimatedCost: 0,
            estimatedLatency: metrics.browser.avgLatency,
            fallbacks: ['huggingface']
          };
        }
        return {
          provider: 'browser',
          model: 'mixedbread-ai/mxbai-embed-xsmall-v1',
          reason: 'Optimal for embeddings',
          estimatedCost: 0,
          estimatedLatency: metrics.browser.avgLatency,
          fallbacks: ['huggingface']
        };
      },

      classification: () => {
        if (priority === 'privacy' || priority === 'cost') {
          return {
            provider: 'browser',
            model: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
            reason: 'Free and private',
            estimatedCost: 0,
            estimatedLatency: metrics.browser.avgLatency,
            fallbacks: ['huggingface']
          };
        }
        return {
          provider: 'browser',
          model: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
          reason: 'Fast browser classification',
          estimatedCost: 0,
          estimatedLatency: metrics.browser.avgLatency,
          fallbacks: ['huggingface']
        };
      },

      'image-gen': () => {
        if (priority === 'quality') {
          return {
            provider: 'lovable',
            model: 'google/gemini-2.5-flash-image',
            reason: 'Highest quality image generation',
            estimatedCost: 0.004,
            estimatedLatency: 3000,
            fallbacks: ['huggingface']
          };
        }
        if (priority === 'speed' || priority === 'cost') {
          return {
            provider: 'huggingface',
            model: 'black-forest-labs/FLUX.1-schnell',
            reason: 'Fast and cost-effective',
            estimatedCost: 0.001,
            estimatedLatency: 2000,
            fallbacks: ['lovable']
          };
        }
        return {
          provider: 'huggingface',
          model: 'black-forest-labs/FLUX.1-schnell',
            reason: 'Default image generation',
          estimatedCost: 0.001,
          estimatedLatency: 2000,
          fallbacks: ['lovable']
        };
      },

      'object-detection': () => ({
        provider: 'browser',
        model: 'Xenova/detr-resnet-50',
        reason: 'Only available in-browser',
        estimatedCost: 0,
        estimatedLatency: metrics.browser.avgLatency * 2,
        fallbacks: []
      }),

      captioning: () => ({
        provider: 'browser',
        model: 'Xenova/vit-gpt2-image-captioning',
        reason: 'Optimized for browser',
        estimatedCost: 0,
        estimatedLatency: metrics.browser.avgLatency * 2,
        fallbacks: []
      })
    };

    const decision = routingRules[task]();

    // Apply constraints
    if (maxCost && decision.estimatedCost > maxCost) {
      // Try fallback providers
      for (const fallback of decision.fallbacks) {
        const fallbackDecision = routingRules[task]();
        if (fallbackDecision.estimatedCost <= maxCost) {
          return { ...fallbackDecision, reason: `Cost-optimized: ${fallbackDecision.reason}` };
        }
      }
    }

    if (maxLatency && decision.estimatedLatency > maxLatency) {
      // Try faster fallback
      const sortedFallbacks = decision.fallbacks.sort(
        (a, b) => metrics[a].avgLatency - metrics[b].avgLatency
      );
      if (sortedFallbacks.length > 0) {
        const fastestFallback = sortedFallbacks[0];
        if (metrics[fastestFallback].avgLatency <= maxLatency) {
          return {
            ...decision,
            provider: fastestFallback,
            reason: `Latency-optimized: ${decision.reason}`,
            estimatedLatency: metrics[fastestFallback].avgLatency
          };
        }
      }
    }

    return decision;
  }, [metrics]);

  const executeWithFallback = useCallback(async <T,>(
    task: TaskType,
    executeFn: (provider: AIProvider, model: string) => Promise<T>,
    options: Parameters<typeof routeTask>[1] = {}
  ): Promise<{ result: T; provider: AIProvider; latency: number; cost: number }> => {
    const decision = routeTask(task, options);
    const startTime = Date.now();
    
    const tryProvider = async (provider: AIProvider, model: string): Promise<T> => {
      try {
        const result = await executeFn(provider, model);
        
        // Update success metrics
        setMetrics(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            totalCalls: prev[provider].totalCalls + 1,
            avgLatency: (prev[provider].avgLatency * prev[provider].totalCalls + (Date.now() - startTime)) / (prev[provider].totalCalls + 1),
            successRate: (prev[provider].successRate * prev[provider].totalCalls + 1) / (prev[provider].totalCalls + 1),
            totalCost: prev[provider].totalCost + decision.estimatedCost
          }
        }));

        setLoadBalancing(prev => ({
          ...prev,
          [provider]: prev[provider] + 1
        }));

        return result;
      } catch (error) {
        console.error(`Provider ${provider} failed:`, error);
        
        // Update failure metrics
        setMetrics(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            totalCalls: prev[provider].totalCalls + 1,
            failedCalls: prev[provider].failedCalls + 1,
            successRate: (prev[provider].successRate * prev[provider].totalCalls) / (prev[provider].totalCalls + 1)
          }
        }));

        throw error;
      }
    };

    // Try primary provider
    try {
      const result = await tryProvider(decision.provider, decision.model);
      const latency = Date.now() - startTime;
      return { result, provider: decision.provider, latency, cost: decision.estimatedCost };
    } catch (primaryError) {
      console.log(`Primary provider failed, trying fallbacks...`);
      
      // Try fallback providers
      for (const fallbackProvider of decision.fallbacks) {
        try {
          const fallbackDecision = routeTask(task, { ...options, priority: 'speed' });
          const result = await tryProvider(fallbackProvider, fallbackDecision.model);
          const latency = Date.now() - startTime;
          return { result, provider: fallbackProvider, latency, cost: fallbackDecision.estimatedCost };
        } catch (fallbackError) {
          console.log(`Fallback provider ${fallbackProvider} failed, trying next...`);
          continue;
        }
      }
      
      throw new Error('All providers failed');
    }
  }, [routeTask]);

  const resetMetrics = useCallback(() => {
    setMetrics({
      lovable: { provider: 'lovable', successRate: 0.95, avgLatency: 1200, totalCalls: 0, failedCalls: 0, totalCost: 0 },
      huggingface: { provider: 'huggingface', successRate: 0.92, avgLatency: 2500, totalCalls: 0, failedCalls: 0, totalCost: 0 },
      browser: { provider: 'browser', successRate: 0.98, avgLatency: 800, totalCalls: 0, failedCalls: 0, totalCost: 0 }
    });
    setLoadBalancing({
      lovable: 0,
      huggingface: 0,
      browser: 0
    });
  }, []);

  const getMetrics = useCallback(() => metrics, [metrics]);
  const getLoadBalancing = useCallback(() => loadBalancing, [loadBalancing]);

  return {
    routeTask,
    executeWithFallback,
    getMetrics,
    getLoadBalancing,
    resetMetrics
  };
};
