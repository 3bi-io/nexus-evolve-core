import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

type ValidationResult = {
  valid: boolean;
  error?: string;
  lastChecked: string;
  endpoint?: string;
};

type ValidationResponse = {
  valid: boolean;
  results: Record<string, ValidationResult>;
  timestamp: string;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    notConfigured: number;
  };
};

export const useSecretValidation = () => {
  const { user } = useAuth();

  const { data: validation, isLoading, error, refetch } = useQuery<ValidationResponse>({
    queryKey: ['secret-validation', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('validate-secrets');

      if (error) throw error;
      return data as ValidationResponse;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    retry: 2,
  });

  // Show toast notification for critical missing keys on initial load
  useEffect(() => {
    if (validation && !validation.valid) {
      const criticalKeys = ['OPENAI_API_KEY', 'LOVABLE_API_KEY'];
      const missingCritical = criticalKeys.filter(
        key => validation.results[key]?.error === 'Not configured'
      );

      if (missingCritical.length > 0) {
        toast.warning('API Configuration Required', {
          description: `${missingCritical.length} critical API key(s) need configuration`,
          duration: 5000,
        });
      }
    }
  }, [validation?.valid]);

  return {
    validation,
    isLoading,
    error,
    refetch,
    hasIssues: validation ? !validation.valid : false,
    criticalIssues: validation 
      ? Object.entries(validation.results ?? {})
          .filter(([key, result]) => 
            ['OPENAI_API_KEY', 'LOVABLE_API_KEY'].includes(key) && !result?.valid
          )
          .length
      : 0,
  };
};
