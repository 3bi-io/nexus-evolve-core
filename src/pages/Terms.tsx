import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";

const Terms = () => {
  return (
    <PageLayout showHeader={true} showFooter={true} transition={true}>
      <SEO 
        title="Terms of Service - Legal Agreement & Usage Policies"
        description="Read the Terms of Service for Oneiros.me. Learn about acceptable use, user responsibilities, subscriptions, intellectual property rights, and more."
        keywords="terms of service, legal agreement, usage policy, terms and conditions, user agreement"
        canonical="https://oneiros.me/terms"
      />
      <div className="container max-w-4xl py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
            <CardDescription>
              By accessing or using Oneiros.me, you agree to these terms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              By accessing and using Oneiros.me (the "Service"), you accept and agree to be bound by these 
              Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>
            <p className="text-sm text-muted-foreground">
              We reserve the right to modify these Terms at any time. Your continued use of the Service after 
              changes are posted constitutes acceptance of the modified Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Service Description</CardTitle>
            <CardDescription>
              What Oneiros.me provides
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Oneiros.me is an AI-powered assistant platform that provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Multi-agent AI conversation and task completion</li>
              <li>Voice AI interactions with text-to-speech and speech-to-text capabilities</li>
              <li>Custom agent creation and marketplace</li>
              <li>Image generation and multimodal interactions</li>
              <li>Knowledge graph and semantic search</li>
              <li>Social intelligence and trend analysis</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Account Registration</CardTitle>
            <CardDescription>
              Creating and maintaining your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Account Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>You must be at least 13 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must not share your account credentials with others</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Account Termination</h3>
              <p className="text-sm text-muted-foreground">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in 
                fraudulent, abusive, or illegal activities.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Credit System and Billing</CardTitle>
            <CardDescription>
              How credits work and payment terms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Time-Based Credits</h3>
              <p className="text-sm text-muted-foreground">
                Our service uses a time-based credit system: 1 credit = 5 minutes (300 seconds) of usage. 
                Credits are deducted based on actual usage time, rounded up to the nearest credit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Free Tier</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Anonymous visitors: 5 credits per day</li>
                <li>Registered free users: 5 credits per day</li>
                <li>Credits reset daily at midnight UTC</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Paid Subscriptions</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Starter ($49/month):</strong> 500 credits (~42 hours/month)</li>
                <li><strong>Professional ($149/month):</strong> 2,000 credits (~167 hours/month)</li>
                <li><strong>Enterprise ($499/month):</strong> 10,000 credits (~833 hours/month)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Billing Terms</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Subscriptions are billed monthly or yearly in advance</li>
                <li>Unused credits do not roll over to the next billing period</li>
                <li>Refunds are provided on a case-by-case basis within 7 days of purchase</li>
                <li>You can cancel your subscription at any time</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Acceptable Use Policy</CardTitle>
            <CardDescription>
              What you can and cannot do with the Service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">You Agree NOT To:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction (including copyright laws)</li>
                <li>Transmit viruses, malware, or any malicious code</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Scrape or extract data using automated means without permission</li>
                <li>Use the Service to generate spam or harmful content</li>
                <li>Impersonate any person or entity</li>
                <li>Circumvent rate limits or credit restrictions</li>
                <li>Resell or redistribute the Service without authorization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Content Restrictions</h3>
              <p className="text-sm text-muted-foreground">
                You may not use the Service to create or share content that is:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Illegal, harmful, threatening, or abusive</li>
                <li>Sexually explicit or pornographic</li>
                <li>Racist, hateful, or discriminatory</li>
                <li>Infringing on intellectual property rights</li>
                <li>Intended to deceive or defraud</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Intellectual Property</CardTitle>
            <CardDescription>
              Ownership of content and code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Our Rights</h3>
              <p className="text-sm text-muted-foreground">
                All intellectual property rights in the Service, including software, design, logos, and 
                trademarks, are owned by Oneiros.me or our licensors.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Your Content</h3>
              <p className="text-sm text-muted-foreground">
                You retain ownership of any content you input into the Service. However, by using the Service, 
                you grant us a worldwide, non-exclusive license to use, store, and process your content solely 
                to provide and improve the Service.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">AI-Generated Content</h3>
              <p className="text-sm text-muted-foreground">
                Content generated by our AI models is provided "as-is" without warranties. You are responsible 
                for reviewing and verifying AI-generated content before use. We do not claim ownership of 
                AI-generated output, but you acknowledge that similar outputs may be generated for other users.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Referral Program</CardTitle>
            <CardDescription>
              Terms for the referral reward system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Referral Rewards</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Referrer receives 100 credits when a referred user signs up and verifies their email</li>
                <li>Referred user receives 50 bonus credits upon signup</li>
                <li>Referrer receives an additional 50 credits when the referred user completes 3+ interactions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Fraud Prevention</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Maximum 50 referrals per day per user</li>
                <li>Self-referrals are not allowed</li>
                <li>Referral codes are one-time use only</li>
                <li>We reserve the right to void fraudulent referrals and revoke credits</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Disclaimers and Limitations</CardTitle>
            <CardDescription>
              Important legal limitations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Service "AS IS"</h3>
              <p className="text-sm text-muted-foreground">
                The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either 
                express or implied. We do not guarantee that the Service will be uninterrupted, error-free, 
                or secure.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">AI Limitations</h3>
              <p className="text-sm text-muted-foreground">
                AI-generated content may be inaccurate, biased, or inappropriate. You use AI outputs at your 
                own risk. We are not responsible for decisions made based on AI-generated information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Limitation of Liability</h3>
              <p className="text-sm text-muted-foreground">
                To the maximum extent permitted by law, Oneiros.me and its affiliates shall not be liable for 
                any indirect, incidental, special, consequential, or punitive damages, or any loss of profits 
                or revenues, whether incurred directly or indirectly.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Privacy and Data</CardTitle>
            <CardDescription>
              How we handle your information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your use of the Service is subject to our <a href="/privacy" className="text-primary underline">Privacy Policy</a>, 
              which is incorporated into these Terms by reference. Please review the Privacy Policy to 
              understand how we collect, use, and protect your data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Third-Party Services</CardTitle>
            <CardDescription>
              External services we integrate with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Our Service integrates with third-party AI providers including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>OpenAI (GPT models)</li>
              <li>Anthropic (Claude models)</li>
              <li>Grok (xAI models)</li>
              <li>ElevenLabs (Voice AI)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              These third-party services have their own terms and privacy policies. We are not responsible 
              for their practices or any issues arising from their services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Dispute Resolution</CardTitle>
            <CardDescription>
              How disputes are handled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Governing Law</h3>
              <p className="text-sm text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                where Oneiros.me is registered, without regard to conflict of law principles.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Arbitration</h3>
              <p className="text-sm text-muted-foreground">
                Any disputes arising from these Terms or your use of the Service shall be resolved through 
                binding arbitration, except where prohibited by law.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Changes to Service</CardTitle>
            <CardDescription>
              We may modify or discontinue features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time, 
              with or without notice. We will not be liable to you or any third party for any modification, 
              suspension, or discontinuation of the Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>13. Contact Information</CardTitle>
            <CardDescription>
              How to reach us
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> <a href="mailto:c@3bi.io" className="text-primary underline">c@3bi.io</a></p>
              <p><strong>Website:</strong> <a href="https://oneiros.me" className="text-primary underline">https://oneiros.me</a></p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground pt-8">
          <p>© {new Date().getFullYear()} Oneiros.me. All rights reserved.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Terms;
