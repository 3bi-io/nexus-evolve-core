import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Credit Management Utilities
 * Shared logic for checking and deducting credits across edge functions
 */

export interface CreditCheckResult {
  hasCredits: boolean;
  currentBalance: number;
  isAnonymous: boolean;
  remainingFreeSearches?: number;
}

export interface CreditDeductionResult {
  success: boolean;
  newBalance: number;
  transactionId?: string;
  error?: string;
}

/**
 * Check if user has sufficient credits
 * @param supabase - Supabase client
 * @param userId - User ID (null for anonymous)
 * @param requiredCredits - Credits needed for operation
 * @param ipAddress - IP address for anonymous users
 * @returns Credit check result
 */
export async function checkCredits(
  supabase: SupabaseClient,
  userId: string | null,
  requiredCredits: number,
  ipAddress?: string
): Promise<CreditCheckResult> {
  // Anonymous user - check visitor credits
  if (!userId && ipAddress) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: visitorCredit } = await supabase
      .from('visitor_credits')
      .select('*')
      .eq('ip_address', ipAddress)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (!visitorCredit) {
      // Create new visitor credit record
      const { data: newCredit } = await supabase
        .from('visitor_credits')
        .insert({
          ip_address: ipAddress,
          daily_credits_used: 0,
          last_reset_date: today,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      return {
        hasCredits: true,
        currentBalance: 5,
        isAnonymous: true,
        remainingFreeSearches: 5,
      };
    }

    // Reset if new day
    if (visitorCredit.last_reset_date !== today) {
      await supabase
        .from('visitor_credits')
        .update({
          daily_credits_used: 0,
          last_reset_date: today,
        })
        .eq('id', visitorCredit.id);

      return {
        hasCredits: true,
        currentBalance: 5,
        isAnonymous: true,
        remainingFreeSearches: 5,
      };
    }

    const remaining = 5 - (visitorCredit.daily_credits_used || 0);
    
    return {
      hasCredits: remaining >= requiredCredits,
      currentBalance: remaining,
      isAnonymous: true,
      remainingFreeSearches: remaining,
    };
  }

  // Authenticated user - check user credits
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    const currentBalance = profile?.credits || 0;

    return {
      hasCredits: currentBalance >= requiredCredits,
      currentBalance,
      isAnonymous: false,
    };
  }

  // No user and no IP - deny
  return {
    hasCredits: false,
    currentBalance: 0,
    isAnonymous: true,
  };
}

/**
 * Deduct credits from user account
 * @param supabase - Supabase client
 * @param userId - User ID (null for anonymous)
 * @param credits - Credits to deduct
 * @param operationType - Type of operation
 * @param metadata - Additional metadata
 * @param ipAddress - IP address for anonymous users
 * @returns Deduction result
 */
