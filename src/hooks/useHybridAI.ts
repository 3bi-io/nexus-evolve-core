import { useState } from "react";
import { pipeline } from "@huggingface/transformers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isBrowserAISupported } from "@/lib/csp-detector";

export type AIProvider = "browser" | "server";

export const useHybridAI = () => {
  const [provider, setProvider] = useState<AIProvider>("browser");
  const [loading, setLoading] = useState(false);

  const detectBrowserCapabilities = async () => {
    // First check CSP support
    if (!isBrowserAISupported()) {
      console.info('[Hybrid AI] Browser AI blocked by CSP');
      return false;
    }

    try {
      const nav = navigator as any;
      if (!nav.gpu) {
        return false;
      }
      const adapter = await nav.gpu.requestAdapter();
      return !!adapter;
    } catch {
      return false;
    }
  };

  const generateTextBrowser = async (prompt: string) => {
    try {
      const generator = await pipeline(
        "text-generation",
        "Xenova/gpt2",
        { device: "webgpu" }
      );
      const result = await generator(prompt, { max_new_tokens: 50 });
      const output: any = Array.isArray(result) ? result[0] : result;
      return output.generated_text || "";
    } catch (error) {
      console.error("Browser generation error:", error);
      throw error;
    }
  };

  const generateTextServer = async (prompt: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("huggingface-inference", {
        body: {
          modelId: "meta-llama/Llama-3.2-3B-Instruct",
          task: "text-generation",
          inputs: prompt,
          parameters: { max_new_tokens: 100 }
        }
      });

      if (error) throw error;
      return data.result;
    } catch (error) {
      console.error("Server generation error:", error);
      throw error;
    }
  };

  const generateText = async (prompt: string, preferredProvider?: AIProvider) => {
    setLoading(true);
    const useProvider = preferredProvider || provider;

    try {
      if (useProvider === "browser") {
        const hasWebGPU = await detectBrowserCapabilities();
        if (!hasWebGPU) {
          toast.info("WebGPU not available, falling back to server");
          return await generateTextServer(prompt);
        }
        return await generateTextBrowser(prompt);
      } else {
        return await generateTextServer(prompt);
      }
    } catch (error) {
      // Fallback to alternative provider
      const fallbackProvider = useProvider === "browser" ? "server" : "browser";
      toast.info(`Falling back to ${fallbackProvider}`);
      
      if (fallbackProvider === "server") {
        return await generateTextServer(prompt);
      } else {
        return await generateTextBrowser(prompt);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    provider,
    setProvider,
    loading,
    generateText,
    detectBrowserCapabilities
  };
};
