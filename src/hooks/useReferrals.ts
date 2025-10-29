import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  referred_email: string;
  referred_user_id: string | null;
  status: 'pending' | 'signed_up' | 'converted';
  referral_code: string;
  created_at: string;
  converted_at: string | null;
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  totalRewards: number;
  unclaimedRewards: number;
}

export function useReferrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    pendingReferrals: 0,
    convertedReferrals: 0,
    totalRewards: 0,
    unclaimedRewards: 0,
  });
  const [userReferralCode, setUserReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchReferrals = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReferrals((data || []) as Referral[]);

      // Calculate stats (excluding user's own referral code)
      const actualReferrals = data?.filter(r => r.referred_email !== user.email) || [];
      const totalReferrals = actualReferrals.length;
      const pendingReferrals = actualReferrals.filter(r => r.status === 'pending').length;
      const convertedReferrals = actualReferrals.filter(r => r.status === 'converted').length;

      // Fetch rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('referral_rewards')
        .select('reward_value, claimed')
        .eq('user_id', user.id);

      if (rewardsError) throw rewardsError;

      const totalRewards = rewardsData?.reduce((sum, r) => sum + r.reward_value, 0) || 0;
      const unclaimedRewards = rewardsData?.filter(r => !r.claimed).reduce((sum, r) => sum + r.reward_value, 0) || 0;

      setStats({
        totalReferrals,
        pendingReferrals,
        convertedReferrals,
        totalRewards,
        unclaimedRewards,
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createReferral = useCallback(async (email: string) => {
    if (!user) return null;

    try {
      // Check rate limit: max 50 referrals per day
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id)
        .gte('created_at', oneDayAgo.toISOString());

      if (count && count >= 50) {
        toast({
          title: 'Rate limit reached',
          description: 'You can only create 50 referrals per day.',
          variant: 'destructive',
        });
        return null;
      }

      // Prevent self-referral
      if (email === user.email) {
        toast({
          title: 'Invalid referral',
          description: 'You cannot refer yourself.',
          variant: 'destructive',
        });
        return null;
      }

      // Generate referral code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_referral_code');
      
      if (codeError) throw codeError;

      const referralCode = codeData as string;

      // Create referral
      const { data, error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          referred_email: email,
          referral_code: referralCode,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Invitation created!',
        description: `Referral code: ${referralCode}`,
      });

      fetchReferrals();
      return data;
    } catch (error: any) {
      toast({
        title: 'Failed to create referral',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast, fetchReferrals]);

  const getUserReferralCode = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch user's personal referral code (auto-generated on signup)
      const { data: existing, error: existingError } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .eq('referred_email', user.email)
        .single();

      if (existing && !existingError) {
        setUserReferralCode(existing.referral_code);
      } else {
        console.warn('No referral code found. This should have been auto-generated on signup.');
      }
    } catch (error) {
      console.error('Error getting referral code:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReferrals();
      getUserReferralCode();
    }
  }, [user, fetchReferrals, getUserReferralCode]);

  return {
    referrals,
    stats,
    userReferralCode,
    loading,
    createReferral,
    refreshReferrals: fetchReferrals,
  };
}