export async function deductCredits(
  supabase: SupabaseClient,
  userId: string | null,
  credits: number,
  operationType: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string
): Promise<CreditDeductionResult> {
  try {
    // Anonymous user
    if (!userId && ipAddress) {
      const { data: visitorCredit } = await supabase
        .from('visitor_credits')
        .select('*')
        .eq('ip_address', ipAddress)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (!visitorCredit) {
        return {
          success: false,
          newBalance: 0,
          error: 'No visitor credit record found',
        };
      }

      const newUsed = (visitorCredit.daily_credits_used || 0) + credits;
      
      if (newUsed > 5) {
        return {
          success: false,
          newBalance: Math.max(0, 5 - newUsed),
          error: 'Insufficient free searches',
        };
      }

      await supabase
        .from('visitor_credits')
        .update({ daily_credits_used: newUsed })
        .eq('id', visitorCredit.id);

      return {
        success: true,
        newBalance: 5 - newUsed,
      };
    }

    // Authenticated user
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      const currentBalance = profile?.credits || 0;
      
      if (currentBalance < credits) {
        return {
          success: false,
          newBalance: currentBalance,
          error: 'Insufficient credits',
        };
      }

      const newBalance = currentBalance - credits;

      // Update balance
      await supabase
        .from('profiles')
        .update({ credits: newBalance })
        .eq('id', userId);

      // Log transaction
      const { data: transaction } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          credits_amount: -credits,
          balance_after: newBalance,
          transaction_type: 'deduction',
          operation_type: operationType,
          metadata: metadata || {},
        })
        .select()
        .single();

      return {
        success: true,
        newBalance,
        transactionId: transaction?.id,
      };
    }

    return {
      success: false,
      newBalance: 0,
      error: 'No user or IP address provided',
    };
  } catch (error) {
    console.error('[credit-utils] Deduction error:', error);
    return {
      success: false,
      newBalance: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Standard credit costs for common operations
 */
export const CREDIT_COSTS = {
  // AI Model Costs
  'claude-sonnet-4-5': 0.015,
  'claude-opus-4-1': 0.075,
  'claude-3-7-sonnet': 0.01,
  'gpt-4': 0.03,
  'gpt-4o': 0.025,
  'gpt-3.5-turbo': 0.002,
  'grok-2': 0.02,
  'grok-beta': 0.015,
  
  // Operations
  'text-to-speech': 0.1,
  'speech-to-text': 0.1,
  'image-generation': 0.5,
  'image-analysis': 0.2,
  'web-search': 0.05,
  'embedding-generation': 0.01,
  'vector-search': 0.01,
  'agent-execution': 0.1,
  'workflow-execution': 0.2,
  'code-analysis': 0.15,
} as const;

/**
 * Calculate credit cost based on operation type
 * @param operationType - Type of operation
 * @param params - Additional parameters for cost calculation
 * @returns Credit cost
 */
export function calculateCreditCost(
  operationType: keyof typeof CREDIT_COSTS | string,
  params?: { tokens?: number; duration?: number; complexity?: number }
): number {
  const baseCost = CREDIT_COSTS[operationType as keyof typeof CREDIT_COSTS] || 0.1;
  
  // Adjust cost based on parameters
  if (params?.tokens) {
    // Add cost per 1000 tokens
    return baseCost + (params.tokens / 1000) * 0.001;
  }
  
  if (params?.duration) {
    // Add cost per minute for audio operations
    return baseCost * (params.duration / 60);
  }
  
  if (params?.complexity) {
    // Multiply by complexity factor
    return baseCost * params.complexity;
  }
  
  return baseCost;
}

/**
 * Check and deduct credits in one operation
 * Convenience wrapper for common use case
 * @param supabase - Supabase client
 * @param userId - User ID (null for anonymous)
 * @param operationType - Type of operation
 * @param ipAddress - IP address for anonymous users
 * @param params - Additional parameters for cost calculation
 * @returns Result with success status and balance
 */
export async function checkAndDeductCredits(
  supabase: SupabaseClient,
  userId: string | null,
  operationType: string,
  ipAddress?: string,
  params?: { tokens?: number; duration?: number; complexity?: number; metadata?: Record<string, unknown> }
): Promise<CreditDeductionResult & { hasCredits: boolean }> {
  const creditCost = calculateCreditCost(operationType, params);
  
  // Check if user has credits
  const checkResult = await checkCredits(supabase, userId, creditCost, ipAddress);
  
  if (!checkResult.hasCredits) {
    return {
      success: false,
      hasCredits: false,
      newBalance: checkResult.currentBalance,
      error: checkResult.isAnonymous 
        ? 'Daily free search limit reached. Please sign up for more credits.'
        : 'Insufficient credits. Please upgrade your plan.',
    };
  }
  
  // Deduct credits
  const deductResult = await deductCredits(
    supabase,
    userId,
    creditCost,
    operationType,
    params?.metadata,
    ipAddress
  );
  
  return {
    ...deductResult,
    hasCredits: deductResult.success,
  };
}