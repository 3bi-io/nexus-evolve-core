import { PageLayout } from '@/components/layout/PageLayout';
import { SEO } from '@/components/SEO';
import { AutomationDashboard } from '@/components/automation/AutomationDashboard';
import { Zap } from 'lucide-react';

export default function AutomationHub() {
  return (
    <PageLayout title="Automation Hub" showBack={true}>
      <SEO
        title="Automation Hub - Agentic AI Automation | Scheduled Pipelines"
        description="Enterprise automation with scheduled trend monitoring, multi-step AI pipelines, content generation queues, and intelligent caching for optimal performance."
        keywords="AI automation, scheduled monitoring, content pipelines, smart caching, agentic workflows"
        canonical="https://oneiros.me/automation-hub"
      />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Automation Hub</h1>
            <p className="text-muted-foreground">
              Agentic automation with scheduled monitoring and smart pipelines
            </p>
          </div>
        </div>

        <AutomationDashboard />
      </div>
    </PageLayout>
  );
}
