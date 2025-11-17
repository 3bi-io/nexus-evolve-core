import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Server, CheckCircle, FileCheck } from 'lucide-react';

export default function Security() {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Security-Focused Architecture',
      description: 'Built with industry best practices and modern security standards'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data encrypted in transit (TLS 1.3) and at rest (AES-256)'
    },
    {
      icon: Eye,
      title: 'Privacy First',
      description: 'Your data is never used to train AI models or shared with third parties'
    },
    {
      icon: Server,
      title: 'Enterprise Infrastructure',
      description: 'Hosted on Supabase with automatic backups and monitoring'
    },
    {
      icon: CheckCircle,
      title: 'Continuous Security',
      description: 'Regular security updates and vulnerability monitoring'
    },
    {
      icon: FileCheck,
      title: 'Privacy Compliant',
      description: 'GDPR and CCPA data privacy compliance'
    }
  ];

  const certifications = [
    'GDPR Compliant',
    'CCPA Compliant',
    'End-to-End Encryption',
    'Secure Infrastructure'
  ];

  return (
    <MarketingLayout>
      <SEO
        title="Security & Compliance - Enterprise-Grade Protection | Oneiros"
        description="Learn about Oneiros security measures: SOC 2 compliance, end-to-end encryption, GDPR compliance, and enterprise-grade infrastructure protection."
        canonical="https://oneiros.me/security"
      />
      
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="mb-4">Security & Compliance</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Enterprise-Grade Security</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your data security is our top priority. We implement industry-leading security 
            practices and maintain the highest compliance standards.
          </p>
        </div>

        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Certifications & Compliance</h2>
          <Card className="border-primary/20">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {certifications.map((cert) => (
                  <div key={cert} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Data Protection</h2>
          <Card className="border-primary/20">
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Data Encryption</h3>
                <p className="text-muted-foreground">
                  All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. 
                  Encryption keys are managed through AWS KMS with automatic rotation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Access Controls</h3>
                <p className="text-muted-foreground">
                  Role-based access control (RBAC) ensures that users only have access to the data they need. 
                  All access is logged and monitored for suspicious activity.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Data Retention</h3>
                <p className="text-muted-foreground">
                  You have full control over your data. Export or delete your data at any time. 
                  We maintain backups for 30 days with point-in-time recovery capabilities.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Privacy Commitment</h3>
                <p className="text-muted-foreground">
                  Your data is never used to train AI models. We never sell your data to third parties. 
                  You own your data, and we're just custodians.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Questions About Security?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our security team is here to answer your questions. Contact us for our 
                full security white paper and compliance documentation.
              </p>
              <a
                href="mailto:security@oneiros.me"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                Contact Security Team
              </a>
            </CardContent>
          </Card>
        </section>
      </div>
    </MarketingLayout>
  );
}
