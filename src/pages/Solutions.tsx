import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, Building2, Briefcase, GraduationCap, 
  Stethoscope, Gavel, Newspaper, Users, CheckCircle 
} from 'lucide-react';

export default function Solutions() {
  const industries = [
    {
      icon: ShoppingCart,
      name: 'E-Commerce',
      description: 'Automate product descriptions, customer support, and content generation',
      features: [
        'AI product descriptions',
        '24/7 customer support chat',
        'Visual product search',
        'Automated trend monitoring'
      ]
    },
    {
      icon: Building2,
      name: 'Real Estate',
      description: 'Generate property descriptions, analyze images, automate client communications',
      features: [
        'Property image analysis',
        'Automated listings',
        'Client Q&A agents',
        'Market trend reports'
      ]
    },
    {
      icon: Briefcase,
      name: 'Professional Services',
      description: 'Streamline workflows, automate research, enhance client deliverables',
      features: [
        'Document analysis',
        'Research automation',
        'Client report generation',
        'Knowledge base Q&A'
      ]
    },
    {
      icon: GraduationCap,
      name: 'Education',
      description: 'Create learning content, automate grading, provide student support',
      features: [
        'Content generation',
        'Student support agents',
        'Assignment analysis',
        'Personalized learning paths'
      ]
    },
    {
      icon: Stethoscope,
      name: 'Healthcare',
      description: 'Administrative automation, medical image analysis, patient communications',
      features: [
        'Appointment scheduling',
        'Patient Q&A',
        'Medical image analysis',
        'Report generation'
      ]
    },
    {
      icon: Gavel,
      name: 'Legal',
      description: 'Document review, legal research, contract analysis automation',
      features: [
        'Document analysis',
        'Legal research assistant',
        'Contract review',
        'Case summarization'
      ]
    },
    {
      icon: Newspaper,
      name: 'Media & Publishing',
      description: 'Content creation, image generation, trend analysis, SEO optimization',
      features: [
        'Content generation',
        'Image creation',
        'SEO optimization',
        'Trend monitoring'
      ]
    },
    {
      icon: Users,
      name: 'Marketing Agencies',
      description: 'Campaign automation, content creation, client reporting, analytics',
      features: [
        'Campaign automation',
        'Content creation',
        'Client reporting',
        'Performance analytics'
      ]
    }
  ];

  return (
    <MarketingLayout>
      <SEO
        title="Solutions by Industry - AI Automation for Every Sector | Oneiros"
        description="Discover industry-specific AI automation solutions for e-commerce, real estate, healthcare, legal, education, and more. Enterprise-ready AI for your business."
        canonical="https://oneiros.me/solutions"
      />
      
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="mb-4">Solutions</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">AI Automation for Every Industry</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Proven solutions tailored to your industry's specific needs and workflows
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <Card key={industry.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{industry.name}</CardTitle>
                  </div>
                  <p className="text-muted-foreground">{industry.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {industry.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Don't See Your Industry?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Oneiros is flexible enough to work with any industry. Contact us to discuss 
                custom solutions for your specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="/auth">Get Black Friday Deal</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/agent-marketplace">Browse Templates</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingLayout>
  );
}
