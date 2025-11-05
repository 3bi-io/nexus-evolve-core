import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgentConfig {
  name: string;
  conversation_config?: {
    agent?: {
      prompt?: { prompt?: string };
      first_message?: string;
      language?: string;
    };
    tts?: {
      voice_id?: string;
    };
  };
}

interface Agent extends AgentConfig {
  agent_id: string;
}

export const useElevenLabsAgents = () => {
  const queryClient = useQueryClient();

  const { data: agents, isLoading } = useQuery({
    queryKey: ['elevenlabs-agents'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('elevenlabs-agents', {
        body: { action: 'list' },
      });

      if (error) throw error;
      return data as Agent[];
    },
  });

  const { data: voices } = useQuery({
    queryKey: ['elevenlabs-voices'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('elevenlabs-agents', {
        body: { action: 'voices' },
      });

      if (error) throw error;
      return data.voices as Array<{ voice_id: string; name: string }>;
    },
  });

  const createAgent = useMutation({
    mutationFn: async (config: AgentConfig) => {
      const { data, error } = await supabase.functions.invoke('elevenlabs-agents', {
        body: { action: 'create', ...config },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elevenlabs-agents'] });
      toast.success('Agent created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create agent', {
        description: error.message,
      });
    },
  });

  const updateAgent = useMutation({
    mutationFn: async ({ agentId, ...config }: AgentConfig & { agentId: string }) => {
      const { data, error } = await supabase.functions.invoke('elevenlabs-agents', {
        body: { action: 'update', agentId, ...config },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elevenlabs-agents'] });
      toast.success('Agent updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update agent', {
        description: error.message,
      });
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (agentId: string) => {
      const { data, error } = await supabase.functions.invoke('elevenlabs-agents', {
        body: { action: 'delete', agentId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elevenlabs-agents'] });
      toast.success('Agent deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete agent', {
        description: error.message,
      });
    },
  });

  return {
    agents,
    voices,
    isLoading,
    createAgent,
    updateAgent,
    deleteAgent,
  };
};
