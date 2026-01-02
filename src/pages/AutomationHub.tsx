import { PageLayout } from '@/components/layout/PageLayout';
import { SEO } from '@/components/SEO';
import { AutomationDashboard } from '@/components/automation/AutomationDashboard';
import { Zap, Building2, Clock, Workflow, Shield, Users } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { UpgradePrompt } from '@/components/stripe/UpgradePrompt';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AUTOMATION_FEATURES = [
  {
    icon: Clock,
    title: 'Scheduled Pipelines',
    description: 'Run AI workflows on custom schedules - hourly, daily, or event-triggered',
  },
  {
    icon: Workflow,
    title: 'Multi-Step Workflows',
    description: 'Chain multiple AI operations together with conditional logic',
  },
  {
    icon: Shield,
    title: 'Smart Caching',
    description: 'Intelligent response caching to reduce costs and improve speed',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share automation pipelines across your organization',
  },
];

export default function AutomationHub() {
  const { canAccess, requiredTier } = useFeatureAccess("automation");

  return (
    <PageLayout title="Automation Hub" showBack>
      <SEO
        title="Automation Hub - Agentic AI Automation | Scheduled Pipelines"
        description="Enterprise automation with scheduled trend monitoring, multi-step AI pipelines, content generation queues, and intelligent caching for optimal performance."
        keywords="AI automation, scheduled monitoring, content pipelines, smart caching, agentic workflows"
        canonical="https://oneiros.me/automation-hub"
      />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Automation Hub</h1>
            <p className="text-muted-foreground">
              Agentic automation with scheduled monitoring and smart pipelines
            </p>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {AUTOMATION_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Feature Gate Check */}
        {!canAccess && requiredTier ? (
          <div className="space-y-6">
            <UpgradePrompt 
              feature="Automation Hub" 
              requiredTier={requiredTier} 
              variant="card" 
            />
            
            <Card className="p-6 border-dashed">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Enterprise-Grade Automation</h3>
                  <p className="text-sm text-muted-foreground">
                    Automation Hub is designed for teams that need reliable, scalable AI workflows
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">SLA Guarantee</Badge>
                <Badge variant="outline">Priority Support</Badge>
                <Badge variant="outline">Custom Integrations</Badge>
                <Badge variant="outline">Team Management</Badge>
              </div>
            </Card>
          </div>
        ) : (
          <AutomationDashboard />
        )}
      </div>
    </PageLayout>
  );
}