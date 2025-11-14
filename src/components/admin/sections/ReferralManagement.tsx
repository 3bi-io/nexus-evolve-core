import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Gift, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export function ReferralManagement() {
  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ['admin', 'referrals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  const { data: rewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ['admin', 'referral-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('*')
        .order('earned_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const totalRewards = rewards?.reduce((sum, r) => sum + (r.reward_value || 0), 0) || 0;
  const successfulReferrals = referrals?.filter(r => r.status === 'converted').length || 0;

  if (referralsLoading || rewardsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Referral Management</h2>
        <p className="text-muted-foreground">Track and manage the referral program</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successfulReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {((successfulReferrals / (referrals?.length || 1)) * 100).toFixed(1)}% conversion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewards.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Credits distributed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
          <CardDescription>All referral codes and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals?.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{referral.referral_code}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      referral.status === 'converted' ? 'default' :
                      referral.status === 'signed_up' ? 'secondary' : 'outline'
                    }>
                      {referral.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{referral.referred_email || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(referral.created_at), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rewards</CardTitle>
          <CardDescription>Distributed referral rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Earned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards?.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell>
                    <Badge variant="outline">{reward.reward_type}</Badge>
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    {reward.reward_value} credits
                  </TableCell>
                  <TableCell>
                    <Badge variant={reward.claimed ? 'default' : 'secondary'}>
                      {reward.claimed ? 'Claimed' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(reward.created_at), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
