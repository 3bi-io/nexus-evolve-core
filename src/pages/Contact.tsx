import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Book, Shield } from 'lucide-react';

export default function Contact() {
  const contactOptions = [
    {
      icon: MessageSquare,
      title: 'Support Chat',
      description: 'Get instant help from our AI-powered support',
      action: 'Start Chat',
      link: '/chat'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Reach out to our team directly',
      action: 'support@oneiros.me',
      link: 'mailto:support@oneiros.me'
    },
    {
      icon: Book,
      title: 'Documentation',
      description: 'Explore guides and tutorials',
      action: 'View Docs',
      link: '/getting-started'
    },
    {
      icon: Shield,
      title: 'Enterprise Sales',
      description: 'Custom solutions for your organization',
      action: 'enterprise@oneiros.me',
      link: 'mailto:enterprise@oneiros.me'
    }
  ];

  return (
    <MarketingLayout>
      <SEO
        title="Contact Us - Get Support & Answers | Oneiros"
        description="Get help with Oneiros. Contact our support team, explore documentation, or reach out for enterprise solutions."
        canonical="https://oneiros.me/contact"
      />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="mb-4">Contact Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">We're Here to Help</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the best way to reach us. We typically respond within 24 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {contactOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card key={option.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <p className="text-muted-foreground">{option.description}</p>
                </CardHeader>
                <CardContent>
                  {option.link.startsWith('mailto:') ? (
                    <a
                      href={option.link}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm"
                    >
                      {option.action}
                    </a>
                  ) : (
                    <Link
                      to={option.link}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm"
                    >
                      {option.action}
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What's your response time?</h3>
                <p className="text-muted-foreground">We typically respond to all inquiries within 24 hours during business days. Enterprise customers get priority support.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer phone support?</h3>
                <p className="text-muted-foreground">Phone support is available for Enterprise plan customers. All users can access our AI-powered chat support 24/7.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I schedule a demo?</h3>
                <p className="text-muted-foreground">Yes! Email us at enterprise@oneiros.me to schedule a personalized demo of the platform.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Where can I find more information?</h3>
                <p className="text-muted-foreground">Check out our <Link to="/getting-started" className="text-primary hover:underline">Getting Started guide</Link> and <Link to="/agent-marketplace" className="text-primary hover:underline">Agent Marketplace</Link> for detailed information.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingLayout>
  );
}
