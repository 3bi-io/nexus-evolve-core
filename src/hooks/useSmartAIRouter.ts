import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pipeline } from "@huggingface/transformers";

export type AIProvider = "lovable" | "huggingface-server" | "browser";
export type AITask = "text-generation" | "text-to-image" | "embeddings" | "classification";

interface AIRequest {
  task: AITask;
  input: string;
  model?: string;
  preferredProvider?: AIProvider;
  maxCost?: number; // Maximum cost in credits
}

interface AIResponse {
  result: any;
  provider: AIProvider;
  model: string;
  latency: number;
  cost: number;
}

export const useSmartAIRouter = () => {
  const [loading, setLoading] = useState(false);

  // Detect browser capabilities
  const detectWebGPU = useCallback(async () => {
    try {
      const nav = navigator as any;
      if (!nav.gpu) return false;
      const adapter = await nav.gpu.requestAdapter();
      return !!adapter;
    } catch {
      return false;
    }
  }, []);

  // Route based on task, cost, and availability
  const routeRequest = useCallback(async (request: AIRequest): Promise<AIProvider> => {
    const { task, preferredProvider, maxCost } = request;

    // If user has preference, try that first
    if (preferredProvider) {
      if (preferredProvider === "browser") {
        const hasWebGPU = await detectWebGPU();
        if (hasWebGPU) return "browser";
        toast.info("Browser AI unavailable, routing to best alternative");
      } else {
        return preferredProvider;
      }
    }

    // Smart routing based on task and constraints
    switch (task) {
      case "embeddings":
        // Browser is best for embeddings (free, fast, private)
        const hasWebGPU = await detectWebGPU();
        if (hasWebGPU) return "browser";
        // Fallback to HuggingFace for cost efficiency
        return maxCost && maxCost < 0.0001 ? "huggingface-server" : "lovable";

      case "classification":
        // Browser is best for classification
        if (await detectWebGPU()) return "browser";
        return "huggingface-server";

      case "text-generation":
        // Lovable AI for quality, HuggingFace for cost
        return maxCost && maxCost < 0.001 ? "huggingface-server" : "lovable";

      case "text-to-image":
        // HuggingFace for cost, Lovable for quality
        return maxCost && maxCost < 0.005 ? "huggingface-server" : "lovable";

      default:
        return "lovable";
    }
  }, [detectWebGPU]);

  // Execute browser AI
  const executeBrowserAI = useCallback(async (request: AIRequest): Promise<AIResponse> => {
    const startTime = performance.now();

    try {
      let result;
      let model;

      switch (request.task) {
        case "embeddings":
          model = "Xenova/all-MiniLM-L6-v2";
          const extractor = await pipeline("feature-extraction", model, { device: "webgpu" });
          const embedResult = await extractor(request.input, { pooling: "mean", normalize: true });
          result = embedResult.tolist();
          break;

        case "classification":
          model = "Xenova/distilbert-base-uncased-mnli";
          const classifier = await pipeline("zero-shot-classification", model, { device: "webgpu" });
          const labels = ["positive", "negative", "neutral"];
          const classResult = await classifier(request.input, labels);
          result = Array.isArray(classResult) ? classResult[0] : classResult;
          break;

        default:
          throw new Error(`Task ${request.task} not supported in browser`);
      }

      const latency = performance.now() - startTime;

      return {
        result,
        provider: "browser",
        model: model!,
        latency,
        cost: 0 // Browser AI is free
      };
    } catch (error) {
      console.error("Browser AI error:", error);
      throw error;
    }
  }, []);

  // Execute server AI (Lovable or HuggingFace)
  const executeServerAI = useCallback(async (
    provider: "lovable" | "huggingface-server",
    request: AIRequest
  ): Promise<AIResponse> => {
    const startTime = performance.now();

    try {
      let result;
      let model;
      let cost = 0;

      if (provider === "lovable") {
        // Use Lovable AI
        const modelMap: Record<AITask, string> = {
          "text-generation": "google/gemini-2.5-flash",
          "text-to-image": "google/gemini-2.5-flash-image",
          "embeddings": "google/gemini-2.5-flash-lite",
          "classification": "google/gemini-2.5-flash-lite"
        };
        model = request.model || modelMap[request.task];

        // Call through edge function (to be created)
        const { data, error } = await supabase.functions.invoke("lovable-ai-router", {
          body: {
            task: request.task,
            input: request.input,
            model
          }
        });

        if (error) throw error;
        result = data.result;
        cost = data.cost || 0.001;
      } else {
        // Use HuggingFace
        const modelMap: Record<AITask, string> = {
          "text-generation": "meta-llama/Llama-3.2-3B-Instruct",
          "text-to-image": "stabilityai/stable-diffusion-xl-base-1.0",
          "embeddings": "sentence-transformers/all-MiniLM-L6-v2",
          "classification": "facebook/bart-large-mnli"
        };
        model = request.model || modelMap[request.task];

        const { data, error } = await supabase.functions.invoke("huggingface-inference", {
          body: {
            modelId: model,
            task: request.task,
            inputs: request.input
          }
        });

        if (error) throw error;
        result = data.result;
        cost = data.cost || 0;
      }

      const latency = performance.now() - startTime;

      return {
        result,
        provider,
        model,
        latency,
        cost
      };
    } catch (error) {
      console.error(`${provider} AI error:`, error);
      throw error;
    }
  }, []);

  // Main routing function
  const executeAI = useCallback(async (request: AIRequest): Promise<AIResponse> => {
    setLoading(true);

    try {
      // Route to best provider
      const provider = await routeRequest(request);

      let response: AIResponse;

      if (provider === "browser") {
        try {
          response = await executeBrowserAI(request);
        } catch (error) {
          // Fallback to HuggingFace
          toast.info("Browser AI failed, falling back to server");
          response = await executeServerAI("huggingface-server", request);
        }
      } else {
        try {
          response = await executeServerAI(provider, request);
        } catch (error) {
          // Try alternative provider
          const fallback = provider === "lovable" ? "huggingface-server" : "lovable";
          toast.info(`${provider} failed, trying ${fallback}`);
          response = await executeServerAI(fallback, request);
        }
      }

      toast.success(`Completed via ${response.provider} in ${response.latency.toFixed(0)}ms`);
      return response;
    } catch (error) {
      toast.error("All AI providers failed");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [routeRequest, executeBrowserAI, executeServerAI]);

  return {
    executeAI,
    loading,
    detectWebGPU
  };
};
