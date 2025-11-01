-- Phase A: Security Hardening Migration
-- Fix all security issues identified by linter

-- 1. Add search_path to functions missing it
ALTER FUNCTION public.update_tsv_column() SET search_path = 'public';
ALTER FUNCTION public.update_huggingface_models_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_router_updated_at() SET search_path = 'public';
ALTER FUNCTION public.generate_referral_code() SET search_path = 'public';
ALTER FUNCTION public.initialize_user_subscription() SET search_path = 'public';
ALTER FUNCTION public.create_user_referral_code() SET search_path = 'public';
ALTER FUNCTION public.auto_extract_learnings_on_session_end() SET search_path = 'public';

-- 2. Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- 3. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_interactions_user_created ON public.interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_session ON public.interactions(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_memory_user_type ON public.agent_memory(user_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_agent_memory_importance ON public.agent_memory(importance_score DESC) WHERE importance_score > 0.7;
CREATE INDEX IF NOT EXISTS idx_knowledge_base_user_topic ON public.knowledge_base(user_id, topic);
CREATE INDEX IF NOT EXISTS idx_llm_observations_user_created ON public.llm_observations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_router_analytics_user_created ON public.router_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_router_analytics_task ON public.router_analytics(task_type, provider);
CREATE INDEX IF NOT EXISTS idx_model_performance_user_task ON public.model_performance(user_id, task_type, model_name);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created ON public.credit_transactions(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- 4. Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_interactions_quality ON public.interactions(user_id, quality_rating) WHERE quality_rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_memory_retrieval ON public.agent_memory(user_id, last_retrieved_at DESC) WHERE last_retrieved_at IS NOT NULL;

-- 5. Optimize RLS policies by adding indexes on auth columns
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON public.interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_user_id ON public.agent_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_user_id ON public.knowledge_base(user_id);