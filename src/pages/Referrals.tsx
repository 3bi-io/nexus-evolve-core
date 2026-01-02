import { PageLayout } from "@/components/layout/PageLayout";
import { LoadingPage } from "@/components/layout/LoadingPage";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ReferralCard } from "@/components/referral/ReferralCard";
import { ShareDialog } from "@/components/referral/ShareDialog";
import { InviteDialog } from "@/components/referral/InviteDialog";
import { ReferralRewards } from "@/components/referral/ReferralRewards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useReferrals } from "@/hooks/useReferrals";
import { useResponsive } from "@/hooks/useResponsive";
import { Users, Gift, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const Referrals = () => {
  const { stats, userReferralCode, referrals, loading } = useReferrals();
  const { isMobile } = useResponsive();

  if (loading) {
    return <LoadingPage cardCount={3} />;
  }

  return (
    <AuthGuard featureName="referral program">
    <PageLayout title="Referrals" showBottomNav={true}>
      <SEO
        title="Referral Program - Invite Friends & Unlock Exclusive Features"
        description="Invite friends to Oneiros.me and unlock exclusive features. Unlock milestone rewards: Priority support at 5 referrals, Beta Access at 10, VIP Status at 25."
        keywords="referral program, invite friends, AI referrals, bonus rewards, exclusive features"
        canonical="https://oneiros.me/referrals"
      />
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Referral Program</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Invite friends and earn rewards together
            </p>
          </div>
          <div className="flex gap-2 md:gap-3">
            <InviteDialog />
            <ShareDialog referralCode={userReferralCode} />
          </div>
        </div>

        {/* Main Referral Card */}
        <ReferralCard stats={stats} referralCode={userReferralCode} />

        {/* Stack on mobile, grid on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Rewards */}
          <ReferralRewards />

          {/* How It Works */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <TrendingUp className="h-5 w-5" />
                How It Works
              </CardTitle>
              <CardDescription className="text-sm">
                Simple steps to earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { step: 1, title: "Share Your Link", desc: "Share your unique referral link via social media, email, or messaging" },
                { step: 2, title: "They Sign Up", desc: "Your friends create an account using your referral link" },
                { step: 3, title: "You Both Win!", desc: "You unlock exclusive features for each successful referral" },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{item.step}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm md:text-base mb-0.5">{item.title}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  <h4 className="font-semibold text-sm md:text-base">Milestone Rewards</h4>
                </div>
                <div className="space-y-2 mt-3">
                  {[
                    { count: 5, reward: "Priority Support" },
                    { count: 10, reward: "Beta Access" },
                    { count: 25, reward: "VIP Status" },
                  ].map((milestone) => (
                    <div key={milestone.count} className="flex items-center justify-between text-xs md:text-sm">
                      <span>{milestone.count} referrals</span>
                      <Badge variant="secondary" className="text-xs">{milestone.reward}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Referrals */}
        {referrals.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Users className="h-5 w-5" />
                Recent Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 md:space-y-3">
                {referrals.slice(0, isMobile ? 5 : 10).map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm md:text-base truncate">{referral.referred_email}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
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
                      className="text-xs flex-shrink-0 ml-2"
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
    </AuthGuard>
  );
};

export default Referrals;
