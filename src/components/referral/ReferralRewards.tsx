import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Crown, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { SuccessAnimation } from "@/components/ui/success-animation";

interface Reward {
  id: string;
  reward_type: string;
  reward_value: number;
  claimed: boolean;
  created_at: string;
  referral_id: string;
}

export const ReferralRewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchRewards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [user]);

  const claimReward = async (rewardId: string) => {
    setClaiming(rewardId);

    try {
      // Get the reward details
      const reward = rewards.find(r => r.id === rewardId);
      if (!reward) throw new Error('Reward not found');

      // Get current subscription to calculate new balance
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('credits_remaining')
        .eq('user_id', user!.id)
        .single();

      const currentBalance = subscription?.credits_remaining || 0;
      const newBalance = currentBalance + reward.reward_value;

      // Update subscription credits
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .update({ 
          credits_remaining: newBalance,
          credits_total: newBalance 
        })
        .eq('user_id', user!.id);

      if (subError) throw subError;

      // Record the transaction
      const { error: txError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user!.id,
          transaction_type: 'reward',
          credits_amount: reward.reward_value,
          operation_type: 'referral_reward',
          balance_after: newBalance,
          metadata: { 
            referral_id: reward.referral_id,
            reward_type: reward.reward_type 
          }
        });

      if (txError) throw txError;

      // Mark reward as claimed
      const { error } = await supabase
        .from('referral_rewards')
        .update({ claimed: true, claimed_at: new Date().toISOString() })
        .eq('id', rewardId);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      toast({
        title: '🎉 Reward claimed!',
        description: `${reward.reward_value} credits have been added to your account.`,
      });

      fetchRewards();
    } catch (error: any) {
      toast({
        title: 'Failed to claim reward',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setClaiming(null);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'credits':
        return <Gift className="h-5 w-5" />;
      case 'premium_trial':
        return <Crown className="h-5 w-5" />;
      case 'badge':
        return <Sparkles className="h-5 w-5" />;
      case 'feature_unlock':
        return <Zap className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  const getRewardLabel = (type: string) => {
    switch (type) {
      case 'credits':
        return 'Credits';
      case 'premium_trial':
        return 'Premium Trial';
      case 'badge':
        return 'Badge';
      case 'feature_unlock':
        return 'Feature Unlock';
      default:
        return 'Reward';
    }
  };

  const unclaimedRewards = rewards.filter(r => !r.claimed);
  const claimedRewards = rewards.filter(r => r.claimed);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showSuccess && <SuccessAnimation message="Reward claimed!" />}
      </AnimatePresence>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Rewards
          </CardTitle>
          <CardDescription>
            Claim your rewards from successful referrals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {unclaimedRewards.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Unclaimed Rewards</h3>
              {unclaimedRewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getRewardIcon(reward.reward_type)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {reward.reward_value} {getRewardLabel(reward.reward_type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        From referral on {new Date(reward.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => claimReward(reward.id)}
                    disabled={claiming === reward.id}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {claiming === reward.id ? 'Claiming...' : 'Claim'}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}

          {claimedRewards.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Claimed Rewards</h3>
              {claimedRewards.slice(0, 5).map((reward) => (
                <div
                  key={reward.id}
                  className="p-4 bg-muted/50 rounded-lg flex items-center justify-between opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {getRewardIcon(reward.reward_type)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {reward.reward_value} {getRewardLabel(reward.reward_type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Claimed
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Claimed</Badge>
                </div>
              ))}
            </div>
          )}

          {rewards.length === 0 && (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No rewards yet. Start referring friends to earn rewards!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
