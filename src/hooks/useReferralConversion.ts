import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useReferralConversion() {
  const { user } = useAuth();

  useEffect(() => {
    const checkConversion = async () => {
      if (!user) return;

      // Check if user has 3+ interactions (conversion threshold)
      const { count } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count && count >= 3) {
        // Check if already processed
        const conversionChecked = localStorage.getItem(`conversion_checked_${user.id}`);
        if (conversionChecked) return;

        // Call edge function to process conversion
        try {
          await supabase.functions.invoke('process-referral-conversion', {
            body: { userId: user.id }
          });

          // Mark as checked
          localStorage.setItem(`conversion_checked_${user.id}`, 'true');
        } catch (error) {
          console.error('Error processing conversion:', error);
        }
      }
    };

    checkConversion();
  }, [user]);
}
