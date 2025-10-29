import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useReferralProcessor() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const processReferral = async () => {
      if (!user) return;

      const pendingReferralCode = localStorage.getItem('pending_referral_code');
      if (!pendingReferralCode) return;

      try {
        // Process the referral
        const { data, error } = await supabase.rpc('process_referral_signup', {
          p_referral_code: pendingReferralCode,
          p_referred_user_id: user.id
        });

        if (error) throw error;

        const result = data as { success: boolean } | null;
        if (result?.success) {
          // Give the new user 50 bonus credits
          const { error: creditError } = await supabase
            .from('credit_transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'reward',
              credits_amount: 50,
              operation_type: 'referral_signup_bonus',
              balance_after: 50,
              metadata: { referral_code: pendingReferralCode }
            });

          if (creditError) throw creditError;

          // Clear the pending referral
          localStorage.removeItem('pending_referral_code');

          toast({
            title: '🎉 Welcome Bonus!',
            description: 'You received 50 bonus credits for signing up via referral!',
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error processing referral:', error);
        // Clear anyway to avoid retry loops
        localStorage.removeItem('pending_referral_code');
      }
    };

    processReferral();
  }, [user, toast]);
}
