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