/**
 * Shared TypeScript Types for Edge Functions
 * Provides type safety across all edge functions
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { Logger } from './logger.ts';

/**
 * User type from Supabase authentication
 */
export interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

/**
 * Edge function execution context
 */
export interface EdgeFunctionContext {
  supabase: SupabaseClient;
  user: User;
  requestId: string;
  logger: Logger;
}

/**
 * Standardized request wrapper
 */
export interface StandardRequest<T = any> {
  body: T;
  context: EdgeFunctionContext;
}

/**
 * Standardized response wrapper
 */
export interface StandardResponse<T = any> {
  data?: T;
  error?: string;
  requestId: string;
  timestamp: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends StandardResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * AI Model configuration
 */
export interface AIModelConfig {
  provider: 'anthropic' | 'openai' | 'xai' | 'lovable';
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Message structure for chat interfaces
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
}

/**
 * Credit cost configuration
 */
export interface CreditCostConfig {
  operation: string;
  baseCost: number;
  variableCost?: number;
  calculateCost?: (params: any) => number;
}

/**
 * API retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelayMs: number;
  backoffMultiplier: number;
  timeout: number;
  retryableStatuses: number[];
}

/**
 * Error codes for standardized error handling
 */
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  MISSING_AUTH_HEADER = 'MISSING_AUTH_HEADER',
  INVALID_TOKEN = 'INVALID_TOKEN',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_FIELD = 'MISSING_FIELD',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  FORBIDDEN = 'FORBIDDEN',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
