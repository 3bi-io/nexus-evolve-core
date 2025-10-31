import { PageTransition } from "@/components/ui/page-transition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Privacy = () => {
  return (
    <PageTransition>
      <div className="container max-w-4xl py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
            <CardDescription>
              We collect information to provide and improve our AI assistant services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Account Information</h3>
              <p className="text-sm text-muted-foreground">
                When you create an account, we collect your email address and authentication credentials.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Usage Data</h3>
              <p className="text-sm text-muted-foreground">
                We collect information about your interactions with the AI, including messages, session data, 
                and usage patterns to improve our services and provide personalized experiences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Anonymous Visitor Data</h3>
              <p className="text-sm text-muted-foreground">
                For users without accounts, we collect encrypted IP addresses (hashed with SHA-256) to manage 
                daily credit limits and prevent abuse. This data is anonymized and cannot be traced back to individuals.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
            <CardDescription>
              Your data helps us provide, maintain, and improve our services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Provide and maintain our AI assistant services</li>
              <li>Process your requests and transactions</li>
              <li>Send important service updates and notifications</li>
              <li>Improve and personalize your experience</li>
              <li>Detect, prevent, and address fraud and security issues</li>
              <li>Train and improve our AI models (with anonymized data)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Data Storage and Security</CardTitle>
            <CardDescription>
              We implement industry-standard security measures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your data is stored securely using Supabase, a SOC 2 Type II certified platform. We implement:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Encryption in transit (TLS 1.2+) and at rest (AES-256)</li>
              <li>Row-level security policies to protect your data</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>IP address hashing for anonymous user tracking</li>
              <li>Secure API key management in Supabase Vault</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Sharing and Third Parties</CardTitle>
            <CardDescription>
              We minimize data sharing and only work with trusted partners
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">AI Service Providers</h3>
              <p className="text-sm text-muted-foreground">
                Your messages are sent to AI providers (OpenAI, Anthropic, Grok, ElevenLabs) to generate responses. 
                These providers have their own privacy policies and data handling practices.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">We Do NOT Sell Your Data</h3>
              <p className="text-sm text-muted-foreground">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Your Rights (GDPR & CCPA)</CardTitle>
            <CardDescription>
              You have control over your personal data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to certain data processing activities</li>
              <li><strong>Restriction:</strong> Request restriction of processing under certain circumstances</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              To exercise these rights, contact us at: <a href="mailto:c@3bi.io" className="text-primary underline">c@3bi.io</a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Data Retention</CardTitle>
            <CardDescription>
              How long we keep your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li><strong>Account Data:</strong> Retained until you delete your account</li>
              <li><strong>Conversation History:</strong> Retained for service improvement, can be deleted on request</li>
              <li><strong>Usage Logs:</strong> Retained for 90 days for debugging and analytics</li>
              <li><strong>Rate Limit Logs:</strong> Automatically deleted after 2 hours</li>
              <li><strong>Anonymous Visitor Data:</strong> Hashed IP addresses retained for 30 days</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Cookies and Tracking</CardTitle>
            <CardDescription>
              We use minimal tracking for functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We use essential cookies for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Authentication and session management</li>
              <li>Remembering your preferences (theme, language)</li>
              <li>Security and fraud prevention</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              We do not use third-party advertising cookies or trackers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Children's Privacy</CardTitle>
            <CardDescription>
              Our service is not intended for children
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our services are not directed to individuals under the age of 13. We do not knowingly collect 
              personal information from children. If you believe we have collected data from a child, 
              please contact us immediately at <a href="mailto:c@3bi.io" className="text-primary underline">c@3bi.io</a>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. International Data Transfers</CardTitle>
            <CardDescription>
              Where your data may be processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your data may be transferred to and processed in countries outside your country of residence, 
              including the United States. We ensure appropriate safeguards are in place through our use of 
              SOC 2 compliant service providers and adherence to GDPR standards.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Changes to This Policy</CardTitle>
            <CardDescription>
              How we notify you of updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of significant changes 
              by email or through a prominent notice in our service. Your continued use of the service after 
              changes become effective constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Contact Us</CardTitle>
            <CardDescription>
              Questions about privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
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
    </PageTransition>
  );
};

export default Privacy;
