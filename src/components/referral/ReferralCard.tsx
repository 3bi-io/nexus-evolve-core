import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Gift, TrendingUp, Copy } from "lucide-react";
import { StatCard } from "@/components/ui/enhanced-card";
import { useViral } from "@/hooks/useViral";
import { motion } from "framer-motion";

interface ReferralCardProps {
  stats: {
    totalReferrals: number;
    pendingReferrals: number;
    convertedReferrals: number;
    totalRewards: number;
    unclaimedRewards: number;
  };
  referralCode: string;
}

export const ReferralCard = ({ stats, referralCode }: ReferralCardProps) => {
  const { copyLink } = useViral();
  const referralUrl = `${window.location.origin}?ref=${referralCode}`;

  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link to invite friends and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-background rounded-lg border font-mono text-sm truncate">
              {referralUrl}
            </div>
            <Button
              onClick={() => copyLink(referralUrl)}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium mb-1">Your Referral Code</p>
            <p className="text-2xl font-bold text-primary">{referralCode}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            label="Total Referrals"
            value={stats.totalReferrals}
            icon={Users}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            label="Pending"
            value={stats.pendingReferrals}
            icon={TrendingUp}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            label="Converted"
            value={stats.convertedReferrals}
            icon={Users}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            label="Total Rewards"
            value={stats.totalRewards}
            icon={Gift}
          />
        </motion.div>
      </div>
    </div>
  );
};
