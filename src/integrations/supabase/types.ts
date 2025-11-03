export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ab_experiments: {
        Row: {
          active: boolean | null
          created_at: string
          ended_at: string | null
          experiment_name: string
          id: string
          metrics: Json | null
          started_at: string
          user_id: string
          variant: string
          winner: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          ended_at?: string | null
          experiment_name: string
          id?: string
          metrics?: Json | null
          started_at?: string
          user_id: string
          variant: string
          winner?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          ended_at?: string | null
          experiment_name?: string
          id?: string
          metrics?: Json | null
          started_at?: string
          user_id?: string
          variant?: string
          winner?: string | null
        }
        Relationships: []
      }
      achievement_definitions: {
        Row: {
          achievement_key: string
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          target_value: number
        }
        Insert: {
          achievement_key: string
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          target_value?: number
        }
        Update: {
          achievement_key?: string
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          target_value?: number
        }
        Relationships: []
      }
      adaptive_behaviors: {
        Row: {
          active: boolean | null
          application_count: number | null
          behavior_type: string
          created_at: string
          created_from: string | null
          description: string
          effectiveness_score: number | null
          id: string
          last_applied_at: string | null
          metadata: Json | null
          sample_interaction_ids: string[] | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          application_count?: number | null
          behavior_type: string
          created_at?: string
          created_from?: string | null
          description: string
          effectiveness_score?: number | null
          id?: string
          last_applied_at?: string | null
          metadata?: Json | null
          sample_interaction_ids?: string[] | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          application_count?: number | null
          behavior_type?: string
          created_at?: string
          created_from?: string | null
          description?: string
          effectiveness_score?: number | null
          id?: string
          last_applied_at?: string | null
          metadata?: Json | null
          sample_interaction_ids?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      agent_collaborations: {
        Row: {
          agents_involved: string[]
          collaboration_type: string
          created_at: string | null
          duration_ms: number | null
          id: string
          quality_score: number | null
          session_id: string | null
          synthesis_result: Json | null
          task_description: string
          user_id: string
        }
        Insert: {
          agents_involved: string[]
          collaboration_type: string
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          quality_score?: number | null
          session_id?: string | null
          synthesis_result?: Json | null
          task_description: string
          user_id: string
        }
        Update: {
          agents_involved?: string[]
          collaboration_type?: string
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          quality_score?: number | null
          session_id?: string | null
          synthesis_result?: Json | null
          task_description?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_conversations: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_pinned: boolean | null
          messages: Json
          metadata: Json | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          messages?: Json
          metadata?: Json | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          messages?: Json
          metadata?: Json | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_executions: {
        Row: {
          agent_id: string
          cost_credits: number | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_message: string
          input_type: string | null
          knowledge_items_retrieved: Json | null
          media_urls: Json | null
          output_message: string | null
          output_type: string | null
          session_id: string | null
          success: boolean | null
          tokens_used: number | null
          tool_results: Json | null
          tools_used: string[] | null
          user_id: string
        }
        Insert: {
          agent_id: string
          cost_credits?: number | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_message: string
          input_type?: string | null
          knowledge_items_retrieved?: Json | null
          media_urls?: Json | null
          output_message?: string | null
          output_type?: string | null
          session_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
          tool_results?: Json | null
          tools_used?: string[] | null
          user_id: string
        }
        Update: {
          agent_id?: string
          cost_credits?: number | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_message?: string
          input_type?: string | null
          knowledge_items_retrieved?: Json | null
          media_urls?: Json | null
          output_message?: string | null
          output_type?: string | null
          session_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
          tool_results?: Json | null
          tools_used?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_improvement_suggestions: {
        Row: {
          agent_id: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          reasoning: string | null
          status: string | null
          suggestion: string | null
          suggestion_type: string | null
        }
        Insert: {
          agent_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          reasoning?: string | null
          status?: string | null
          suggestion?: string | null
          suggestion_type?: string | null
        }
        Update: {
          agent_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          reasoning?: string | null
          status?: string | null
          suggestion?: string | null
          suggestion_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_improvement_suggestions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_improvement_suggestions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_knowledge_links: {
        Row: {
          added_at: string | null
          agent_id: string | null
          id: string
          knowledge_id: string | null
        }
        Insert: {
          added_at?: string | null
          agent_id?: string | null
          id?: string
          knowledge_id?: string | null
        }
        Update: {
          added_at?: string | null
          agent_id?: string | null
          id?: string
          knowledge_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_knowledge_links_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_knowledge_links_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_knowledge_links_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_learning_network: {
        Row: {
          agent_type: string
          applied_count: number | null
          context: Json | null
          created_at: string | null
          id: string
          learning_event: string
          shared_to_agents: string[] | null
          success_score: number
          user_id: string
        }
        Insert: {
          agent_type: string
          applied_count?: number | null
          context?: Json | null
          created_at?: string | null
          id?: string
          learning_event: string
          shared_to_agents?: string[] | null
          success_score?: number
          user_id: string
        }
        Update: {
          agent_type?: string
          applied_count?: number | null
          context?: Json | null
          created_at?: string | null
          id?: string
          learning_event?: string
          shared_to_agents?: string[] | null
          success_score?: number
          user_id?: string
        }
        Relationships: []
      }
      agent_marketplace: {
        Row: {
          agent_id: string
          created_at: string
          featured_until: string | null
          id: string
          is_active: boolean | null
          long_description: string | null
          preview_messages: Json | null
          price_credits: number
          sales_count: number | null
          seller_id: string
          tagline: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          featured_until?: string | null
          id?: string
          is_active?: boolean | null
          long_description?: string | null
          preview_messages?: Json | null
          price_credits?: number
          sales_count?: number | null
          seller_id: string
          tagline?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          featured_until?: string | null
          id?: string
          is_active?: boolean | null
          long_description?: string | null
          preview_messages?: Json | null
          price_credits?: number
          sales_count?: number | null
          seller_id?: string
          tagline?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_marketplace_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_marketplace_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_memory: {
        Row: {
          content: Json | null
          context_summary: string
          created_at: string
          embedding: string | null
          id: string
          importance_score: number | null
          last_retrieved_at: string | null
          memory_type: string
          metadata: Json | null
          retrieval_count: number | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          content?: Json | null
          context_summary: string
          created_at?: string
          embedding?: string | null
          id?: string
          importance_score?: number | null
          last_retrieved_at?: string | null
          memory_type: string
          metadata?: Json | null
          retrieval_count?: number | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          content?: Json | null
          context_summary?: string
          created_at?: string
          embedding?: string | null
          id?: string
          importance_score?: number | null
          last_retrieved_at?: string | null
          memory_type?: string
          metadata?: Json | null
          retrieval_count?: number | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_memory_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_preview_interactions: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          interaction_type: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_preview_interactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_preview_interactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_purchases: {
        Row: {
          agent_id: string
          buyer_id: string
          id: string
          price_paid: number
          purchased_at: string
          seller_id: string
          transaction_id: string | null
        }
        Insert: {
          agent_id: string
          buyer_id: string
          id?: string
          price_paid: number
          purchased_at?: string
          seller_id: string
          transaction_id?: string | null
        }
        Update: {
          agent_id?: string
          buyer_id?: string
          id?: string
          price_paid?: number
          purchased_at?: string
          seller_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_purchases_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_purchases_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_reviews: {
        Row: {
          agent_id: string
          created_at: string
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_schedules: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          next_execution_at: string | null
          schedule_config: Json
          schedule_type: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          next_execution_at?: string | null
          schedule_config: Json
          schedule_type?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          next_execution_at?: string | null
          schedule_config?: Json
          schedule_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_schedules_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_schedules_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_templates: {
        Row: {
          capabilities: string[] | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          example_prompts: string[] | null
          icon: string | null
          id: string
          is_featured: boolean | null
          model_preference: string | null
          name: string
          personality: Json
          system_prompt: string
          temperature: number | null
          tools_enabled: string[] | null
          usage_count: number | null
        }
        Insert: {
          capabilities?: string[] | null
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          example_prompts?: string[] | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          model_preference?: string | null
          name: string
          personality?: Json
          system_prompt: string
          temperature?: number | null
          tools_enabled?: string[] | null
          usage_count?: number | null
        }
        Update: {
          capabilities?: string[] | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          example_prompts?: string[] | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          model_preference?: string | null
          name?: string
          personality?: Json
          system_prompt?: string
          temperature?: number | null
          tools_enabled?: string[] | null
          usage_count?: number | null
        }
        Relationships: []
      }
      agent_test_results: {
        Row: {
          agent_version_id: string | null
          executed_at: string | null
          id: string
          results: Json
          success_rate: number | null
          test_suite_id: string | null
        }
        Insert: {
          agent_version_id?: string | null
          executed_at?: string | null
          id?: string
          results: Json
          success_rate?: number | null
          test_suite_id?: string | null
        }
        Update: {
          agent_version_id?: string | null
          executed_at?: string | null
          id?: string
          results?: Json
          success_rate?: number | null
          test_suite_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_test_results_test_suite_id_fkey"
            columns: ["test_suite_id"]
            isOneToOne: false
            referencedRelation: "agent_test_suites"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_test_suites: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          name: string
          test_cases: Json
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          test_cases: Json
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          test_cases?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_test_suites_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_test_suites_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_versions: {
        Row: {
          agent_id: string | null
          change_summary: string | null
          changed_fields: string[] | null
          created_at: string | null
          created_by: string
          id: string
          snapshot: Json
          version_number: number
        }
        Insert: {
          agent_id?: string | null
          change_summary?: string | null
          changed_fields?: string[] | null
          created_at?: string | null
          created_by: string
          id?: string
          snapshot: Json
          version_number: number
        }
        Update: {
          agent_id?: string | null
          change_summary?: string | null
          changed_fields?: string[] | null
          created_at?: string | null
          created_by?: string
          id?: string
          snapshot?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_versions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_versions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_workflows: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
          workflow_definition: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
          workflow_definition: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
          workflow_definition?: Json
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          method: string
          response_time_ms: number | null
          status_code: number
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          method: string
          response_time_ms?: number | null
          status_code: number
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          method?: string
          response_time_ms?: number | null
          status_code?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      available_models: {
        Row: {
          capabilities: string[] | null
          cost_per_1k_tokens: number | null
          created_at: string
          id: string
          is_available: boolean | null
          max_tokens: number | null
          metadata: Json | null
          model_id: string
          model_name: string
          priority: number | null
          provider: string
          supports_streaming: boolean | null
          updated_at: string
        }
        Insert: {
          capabilities?: string[] | null
          cost_per_1k_tokens?: number | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          max_tokens?: number | null
          metadata?: Json | null
          model_id: string
          model_name: string
          priority?: number | null
          provider: string
          supports_streaming?: boolean | null
          updated_at?: string
        }
        Update: {
          capabilities?: string[] | null
          cost_per_1k_tokens?: number | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          max_tokens?: number | null
          metadata?: Json | null
          model_id?: string
          model_name?: string
          priority?: number | null
          provider?: string
          supports_streaming?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      capability_modules: {
        Row: {
          capability_name: string
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          usage_count: number
          user_id: string
        }
        Insert: {
          capability_name: string
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          usage_count?: number
          user_id: string
        }
        Update: {
          capability_name?: string
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      capability_predictions: {
        Row: {
          confidence_score: number
          confirmed_at: string | null
          created_at: string | null
          id: string
          predicted_capability: string
          reasoning: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          confidence_score: number
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          predicted_capability: string
          reasoning?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          predicted_capability?: string
          reasoning?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      capability_suggestions: {
        Row: {
          capability_name: string
          confidence_score: number | null
          created_at: string
          description: string | null
          id: string
          reasoning: string | null
          reviewed_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          capability_name: string
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          id?: string
          reasoning?: string | null
          reviewed_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          capability_name?: string
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          id?: string
          reasoning?: string | null
          reviewed_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      causal_relationships: {
        Row: {
          cause_event: string
          context: Json | null
          created_at: string | null
          effect_event: string
          evidence_count: number | null
          id: string
          strength: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cause_event: string
          context?: Json | null
          created_at?: string | null
          effect_event: string
          evidence_count?: number | null
          id?: string
          strength?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cause_event?: string
          context?: Json | null
          created_at?: string | null
          effect_event?: string
          evidence_count?: number | null
          id?: string
          strength?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_titles: {
        Row: {
          auto_generated_title: string | null
          conversation_id: string
          title_generated_at: string | null
          user_title: string | null
        }
        Insert: {
          auto_generated_title?: string | null
          conversation_id: string
          title_generated_at?: string | null
          user_title?: string | null
        }
        Update: {
          auto_generated_title?: string | null
          conversation_id?: string
          title_generated_at?: string | null
          user_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_titles_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          balance_after: number
          created_at: string
          credits_amount: number
          id: string
          interaction_id: string | null
          metadata: Json | null
          operation_type: string | null
          transaction_type: string
          user_id: string | null
          visitor_credit_id: string | null
        }
        Insert: {
          balance_after: number
          created_at?: string
          credits_amount: number
          id?: string
          interaction_id?: string | null
          metadata?: Json | null
          operation_type?: string | null
          transaction_type: string
          user_id?: string | null
          visitor_credit_id?: string | null
        }
        Update: {
          balance_after?: number
          created_at?: string
          credits_amount?: number
          id?: string
          interaction_id?: string | null
          metadata?: Json | null
          operation_type?: string | null
          transaction_type?: string
          user_id?: string | null
          visitor_credit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_visitor_credit_id_fkey"
            columns: ["visitor_credit_id"]
            isOneToOne: false
            referencedRelation: "visitor_credits"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_job_logs: {
        Row: {
          created_at: string | null
          ended_at: string | null
          error_message: string | null
          id: string
          job_name: string
          metrics: Json | null
          started_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          error_message?: string | null
          id?: string
          job_name: string
          metrics?: Json | null
          started_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          error_message?: string | null
          id?: string
          job_name?: string
          metrics?: Json | null
          started_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      custom_agents: {
        Row: {
          api_integrations: Json | null
          avatar_url: string | null
          capabilities: string[] | null
          created_at: string
          current_version: number | null
          description: string | null
          id: string
          is_public: boolean | null
          is_template: boolean | null
          knowledge_base_ids: string[] | null
          max_tokens: number | null
          metadata: Json | null
          model_preference: string | null
          name: string
          personality: Json | null
          price_credits: number | null
          rating_avg: number | null
          rating_count: number | null
          revenue_total: number | null
          system_prompt: string
          temperature: number | null
          tools_enabled: string[] | null
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          api_integrations?: Json | null
          avatar_url?: string | null
          capabilities?: string[] | null
          created_at?: string
          current_version?: number | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          knowledge_base_ids?: string[] | null
          max_tokens?: number | null
          metadata?: Json | null
          model_preference?: string | null
          name: string
          personality?: Json | null
          price_credits?: number | null
          rating_avg?: number | null
          rating_count?: number | null
          revenue_total?: number | null
          system_prompt: string
          temperature?: number | null
          tools_enabled?: string[] | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          api_integrations?: Json | null
          avatar_url?: string | null
          capabilities?: string[] | null
          created_at?: string
          current_version?: number | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          knowledge_base_ids?: string[] | null
          max_tokens?: number | null
          metadata?: Json | null
          model_preference?: string | null
          name?: string
          personality?: Json | null
          price_credits?: number | null
          rating_avg?: number | null
          rating_count?: number | null
          revenue_total?: number | null
          system_prompt?: string
          temperature?: number | null
          tools_enabled?: string[] | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      emotional_context: {
        Row: {
          created_at: string | null
          detected_sentiment: string | null
          emotion_scores: Json | null
          id: string
          intensity: number | null
          message_id: string | null
          response_tone_adjustment: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          detected_sentiment?: string | null
          emotion_scores?: Json | null
          id?: string
          intensity?: number | null
          message_id?: string | null
          response_tone_adjustment?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          detected_sentiment?: string | null
          emotion_scores?: Json | null
          id?: string
          intensity?: number | null
          message_id?: string | null
          response_tone_adjustment?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      evolution_logs: {
        Row: {
          change_type: string | null
          created_at: string
          description: string
          id: string
          log_type: string
          metrics: Json | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          change_type?: string | null
          created_at?: string
          description: string
          id?: string
          log_type: string
          metrics?: Json | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          change_type?: string | null
          created_at?: string
          description?: string
          id?: string
          log_type?: string
          metrics?: Json | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      feature_usage: {
        Row: {
          created_at: string
          feature_name: string
          id: string
          last_used_at: string
          usage_count: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feature_name: string
          id?: string
          last_used_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feature_name?: string
          id?: string
          last_used_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          created_at: string | null
          generation_time_ms: number | null
          id: string
          image_data: string | null
          image_url: string | null
          metadata: Json | null
          model_used: string | null
          prompt: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          generation_time_ms?: number | null
          id?: string
          image_data?: string | null
          image_url?: string | null
          metadata?: Json | null
          model_used?: string | null
          prompt: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          generation_time_ms?: number | null
          id?: string
          image_data?: string | null
          image_url?: string | null
          metadata?: Json | null
          model_used?: string | null
          prompt?: string
          user_id?: string
        }
        Relationships: []
      }
      huggingface_models: {
        Row: {
          active: boolean | null
          cost_per_1k_tokens: number | null
          created_at: string | null
          description: string | null
          display_name: string | null
          id: string
          license: string | null
          metadata: Json | null
          model_id: string
          parameters_count: number | null
          task: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          cost_per_1k_tokens?: number | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          license?: string | null
          metadata?: Json | null
          model_id: string
          parameters_count?: number | null
          task: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          cost_per_1k_tokens?: number | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          license?: string | null
          metadata?: Json | null
          model_id?: string
          parameters_count?: number | null
          task?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_triggers: {
        Row: {
          agent_id: string | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          integration_id: string
          response_data: Json | null
          status: string
          trigger_data: Json
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_id: string
          response_data?: Json | null
          status?: string
          trigger_data: Json
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_id?: string
          response_data?: Json | null
          status?: string
          trigger_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          message: string
          model_used: string | null
          quality_rating: number | null
          reasoning_trace: Json | null
          response: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          message: string
          model_used?: string | null
          quality_rating?: number | null
          reasoning_trace?: Json | null
          response?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          message?: string
          model_used?: string | null
          quality_rating?: number | null
          reasoning_trace?: Json | null
          response?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          chunk_index: number | null
          content: string | null
          created_at: string
          document_type: string | null
          embedding: string | null
          id: string
          importance_score: number | null
          keywords: string[] | null
          metadata: Json | null
          parent_doc_id: string | null
          source_reference: string | null
          source_type: string | null
          source_url: string | null
          tags: string[] | null
          topic: string
          tsv: unknown
          user_id: string
        }
        Insert: {
          chunk_index?: number | null
          content?: string | null
          created_at?: string
          document_type?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          keywords?: string[] | null
          metadata?: Json | null
          parent_doc_id?: string | null
          source_reference?: string | null
          source_type?: string | null
          source_url?: string | null
          tags?: string[] | null
          topic: string
          tsv?: unknown
          user_id: string
        }
        Update: {
          chunk_index?: number | null
          content?: string | null
          created_at?: string
          document_type?: string | null
          embedding?: string | null
          id?: string
          importance_score?: number | null
          keywords?: string[] | null
          metadata?: Json | null
          parent_doc_id?: string | null
          source_reference?: string | null
          source_type?: string | null
          source_url?: string | null
          tags?: string[] | null
          topic?: string
          tsv?: unknown
          user_id?: string
        }
        Relationships: []
      }
      llm_observations: {
        Row: {
          agent_type: string
          braintrust_span_id: string | null
          completion_tokens: number | null
          cost_usd: number | null
          created_at: string | null
          id: string
          latency_ms: number | null
          metadata: Json | null
          model_used: string
          prompt_tokens: number | null
          provider: string | null
          quality_score: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          agent_type: string
          braintrust_span_id?: string | null
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          model_used: string
          prompt_tokens?: number | null
          provider?: string | null
          quality_score?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          agent_type?: string
          braintrust_span_id?: string | null
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          model_used?: string
          prompt_tokens?: number | null
          provider?: string | null
          quality_score?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      long_term_goals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          goal_description: string
          id: string
          priority: string | null
          progress: number | null
          status: string | null
          subtasks: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          goal_description: string
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          subtasks?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          goal_description?: string
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          subtasks?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      memory_pruning_logs: {
        Row: {
          created_at: string | null
          id: string
          pruned_count: number | null
          pruned_memory_ids: string[] | null
          storage_saved_kb: number | null
          threshold_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pruned_count?: number | null
          pruned_memory_ids?: string[] | null
          storage_saved_kb?: number | null
          threshold_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pruned_count?: number | null
          pruned_memory_ids?: string[] | null
          storage_saved_kb?: number | null
          threshold_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      memory_temporal_scores: {
        Row: {
          access_count: number | null
          calculated_relevance: number | null
          created_at: string | null
          decay_rate: number | null
          id: string
          importance_score: number | null
          last_accessed: string | null
          memory_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_count?: number | null
          calculated_relevance?: number | null
          created_at?: string | null
          decay_rate?: number | null
          id?: string
          importance_score?: number | null
          last_accessed?: string | null
          memory_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_count?: number | null
          calculated_relevance?: number | null
          created_at?: string | null
          decay_rate?: number | null
          id?: string
          importance_score?: number | null
          last_accessed?: string | null
          memory_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meta_learning_metrics: {
        Row: {
          auto_adjusted: boolean | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          optimization_direction: string | null
          user_id: string
        }
        Insert: {
          auto_adjusted?: boolean | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          optimization_direction?: string | null
          user_id: string
        }
        Update: {
          auto_adjusted?: boolean | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          optimization_direction?: string | null
          user_id?: string
        }
        Relationships: []
      }
      model_performance: {
        Row: {
          avg_cost_credits: number | null
          avg_latency_ms: number | null
          created_at: string
          id: string
          last_used_at: string | null
          metadata: Json | null
          model_name: string
          success_rate: number | null
          task_type: string
          total_uses: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_cost_credits?: number | null
          avg_latency_ms?: number | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          model_name: string
          success_rate?: number | null
          task_type: string
          total_uses?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_cost_credits?: number | null
          avg_latency_ms?: number | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          model_name?: string
          success_rate?: number | null
          task_type?: string
          total_uses?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      model_routing_log: {
        Row: {
          actual_cost_credits: number | null
          actual_latency_ms: number | null
          confidence_score: number | null
          created_at: string
          ensemble_mode: boolean | null
          ensemble_models: string[] | null
          id: string
          interaction_id: string | null
          routing_reason: string | null
          selected_model: string
          task_complexity: number | null
          task_type: string
          user_id: string
          user_satisfaction: number | null
        }
        Insert: {
          actual_cost_credits?: number | null
          actual_latency_ms?: number | null
          confidence_score?: number | null
          created_at?: string
          ensemble_mode?: boolean | null
          ensemble_models?: string[] | null
          id?: string
          interaction_id?: string | null
          routing_reason?: string | null
          selected_model: string
          task_complexity?: number | null
          task_type: string
          user_id: string
          user_satisfaction?: number | null
        }
        Update: {
          actual_cost_credits?: number | null
          actual_latency_ms?: number | null
          confidence_score?: number | null
          created_at?: string
          ensemble_mode?: boolean | null
          ensemble_models?: string[] | null
          id?: string
          interaction_id?: string | null
          routing_reason?: string | null
          selected_model?: string
          task_complexity?: number | null
          task_type?: string
          user_id?: string
          user_satisfaction?: number | null
        }
        Relationships: []
      }
      multimodal_sessions: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          metadata: Json | null
          session_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string | null
          id?: string
          metadata?: Json | null
          session_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          metadata?: Json | null
          session_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      problem_solutions: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          problem_description: string
          reasoning_steps: Json | null
          solution: string | null
          solution_path: Json | null
          success_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          problem_description: string
          reasoning_steps?: Json | null
          solution?: string | null
          solution_path?: Json | null
          success_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          problem_description?: string
          reasoning_steps?: Json | null
          solution?: string | null
          solution_path?: Json | null
          success_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      prompt_experiments: {
        Row: {
          agent_type: string
          avg_latency_ms: number | null
          avg_satisfaction: number | null
          created_at: string | null
          id: string
          parent_prompt_id: string | null
          promoted_at: string | null
          prompt_variant: string
          status: string | null
          success_count: number | null
          test_count: number | null
          user_id: string
        }
        Insert: {
          agent_type: string
          avg_latency_ms?: number | null
          avg_satisfaction?: number | null
          created_at?: string | null
          id?: string
          parent_prompt_id?: string | null
          promoted_at?: string | null
          prompt_variant: string
          status?: string | null
          success_count?: number | null
          test_count?: number | null
          user_id: string
        }
        Update: {
          agent_type?: string
          avg_latency_ms?: number | null
          avg_satisfaction?: number | null
          created_at?: string | null
          id?: string
          parent_prompt_id?: string | null
          promoted_at?: string | null
          prompt_variant?: string
          status?: string | null
          success_count?: number | null
          test_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      rag_queries: {
        Row: {
          created_at: string | null
          id: string
          query: string
          response_quality_score: number | null
          results_count: number | null
          transformed_query: string | null
          user_feedback: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          response_quality_score?: number | null
          results_count?: number | null
          transformed_query?: string | null
          user_feedback?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          response_quality_score?: number | null
          results_count?: number | null
          transformed_query?: string | null
          user_feedback?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limit_log: {
        Row: {
          created_at: string
          id: string
          ip_hash: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash: string
          request_count?: number
          updated_at?: string
          window_start: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          claimed: boolean
          claimed_at: string | null
          created_at: string
          id: string
          referral_id: string
          reward_type: string
          reward_value: number
          user_id: string
        }
        Insert: {
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          referral_id: string
          reward_type: string
          reward_value?: number
          user_id: string
        }
        Update: {
          claimed?: boolean
          claimed_at?: string | null
          created_at?: string
          id?: string
          referral_id?: string
          reward_type?: string
          reward_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          referral_code: string
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          referral_code: string
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          referral_code?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      router_ab_tests: {
        Row: {
          active: boolean | null
          created_at: string
          ended_at: string | null
          id: string
          started_at: string
          test_name: string
          user_id: string
          variant_a_avg_latency: number | null
          variant_a_calls: number | null
          variant_a_config: Json
          variant_a_success: number | null
          variant_a_total_cost: number | null
          variant_b_avg_latency: number | null
          variant_b_calls: number | null
          variant_b_config: Json
          variant_b_success: number | null
          variant_b_total_cost: number | null
          winner: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          test_name: string
          user_id: string
          variant_a_avg_latency?: number | null
          variant_a_calls?: number | null
          variant_a_config: Json
          variant_a_success?: number | null
          variant_a_total_cost?: number | null
          variant_b_avg_latency?: number | null
          variant_b_calls?: number | null
          variant_b_config: Json
          variant_b_success?: number | null
          variant_b_total_cost?: number | null
          winner?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          test_name?: string
          user_id?: string
          variant_a_avg_latency?: number | null
          variant_a_calls?: number | null
          variant_a_config?: Json
          variant_a_success?: number | null
          variant_a_total_cost?: number | null
          variant_b_avg_latency?: number | null
          variant_b_calls?: number | null
          variant_b_config?: Json
          variant_b_success?: number | null
          variant_b_total_cost?: number | null
          winner?: string | null
        }
        Relationships: []
      }
      router_analytics: {
        Row: {
          ab_test_id: string | null
          cost: number
          created_at: string
          fallback_used: boolean | null
          id: string
          latency_ms: number
          metadata: Json | null
          model_used: string
          priority: string
          provider: string
          success: boolean
          task_type: string
          user_id: string
        }
        Insert: {
          ab_test_id?: string | null
          cost: number
          created_at?: string
          fallback_used?: boolean | null
          id?: string
          latency_ms: number
          metadata?: Json | null
          model_used: string
          priority: string
          provider: string
          success: boolean
          task_type: string
          user_id: string
        }
        Update: {
          ab_test_id?: string | null
          cost?: number
          created_at?: string
          fallback_used?: boolean | null
          id?: string
          latency_ms?: number
          metadata?: Json | null
          model_used?: string
          priority?: string
          provider?: string
          success?: boolean
          task_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "router_analytics_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "router_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      router_cost_alerts: {
        Row: {
          acknowledged_at: string | null
          active: boolean | null
          alert_type: string
          created_at: string
          current_amount: number | null
          id: string
          period: string
          threshold_amount: number
          triggered_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          active?: boolean | null
          alert_type: string
          created_at?: string
          current_amount?: number | null
          id?: string
          period?: string
          threshold_amount: number
          triggered_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          active?: boolean | null
          alert_type?: string
          created_at?: string
          current_amount?: number | null
          id?: string
          period?: string
          threshold_amount?: number
          triggered_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "shared_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          id: string
          joined_at: string
          last_active_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_active_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_active_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "shared_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          message_count: number
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_sessions: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          name: string
          owner_id: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          name: string
          owner_id: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      social_intelligence: {
        Row: {
          created_at: string
          data: Json
          expires_at: string
          id: string
          intelligence_type: string
          metadata: Json | null
          score: number | null
          source: string | null
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
          intelligence_type: string
          metadata?: Json | null
          score?: number | null
          source?: string | null
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
          intelligence_type?: string
          metadata?: Json | null
          score?: number | null
          source?: string | null
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          active: boolean
          created_at: string
          features: Json
          id: string
          monthly_credits: number
          monthly_price: number
          sort_order: number
          tier_name: string
          yearly_price: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          features?: Json
          id?: string
          monthly_credits: number
          monthly_price: number
          sort_order: number
          tier_name: string
          yearly_price: number
        }
        Update: {
          active?: boolean
          created_at?: string
          features?: Json
          id?: string
          monthly_credits?: number
          monthly_price?: number
          sort_order?: number
          tier_name?: string
          yearly_price?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tool_execution_metrics: {
        Row: {
          agent_id: string | null
          avg_duration_ms: number | null
          created_at: string | null
          execution_count: number | null
          id: string
          last_executed_at: string | null
          success_count: number | null
          tool_name: string
        }
        Insert: {
          agent_id?: string | null
          avg_duration_ms?: number | null
          created_at?: string | null
          execution_count?: number | null
          id?: string
          last_executed_at?: string | null
          success_count?: number | null
          tool_name: string
        }
        Update: {
          agent_id?: string | null
          avg_duration_ms?: number | null
          created_at?: string | null
          execution_count?: number | null
          id?: string
          last_executed_at?: string | null
          success_count?: number | null
          tool_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_execution_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "tool_execution_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_predictions: {
        Row: {
          actual_data: Json | null
          confidence_score: number | null
          created_at: string
          id: string
          predicted_data: Json
          prediction_date: string
          prediction_type: string
          target_date: string
          topic: string
          user_id: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          actual_data?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          predicted_data?: Json
          prediction_date?: string
          prediction_type: string
          target_date: string
          topic: string
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          actual_data?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          predicted_data?: Json
          prediction_date?: string
          prediction_type?: string
          target_date?: string
          topic?: string
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      uncertainty_scores: {
        Row: {
          agent_type: string
          clarification_requested: boolean | null
          confidence_score: number
          created_at: string | null
          id: string
          query: string
          session_id: string | null
          uncertainty_reasons: string[] | null
          user_id: string
        }
        Insert: {
          agent_type: string
          clarification_requested?: boolean | null
          confidence_score: number
          created_at?: string | null
          id?: string
          query: string
          session_id?: string | null
          uncertainty_reasons?: string[] | null
          user_id: string
        }
        Update: {
          agent_type?: string
          clarification_requested?: boolean | null
          confidence_score?: number
          created_at?: string | null
          id?: string
          query?: string
          session_id?: string | null
          uncertainty_reasons?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      usage_sessions: {
        Row: {
          created_at: string
          credits_deducted: number
          elapsed_seconds: number
          ended_at: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          session_id: string | null
          started_at: string
          user_id: string | null
          visitor_credit_id: string | null
        }
        Insert: {
          created_at?: string
          credits_deducted?: number
          elapsed_seconds?: number
          ended_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          session_id?: string | null
          started_at?: string
          user_id?: string | null
          visitor_credit_id?: string | null
        }
        Update: {
          created_at?: string
          credits_deducted?: number
          elapsed_seconds?: number
          ended_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          session_id?: string | null
          started_at?: string
          user_id?: string | null
          visitor_credit_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_key: string
          completed_at: string | null
          created_at: string
          id: string
          progress: number
          user_id: string
        }
        Insert: {
          achievement_key: string
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          user_id: string
        }
        Update: {
          achievement_key?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_key_fkey"
            columns: ["achievement_key"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["achievement_key"]
          },
        ]
      }
      user_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page_url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page_url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          api_key: string | null
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          trigger_count: number | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          trigger_count?: number | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          trigger_count?: number | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      user_memory_preferences: {
        Row: {
          auto_pruning_enabled: boolean | null
          created_at: string | null
          id: string
          min_age_days: number | null
          pruning_aggressiveness: string | null
          relevance_threshold: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_pruning_enabled?: boolean | null
          created_at?: string | null
          id?: string
          min_age_days?: number | null
          pruning_aggressiveness?: string | null
          relevance_threshold?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_pruning_enabled?: boolean | null
          created_at?: string | null
          id?: string
          min_age_days?: number | null
          pruning_aggressiveness?: string | null
          relevance_threshold?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_approval_threshold: number | null
          auto_learning_enabled: boolean | null
          created_at: string | null
          default_agent: string | null
          evolution_frequency: string | null
          notifications_enabled: boolean | null
          onboarding_progress: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_approval_threshold?: number | null
          auto_learning_enabled?: boolean | null
          created_at?: string | null
          default_agent?: string | null
          evolution_frequency?: string | null
          notifications_enabled?: boolean | null
          onboarding_progress?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_approval_threshold?: number | null
          auto_learning_enabled?: boolean | null
          created_at?: string | null
          default_agent?: string | null
          evolution_frequency?: string | null
          notifications_enabled?: boolean | null
          onboarding_progress?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_router_preferences: {
        Row: {
          blocked_providers: Json | null
          cost_alert_threshold: number | null
          created_at: string
          custom_rules: Json | null
          default_priority: string
          id: string
          max_cost_per_request: number | null
          max_latency_ms: number | null
          preferred_providers: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_providers?: Json | null
          cost_alert_threshold?: number | null
          created_at?: string
          custom_rules?: Json | null
          default_priority?: string
          id?: string
          max_cost_per_request?: number | null
          max_latency_ms?: number | null
          preferred_providers?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_providers?: Json | null
          cost_alert_threshold?: number | null
          created_at?: string
          custom_rules?: Json | null
          default_priority?: string
          id?: string
          max_cost_per_request?: number | null
          max_latency_ms?: number | null
          preferred_providers?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string
          cancelled_at: string | null
          created_at: string
          credits_remaining: number
          credits_total: number
          id: string
          renews_at: string
          started_at: string
          status: string
          stripe_subscription_id: string | null
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle: string
          cancelled_at?: string | null
          created_at?: string
          credits_remaining: number
          credits_total: number
          id?: string
          renews_at: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string
          credits_remaining?: number
          credits_total?: number
          id?: string
          renews_at?: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      viral_content: {
        Row: {
          content: string
          content_type: string
          created_at: string
          generated_by: string | null
          id: string
          metadata: Json | null
          performance_metrics: Json | null
          platform: string
          shared: boolean | null
          shared_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          generated_by?: string | null
          id?: string
          metadata?: Json | null
          performance_metrics?: Json | null
          platform: string
          shared?: boolean | null
          shared_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          generated_by?: string | null
          id?: string
          metadata?: Json | null
          performance_metrics?: Json | null
          platform?: string
          shared?: boolean | null
          shared_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      viral_shares: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          platform: string
          share_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          platform: string
          share_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          platform?: string
          share_type?: string
          user_id?: string
        }
        Relationships: []
      }
      visitor_credits: {
        Row: {
          consecutive_days: number
          created_at: string
          credits_used_today: number
          daily_credits: number
          id: string
          ip_encrypted: string
          ip_hash: string
          last_visit_date: string
          updated_at: string
        }
        Insert: {
          consecutive_days?: number
          created_at?: string
          credits_used_today?: number
          daily_credits?: number
          id?: string
          ip_encrypted: string
          ip_hash: string
          last_visit_date?: string
          updated_at?: string
        }
        Update: {
          consecutive_days?: number
          created_at?: string
          credits_used_today?: number
          daily_credits?: number
          id?: string
          ip_encrypted?: string
          ip_hash?: string
          last_visit_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      voice_agent_conversations: {
        Row: {
          agent_id: string | null
          conversation_id: string
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          metadata: Json | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          conversation_id: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          conversation_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_agent_messages: {
        Row: {
          audio_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
          tool_calls: Json | null
        }
        Insert: {
          audio_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
          tool_calls?: Json | null
        }
        Update: {
          audio_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_agent_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "voice_agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_interactions: {
        Row: {
          audio_data: string | null
          audio_duration_ms: number | null
          created_at: string | null
          id: string
          input_text: string | null
          interaction_type: string
          model_used: string | null
          output_text: string | null
          user_id: string
        }
        Insert: {
          audio_data?: string | null
          audio_duration_ms?: number | null
          created_at?: string | null
          id?: string
          input_text?: string | null
          interaction_type: string
          model_used?: string | null
          output_text?: string | null
          user_id: string
        }
        Update: {
          audio_data?: string | null
          audio_duration_ms?: number | null
          created_at?: string | null
          id?: string
          input_text?: string | null
          interaction_type?: string
          model_used?: string | null
          output_text?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          execution_trace: Json | null
          id: string
          input_data: Json | null
          output_data: Json | null
          status: string | null
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          execution_trace?: Json | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string | null
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          execution_trace?: Json | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string | null
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "agent_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      agent_analytics_daily: {
        Row: {
          agent_id: string | null
          avg_execution_time: number | null
          avg_tokens: number | null
          date: string | null
          execution_count: number | null
          success_rate: number | null
          total_credits_used: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_revenue_analytics"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_revenue_analytics: {
        Row: {
          agent_id: string | null
          creator_earnings: number | null
          creator_id: string | null
          month: string | null
          total_revenue: number | null
          total_sales: number | null
        }
        Relationships: []
      }
      cron_job_status: {
        Row: {
          active: boolean | null
          command: string | null
          database: string | null
          jobid: number | null
          jobname: string | null
          nodename: string | null
          nodeport: number | null
          schedule: string | null
          username: string | null
        }
        Insert: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          nodeport?: number | null
          schedule?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          nodeport?: number | null
          schedule?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_temporal_relevance: {
        Args: {
          p_access_count: number
          p_decay_rate: number
          p_importance_score: number
          p_last_accessed: string
        }
        Returns: number
      }
      check_achievements: {
        Args: {
          p_achievement_key: string
          p_increment?: number
          p_user_id: string
        }
        Returns: {
          achievement_description: string
          achievement_name: string
          achievement_unlocked: boolean
        }[]
      }
      check_rate_limit: {
        Args: {
          p_ip_hash: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      cleanup_rate_limit_logs: { Args: never; Returns: undefined }
      decrypt_ip: {
        Args: { encrypted_ip: string; encryption_key: string }
        Returns: string
      }
      encrypt_ip: {
        Args: { encryption_key: string; ip_address: string }
        Returns: string
      }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_agent_usage: {
        Args: { p_agent_id: string }
        Returns: undefined
      }
      increment_memory_retrieval: {
        Args: { memory_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      match_knowledge_base: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_user_id?: string
          query_embedding: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          similarity: number
          source_url: string
          topic: string
          user_id: string
        }[]
      }
      process_referral_signup: {
        Args: { p_referral_code: string; p_referred_user_id: string }
        Returns: Json
      }
      update_model_performance: {
        Args: {
          p_cost_credits: number
          p_latency_ms: number
          p_model_name: string
          p_success: boolean
          p_task_type: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "moderator", "user"],
    },
  },
} as const
