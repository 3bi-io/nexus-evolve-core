import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Users, PenTool, Search, TrendingUp } from 'lucide-react';

const USE_CASES = [
  {
    icon: Code,
    title: 'Product Teams',
    description: 'Ship features 3x faster',
    benefits: ['Multi-agent coordination', 'Code generation', 'Automated testing', 'Requirements analysis'],
    stat: '3x faster delivery',
  },
  {
    icon: Users,
    title: 'Customer Success',
    description: '24/7 intelligent support',
    benefits: ['Voice AI support', 'Knowledge base search', 'Sentiment analysis', 'Auto-responses'],
    stat: '89% automation rate',
  },
  {
    icon: PenTool,
    title: 'Content Creators',
    description: 'Generate & optimize content',
    benefits: ['AI writing assistant', 'Image generation', 'SEO optimization', 'Trend analysis'],
    stat: '5x content output',
  },
  {
    icon: Search,
    title: 'Researchers',
    description: 'Analyze & synthesize data',
    benefits: ['Document analysis', 'Knowledge graphs', 'Citation finder', 'Summary generation'],
    stat: '70% time saved',
  },
  {
    icon: TrendingUp,
    title: 'Sales Teams',
    description: 'Personalized outreach at scale',
    benefits: ['Lead scoring', 'Email generation', 'CRM integration', 'Follow-up automation'],
    stat: '2.5x conversion',
  },
];

export function UseCases() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Built for Every Team</h2>
        <p className="text-muted-foreground text-lg">
          From startups to enterprises, see how teams use Oneiros
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((useCase) => {
          const Icon = useCase.icon;
          return (
            <Card key={useCase.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{useCase.stat}</Badge>
                </div>
                <CardTitle>{useCase.title}</CardTitle>
                <CardDescription>{useCase.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {useCase.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-primary">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}