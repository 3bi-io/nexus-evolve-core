import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Shield, Users, Rocket, Target } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Brain,
      title: 'AI-First Innovation',
      description: 'Building the future of autonomous AI systems that learn and evolve'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with SOC 2 compliance and end-to-end encryption'
    },
    {
      icon: Users,
      title: 'Customer Success',
      description: 'Dedicated support and success teams helping you achieve your goals'
    },
    {
      icon: Zap,
      title: 'Performance First',
      description: 'Lightning-fast infrastructure built for scale and reliability'
    }
  ];

  const milestones = [
    { year: '2023', title: 'Founded', description: 'Oneiros launched with vision AI capabilities' },
    { year: '2024 Q1', title: 'Voice AI', description: 'Added conversational voice agents with ElevenLabs' },
    { year: '2024 Q2', title: 'xAI Integration', description: 'Integrated Grok for advanced reasoning' },
    { year: '2024 Q3', title: 'Agent Marketplace', description: '100+ custom AI agents deployed' },
    { year: '2024 Q4', title: 'Enterprise Ready', description: 'Full production deployment capabilities' }
  ];

  return (
    <MarketingLayout title="About Us">
      <SEO
        title="About Oneiros - Building the Future of AI Automation"
        description="Learn about Oneiros, the AI automation platform trusted by enterprises to deploy vision analysis, voice agents, and autonomous workflows at scale."
        canonical="https://oneiros.me/about"
      />
      
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="mb-4">About Oneiros</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Building the Future of AI Automation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Oneiros is a production-ready AI automation platform that enables enterprises to deploy 
            vision analysis, voice agents, and autonomous workflows at scale.
          </p>
        </div>

        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Mission</h2>
          <Card className="border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Target className="h-12 w-12 text-primary flex-shrink-0" />
                <div className="space-y-4">
                  <p className="text-lg">
                    To democratize AI automation by providing enterprise-grade tools that anyone can use. 
                    We believe AI should be accessible, powerful, and autonomous - working for you 24/7 
                    without constant oversight.
                  </p>
                  <p className="text-muted-foreground">
                    Our platform combines cutting-edge AI models from OpenAI, Anthropic, xAI, and ElevenLabs 
                    into a unified system that learns, evolves, and improves over time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((milestone, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-base px-3 py-1">{milestone.year}</Badge>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardContent className="p-8">
              <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Join Us on This Journey</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                We're building the most advanced AI automation platform in the world. 
                Join thousands of businesses already automating with Oneiros.
              </p>
              <a 
                href="/auth" 
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                Get Started Free
              </a>
            </CardContent>
          </Card>
        </section>
      </div>
    </MarketingLayout>
  );
}
