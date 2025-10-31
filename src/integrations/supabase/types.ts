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
      agent_executions: {
        Row: {
          agent_id: string
          cost_credits: number | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_message: string
          output_message: string | null
          session_id: string | null
          success: boolean | null
          tokens_used: number | null
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
          output_message?: string | null
          session_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
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
          output_message?: string | null
          session_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
          tools_used?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "custom_agents"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
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
