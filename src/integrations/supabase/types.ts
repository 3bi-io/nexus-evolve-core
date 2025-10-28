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
          content: string | null
          created_at: string
          embedding: string | null
          id: string
          importance_score: number | null
          metadata: Json | null
          source_reference: string | null
          source_type: string | null
          tags: string[] | null
          topic: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          importance_score?: number | null
          metadata?: Json | null
          source_reference?: string | null
          source_type?: string | null
          tags?: string[] | null
          topic: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          importance_score?: number | null
          metadata?: Json | null
          source_reference?: string | null
          source_type?: string | null
          tags?: string[] | null
          topic?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_memory_retrieval: {
        Args: { memory_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
