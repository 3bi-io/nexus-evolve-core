import { PageLayout } from "@/components/layout/PageLayout";
import { LoadingPage } from "@/components/layout/LoadingPage";
import { ReferralCard } from "@/components/referral/ReferralCard";
import { ShareDialog } from "@/components/referral/ShareDialog";
import { InviteDialog } from "@/components/referral/InviteDialog";
import { ReferralRewards } from "@/components/referral/ReferralRewards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReferrals } from "@/hooks/useReferrals";
import { Users, Gift, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const Referrals = () => {
  const { stats, userReferralCode, referrals, loading } = useReferrals();

  if (loading) {
    return <LoadingPage cardCount={3} />;
  }

  return (
    <PageLayout title="Referrals" showBottomNav={true}>
      <SEO 
        title="Referral Program - Earn 100 Credits Per Referral & Bonus Rewards"
        description="Invite friends to Oneiros.me and earn 100 credits for each successful referral. Unlock milestone rewards: 500 bonus credits at 5 referrals, Premium Trial at 10, VIP Status at 25."
        keywords="referral program, earn credits, invite friends, AI referrals, bonus rewards"
        canonical="https://oneiros.me/referrals"
      />
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Referral Program</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Invite friends and earn rewards together
            </p>
          </div>
            <div className="flex gap-3">
              <InviteDialog />
              <ShareDialog referralCode={userReferralCode} />
            </div>
          </div>

          {/* Main Referral Card */}
          <ReferralCard stats={stats} referralCode={userReferralCode} />

          <div className="grid md:grid-cols-2 gap-6">
            {/* Rewards */}
            <ReferralRewards />

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  How It Works
                </CardTitle>
                <CardDescription>
                  Simple steps to earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Share Your Link</h4>
                    <p className="text-sm text-muted-foreground">
                      Share your unique referral link with friends via social media, email, or messaging
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">They Sign Up</h4>
                    <p className="text-sm text-muted-foreground">
                      Your friends create an account using your referral link
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">You Both Win!</h4>
                    <p className="text-sm text-muted-foreground">
                      You earn 100 credits for each successful referral, and they get started with bonus credits too
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Bonus Rewards</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reach milestones to unlock special rewards:
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>5 referrals</span>
                      <Badge variant="secondary">500 bonus credits</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>10 referrals</span>
                      <Badge variant="secondary">Premium Trial</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>25 referrals</span>
                      <Badge variant="secondary">VIP Status</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Referrals */}
          {referrals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referrals.slice(0, 10).map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{referral.referred_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          referral.status === 'converted'
                            ? 'default'
                            : referral.status === 'signed_up'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {referral.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </PageLayout>
  );
};

export default Referrals;
