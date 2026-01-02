import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TemporalScore {
  id: string;
  memory_id: string;
  access_count: number;
  importance_score: number;
  last_accessed: string;
  calculated_relevance: number;
}

interface Memory {
  id: string;
  content: any;
  created_at: string;
  temporal_relevance?: number;
}

export const useTemporalMemory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateMemoryAccess = useCallback(async (memoryId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("memory_temporal_scores")
        .upsert({
          user_id: user.id,
          memory_id: memoryId,
          access_count: 1,
          last_accessed: new Date().toISOString(),
        }, {
          onConflict: 'user_id,memory_id',
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating memory access:", error);
    }
  }, [user]);

  const getTemporalScores = useCallback(async (): Promise<TemporalScore[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from("memory_temporal_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("calculated_relevance", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching temporal scores:", error);
      return [];
    }
  }, [user]);

  const searchWithTemporal = useCallback(async (query: string, limit: number = 10): Promise<Memory[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mem0-memory", {
        body: {
          action: "search",
          query,
          limit,
        },
      });

      if (error) throw error;

      return data?.result?.results || [];
    } catch (error) {
      console.error("Error searching with temporal:", error);
      toast.error("Failed to search memories");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getAllMemoriesWithTemporal = useCallback(async (): Promise<Memory[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mem0-memory", {
        body: {
          action: "get",
        },
      });

      if (error) throw error;

      return data?.result?.results || [];
    } catch (error) {
      console.error("Error fetching memories:", error);
      toast.error("Failed to fetch memories");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    updateMemoryAccess,
    getTemporalScores,
    searchWithTemporal,
    getAllMemoriesWithTemporal,
  };
};
