import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RouterPreferences {
  default_priority: 'speed' | 'cost' | 'quality' | 'privacy';
  max_cost_per_request?: number;
  max_latency_ms?: number;
  preferred_providers: string[];
  blocked_providers: string[];
  custom_rules: CustomRule[];
  cost_alert_threshold?: number;
}

export interface CustomRule {
  id: string;
  name: string;
  condition: {
    task_type?: string;
    time_of_day?: { start: string; end: string };
    cost_threshold?: number;
  };
  action: {
    provider?: string;
    priority?: string;
    max_cost?: number;
  };
  enabled: boolean;
}

export interface ABTest {
  id: string;
  test_name: string;
  variant_a_config: { provider: string; model: string };
  variant_b_config: { provider: string; model: string };
  active: boolean;
  started_at: string;
  ended_at?: string;
  variant_a_calls: number;
  variant_b_calls: number;
  variant_a_success: number;
  variant_b_success: number;
  variant_a_avg_latency: number;
  variant_b_avg_latency: number;
  variant_a_total_cost: number;
  variant_b_total_cost: number;
  winner?: string;
}

export interface CostAlert {
  id: string;
  alert_type: string;
  threshold_amount: number;
  current_amount: number;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  triggered_at?: string;
  acknowledged_at?: string;
  active: boolean;
}

export const useEnterpriseRouter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<RouterPreferences | null>(null);
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [costAlerts, setcostAlerts] = useState<CostAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_router_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          default_priority: data.default_priority as any,
          max_cost_per_request: data.max_cost_per_request,
          max_latency_ms: data.max_latency_ms,
          preferred_providers: (data.preferred_providers as any) || [],
          blocked_providers: (data.blocked_providers as any) || [],
          custom_rules: (data.custom_rules as any) || [],
          cost_alert_threshold: data.cost_alert_threshold
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, [user]);

  // Save preferences
  const savePreferences = useCallback(async (prefs: RouterPreferences) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_router_preferences')
        .upsert({
          user_id: user.id,
          default_priority: prefs.default_priority,
          max_cost_per_request: prefs.max_cost_per_request,
          max_latency_ms: prefs.max_latency_ms,
          preferred_providers: prefs.preferred_providers as any,
          blocked_providers: prefs.blocked_providers as any,
          custom_rules: prefs.custom_rules as any,
          cost_alert_threshold: prefs.cost_alert_threshold
        });

      if (error) throw error;

      setPreferences(prefs);
      toast({
        title: "Preferences Saved",
        description: "Router preferences updated successfully"
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save preferences",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Load A/B tests
  const loadABTests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('router_ab_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAbTests((data || []) as any);
    } catch (error) {
      console.error('Error loading A/B tests:', error);
    }
  }, [user]);

  // Create A/B test
  const createABTest = useCallback(async (
    testName: string,
    variantA: { provider: string; model: string },
    variantB: { provider: string; model: string }
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('router_ab_tests')
        .insert({
          user_id: user.id,
          test_name: testName,
          variant_a_config: variantA,
          variant_b_config: variantB,
          active: true
        })
        .select()
        .single();

      if (error) throw error;

      setAbTests(prev => [data as any, ...prev]);
      toast({
        title: "A/B Test Created",
        description: `Started testing ${variantA.provider} vs ${variantB.provider}`
      });

      return data;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create A/B test",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // End A/B test
  const endABTest = useCallback(async (testId: string, winner?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('router_ab_tests')
        .update({
          active: false,
          ended_at: new Date().toISOString(),
          winner
        })
        .eq('id', testId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadABTests();
      toast({
        title: "Test Ended",
        description: winner ? `Winner: ${winner}` : "Test ended without declaring a winner"
      });
    } catch (error) {
      console.error('Error ending A/B test:', error);
      toast({
        title: "Update Failed",
        description: "Failed to end A/B test",
        variant: "destructive"
      });
    }
  }, [user, toast, loadABTests]);

  // Load cost alerts
  const loadCostAlerts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('router_cost_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setcostAlerts((data || []) as any);
    } catch (error) {
      console.error('Error loading cost alerts:', error);
    }
  }, [user]);

  // Create cost alert
  const createCostAlert = useCallback(async (
    alertType: string,
    threshold: number,
    period: 'hourly' | 'daily' | 'weekly' | 'monthly'
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('router_cost_alerts')
        .insert({
          user_id: user.id,
          alert_type: alertType,
          threshold_amount: threshold,
          period,
          active: true
        })
        .select()
        .single();

      if (error) throw error;

      setcostAlerts(prev => [data as any, ...prev]);
      toast({
        title: "Alert Created",
        description: `Will notify when ${alertType} exceeds $${threshold}`
      });

      return data;
    } catch (error) {
      console.error('Error creating cost alert:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create cost alert",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Log analytics
  const logAnalytics = useCallback(async (analytics: {
    provider: string;
    task_type: string;
    model_used: string;
    priority: string;
    success: boolean;
    latency_ms: number;
    cost: number;
    fallback_used: boolean;
    ab_test_id?: string;
    metadata?: any;
  }) => {
    if (!user) return;

    try {
      await supabase
        .from('router_analytics')
        .insert({
          user_id: user.id,
          ...analytics
        });
    } catch (error) {
      console.error('Error logging analytics:', error);
    }
  }, [user]);

  // Get analytics
  const getAnalytics = useCallback(async (
    startDate?: Date,
    endDate?: Date
  ) => {
    if (!user) return [];

    try {
      let query = supabase
        .from('router_analytics')
        .select('*')
        .eq('user_id', user.id);

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting analytics:', error);
      return [];
    }
  }, [user]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadPreferences(),
        loadABTests(),
        loadCostAlerts()
      ]);
      setLoading(false);
    };

    if (user) {
      init();
    }
  }, [user, loadPreferences, loadABTests, loadCostAlerts]);

  return {
    preferences,
    savePreferences,
    abTests,
    createABTest,
    endABTest,
    costAlerts,
    createCostAlert,
    logAnalytics,
    getAnalytics,
    loading
  };
};
