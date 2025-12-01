import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loadTransformers } from "@/lib/transformers-loader";
import { isBrowserAISupported } from "@/lib/csp-detector";

// Unified types
export type AIProvider = "lovable" | "huggingface" | "browser";
export type TaskType = "chat" | "embedding" | "classification" | "image-gen" | "object-detection" | "captioning" | "text-generation";

export interface RouterOptions {
  priority?: "speed" | "cost" | "quality" | "privacy";
  maxCost?: number;
  maxLatency?: number;
  preferredProvider?: AIProvider;
  requiresAuth?: boolean;
}

export interface RouteDecision {
  provider: AIProvider;
  model: string;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
  fallbacks: AIProvider[];
}

export interface ProviderMetrics {
  provider: AIProvider;
  successRate: number;
  avgLatency: number;
  totalCalls: number;
  failedCalls: number;
  totalCost: number;
  lastUsed: Date | null;
}

export interface AIResponse<T = any> {
  result: T;
  provider: AIProvider;
  model: string;
  latency: number;
  cost: number;
  fromCache?: boolean;
}

/**
 * Unified AI Router Hook
 * Combines functionality from useSmartAIRouter and useAdvancedRouter
 * Provides intelligent routing across Lovable, HuggingFace, and Browser AI
 */
export const useUnifiedAIRouter = () => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<Record<AIProvider, ProviderMetrics>>({
    lovable: {
      provider: "lovable",
      successRate: 0.95,
      avgLatency: 1200,
      totalCalls: 0,
      failedCalls: 0,
      totalCost: 0,
      lastUsed: null,
    },
    huggingface: {
      provider: "huggingface",
      successRate: 0.92,
      avgLatency: 2500,
      totalCalls: 0,
      failedCalls: 0,
      totalCost: 0,
      lastUsed: null,
    },
    browser: {
      provider: "browser",
      successRate: 0.98,
      avgLatency: 800,
      totalCalls: 0,
      failedCalls: 0,
      totalCost: 0,
      lastUsed: null,
    },
  });

  // Detect WebGPU capability
  const detectWebGPU = useCallback(async (): Promise<boolean> => {
    // Check CSP first
    if (!isBrowserAISupported()) {
      return false;
    }

    try {
      const nav = navigator as any;
      if (!nav.gpu) return false;
      const adapter = await nav.gpu.requestAdapter();
      return !!adapter;
    } catch {
      return false;
    }
  }, []);

  // Intelligent routing logic
  const routeTask = useCallback(
    async (task: TaskType, options: RouterOptions = {}): Promise<RouteDecision> => {
      const { priority = "quality", maxCost, maxLatency, preferredProvider, requiresAuth = false } = options;

      // Check preferred provider first
      if (preferredProvider) {
        if (preferredProvider === "browser") {
          const hasWebGPU = await detectWebGPU();
          if (!hasWebGPU) {
            toast.info("Browser AI unavailable, routing to alternative");
          } else {
            return createDecision(preferredProvider, task, priority);
          }
        } else {
          return createDecision(preferredProvider, task, priority);
        }
      }

      // Smart routing based on task and priority
      const hasWebGPU = await detectWebGPU();

      switch (task) {
        case "embedding":
          if ((priority === "privacy" || priority === "cost") && hasWebGPU) {
            return {
              provider: "browser",
              model: "Xenova/all-MiniLM-L6-v2",
              reason: "Free and private in-browser processing",
              estimatedCost: 0,
              estimatedLatency: metrics.browser.avgLatency,
              fallbacks: ["huggingface", "lovable"],
            };
          }
          if (priority === "speed" && hasWebGPU) {
            return {
              provider: "browser",
              model: "Xenova/all-MiniLM-L6-v2",
              reason: "Fastest with WebGPU acceleration",
              estimatedCost: 0,
              estimatedLatency: metrics.browser.avgLatency,
              fallbacks: ["huggingface", "lovable"],
            };
          }
          return {
            provider: "huggingface",
            model: "sentence-transformers/all-MiniLM-L6-v2",
            reason: "Reliable server-side embeddings",
            estimatedCost: 0.0001,
            estimatedLatency: 1500,
            fallbacks: ["lovable"],
          };

        case "classification":
          if (hasWebGPU && (priority === "privacy" || priority === "cost" || priority === "speed")) {
            return {
              provider: "browser",
              model: "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
              reason: "Fast, free, and private classification",
              estimatedCost: 0,
              estimatedLatency: metrics.browser.avgLatency,
              fallbacks: ["huggingface", "lovable"],
            };
          }
          return {
            provider: "huggingface",
            model: "facebook/bart-large-mnli",
            reason: "High-quality classification",
            estimatedCost: 0.0001,
            estimatedLatency: 1800,
            fallbacks: ["lovable"],
          };

        case "chat":
        case "text-generation":
          if (priority === "speed") {
            return {
              provider: "lovable",
              model: "google/gemini-2.5-flash",
              reason: "Fastest API response for chat",
              estimatedCost: 0.0002,
              estimatedLatency: metrics.lovable.avgLatency,
              fallbacks: ["huggingface"],
            };
          }
          if (priority === "cost" && !requiresAuth) {
            return {
              provider: "huggingface",
              model: "meta-llama/Llama-3.2-3B-Instruct",
              reason: "Cost-effective generation",
              estimatedCost: 0.0001,
              estimatedLatency: 2500,
              fallbacks: ["lovable"],
            };
          }
          if (priority === "quality") {
            return {
              provider: "lovable",
              model: "google/gemini-2.5-pro",
              reason: "Highest quality responses",
              estimatedCost: 0.0005,
              estimatedLatency: 1800,
              fallbacks: ["huggingface"],
            };
          }
          return {
            provider: "lovable",
            model: "google/gemini-2.5-flash",
            reason: "Balanced quality and speed",
            estimatedCost: 0.0002,
            estimatedLatency: 1200,
            fallbacks: ["huggingface"],
          };

        case "image-gen":
          if (priority === "quality") {
            return {
              provider: "lovable",
              model: "google/gemini-2.5-flash-image",
              reason: "Highest quality image generation",
              estimatedCost: 0.004,
              estimatedLatency: 3000,
              fallbacks: ["huggingface"],
            };
          }
          return {
            provider: "huggingface",
            model: "black-forest-labs/FLUX.1-schnell",
            reason: "Fast and cost-effective images",
            estimatedCost: 0.001,
            estimatedLatency: 2000,
            fallbacks: ["lovable"],
          };

        case "object-detection":
          if (!hasWebGPU) {
            throw new Error("Object detection requires WebGPU support");
          }
          return {
            provider: "browser",
            model: "Xenova/detr-resnet-50",
            reason: "Browser-only object detection",
            estimatedCost: 0,
            estimatedLatency: metrics.browser.avgLatency * 2,
            fallbacks: [],
          };

        case "captioning":
          if (!hasWebGPU) {
            throw new Error("Image captioning requires WebGPU support");
          }
          return {
            provider: "browser",
            model: "Xenova/vit-gpt2-image-captioning",
            reason: "Browser-only captioning",
            estimatedCost: 0,
            estimatedLatency: metrics.browser.avgLatency * 2,
            fallbacks: [],
          };

        default:
          return {
            provider: "lovable",
            model: "google/gemini-2.5-flash",
            reason: "Default provider",
            estimatedCost: 0.0002,
            estimatedLatency: 1200,
            fallbacks: ["huggingface"],
          };
      }
    },
    [metrics, detectWebGPU]
  );

  // Execute browser AI
  const executeBrowserAI = useCallback(async (model: string, task: TaskType, input: any): Promise<any> => {
    const transformers = await loadTransformers();
    if (!transformers) {
      throw new Error('Transformers.js unavailable');
    }

    switch (task) {
      case "embedding":
        const extractor = await transformers.pipeline("feature-extraction", model, { device: "webgpu" });
        const embedResult = await extractor(input, { pooling: "mean", normalize: true });
        return embedResult.tolist();

      case "classification":
        const classifier = await transformers.pipeline("zero-shot-classification", model, { device: "webgpu" });
        const labels = input.labels || ["positive", "negative", "neutral"];
        const classResult = await classifier(input.text || input, labels);
        return Array.isArray(classResult) ? classResult[0] : classResult;

      case "object-detection":
        const detector = await transformers.pipeline("object-detection", model, { device: "webgpu" });
        return await detector(input);

      case "captioning":
        const captioner = await transformers.pipeline("image-to-text", model, { device: "webgpu" });
        return await captioner(input);

      default:
        throw new Error(`Task ${task} not supported in browser`);
    }
  }, []);

  // Execute server AI
  const executeServerAI = useCallback(
    async (provider: "lovable" | "huggingface", model: string, task: TaskType, input: any): Promise<any> => {
      if (provider === "lovable") {
        const { data, error } = await supabase.functions.invoke("lovable-ai-router", {
          body: { task, input, model },
        });
        if (error) throw error;
        return data.result;
      } else {
        const { data, error } = await supabase.functions.invoke("huggingface-inference", {
          body: { modelId: model, task, inputs: input },
        });
        if (error) throw error;
        return data.result;
      }
    },
    []
  );

  // Main execution with fallback
  const executeAI = useCallback(
    async <T = any>(task: TaskType, input: any, options: RouterOptions = {}): Promise<AIResponse<T>> => {
      setLoading(true);
      const startTime = performance.now();

      try {
        const decision = await routeTask(task, options);

        const tryProvider = async (provider: AIProvider, model: string): Promise<T> => {
          if (provider === "browser") {
            return await executeBrowserAI(model, task, input);
          } else {
            return await executeServerAI(provider, model, task, input);
          }
        };

        // Try primary provider
        try {
          const result = await tryProvider(decision.provider, decision.model);
          const latency = performance.now() - startTime;

          // Update metrics
          setMetrics((prev) => ({
            ...prev,
            [decision.provider]: {
              ...prev[decision.provider],
              totalCalls: prev[decision.provider].totalCalls + 1,
              avgLatency:
                (prev[decision.provider].avgLatency * prev[decision.provider].totalCalls + latency) /
                (prev[decision.provider].totalCalls + 1),
              successRate:
                (prev[decision.provider].successRate * prev[decision.provider].totalCalls + 1) /
                (prev[decision.provider].totalCalls + 1),
              totalCost: prev[decision.provider].totalCost + decision.estimatedCost,
              lastUsed: new Date(),
            },
          }));

          toast.success(`Completed via ${decision.provider} in ${latency.toFixed(0)}ms`);

          return {
            result,
            provider: decision.provider,
            model: decision.model,
            latency,
            cost: decision.estimatedCost,
          };
        } catch (primaryError) {
          console.error(`Primary provider ${decision.provider} failed:`, primaryError);

          // Update failure metrics
          setMetrics((prev) => ({
            ...prev,
            [decision.provider]: {
              ...prev[decision.provider],
              totalCalls: prev[decision.provider].totalCalls + 1,
              failedCalls: prev[decision.provider].failedCalls + 1,
              successRate:
                (prev[decision.provider].successRate * prev[decision.provider].totalCalls) /
                (prev[decision.provider].totalCalls + 1),
            },
          }));

          // Try fallbacks
          for (const fallbackProvider of decision.fallbacks) {
            try {
              toast.info(`Trying ${fallbackProvider} as fallback...`);
              const fallbackDecision = await routeTask(task, { ...options, preferredProvider: fallbackProvider });
              const result = await tryProvider(fallbackProvider, fallbackDecision.model);
              const latency = performance.now() - startTime;

              setMetrics((prev) => ({
                ...prev,
                [fallbackProvider]: {
                  ...prev[fallbackProvider],
                  totalCalls: prev[fallbackProvider].totalCalls + 1,
                  avgLatency:
                    (prev[fallbackProvider].avgLatency * prev[fallbackProvider].totalCalls + latency) /
                    (prev[fallbackProvider].totalCalls + 1),
                  successRate:
                    (prev[fallbackProvider].successRate * prev[fallbackProvider].totalCalls + 1) /
                    (prev[fallbackProvider].totalCalls + 1),
                  totalCost: prev[fallbackProvider].totalCost + fallbackDecision.estimatedCost,
                  lastUsed: new Date(),
                },
              }));

              toast.success(`Completed via fallback ${fallbackProvider}`);

              return {
                result,
                provider: fallbackProvider,
                model: fallbackDecision.model,
                latency,
                cost: fallbackDecision.estimatedCost,
              };
            } catch (fallbackError) {
              console.error(`Fallback ${fallbackProvider} failed:`, fallbackError);
              continue;
            }
          }

          throw new Error("All providers failed");
        }
      } catch (error) {
        toast.error("AI execution failed");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [routeTask, executeBrowserAI, executeServerAI]
  );

  // Utility functions
  const resetMetrics = useCallback(() => {
    setMetrics({
      lovable: {
        provider: "lovable",
        successRate: 0.95,
        avgLatency: 1200,
        totalCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        lastUsed: null,
      },
      huggingface: {
        provider: "huggingface",
        successRate: 0.92,
        avgLatency: 2500,
        totalCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        lastUsed: null,
      },
      browser: {
        provider: "browser",
        successRate: 0.98,
        avgLatency: 800,
        totalCalls: 0,
        failedCalls: 0,
        totalCost: 0,
        lastUsed: null,
      },
    });
  }, []);

  const getMetrics = useCallback(() => metrics, [metrics]);

  const getLoadBalancing = useMemo(() => {
    const total = Object.values(metrics).reduce((sum, m) => sum + m.totalCalls, 0);
    if (total === 0) return { lovable: 0, huggingface: 0, browser: 0 };
    return {
      lovable: Math.round((metrics.lovable.totalCalls / total) * 100),
      huggingface: Math.round((metrics.huggingface.totalCalls / total) * 100),
      browser: Math.round((metrics.browser.totalCalls / total) * 100),
    };
  }, [metrics]);

  return {
    executeAI,
    routeTask,
    loading,
    metrics,
    getMetrics,
    getLoadBalancing,
    resetMetrics,
    detectWebGPU,
  };
};

// Helper function
function createDecision(provider: AIProvider, task: TaskType, priority: string): RouteDecision {
  const modelMaps = {
    lovable: {
      chat: "google/gemini-2.5-flash",
      "text-generation": "google/gemini-2.5-flash",
      embedding: "google/gemini-2.5-flash",
      classification: "google/gemini-2.5-flash",
      "image-gen": "google/gemini-2.5-flash-image",
    },
    huggingface: {
      chat: "meta-llama/Llama-3.2-3B-Instruct",
      "text-generation": "meta-llama/Llama-3.2-3B-Instruct",
      embedding: "sentence-transformers/all-MiniLM-L6-v2",
      classification: "facebook/bart-large-mnli",
      "image-gen": "black-forest-labs/FLUX.1-schnell",
    },
    browser: {
      embedding: "mixedbread-ai/mxbai-embed-xsmall-v1",
      classification: "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
      "object-detection": "Xenova/detr-resnet-50",
      captioning: "Xenova/vit-gpt2-image-captioning",
    },
  };

  const model = (modelMaps[provider] as any)[task] || "google/gemini-2.5-flash";
  const costs = { lovable: 0.0002, huggingface: 0.0001, browser: 0 };
  const latencies = { lovable: 1200, huggingface: 2000, browser: 800 };

  return {
    provider,
    model,
    reason: `User preferred ${provider}`,
    estimatedCost: costs[provider],
    estimatedLatency: latencies[provider],
    fallbacks: provider === "browser" ? ["huggingface", "lovable"] : provider === "lovable" ? ["huggingface"] : ["lovable"],
  };
}
