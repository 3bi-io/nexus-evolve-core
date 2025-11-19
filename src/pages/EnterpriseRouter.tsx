import { Helmet } from 'react-helmet-async';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RouterPreferences } from '@/components/router/RouterPreferences';
import { ABTestingPanel } from '@/components/router/ABTestingPanel';
import { CostAlertsPanel } from '@/components/router/CostAlertsPanel';
import { Settings, FlaskConical, DollarSign, BarChart3 } from 'lucide-react';

const EnterpriseRouter = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>Enterprise Router - Oneiros.me</title>
        <meta 
          name="description" 
          content="Advanced AI routing with custom rules, A/B testing, and cost management"
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Enterprise Router</h1>
            <p className="text-muted-foreground">
              Advanced routing configuration and optimization
            </p>
          </div>
        </div>

        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="abtesting" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              A/B Testing
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Alerts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-4">
            <RouterPreferences />
          </TabsContent>

          <TabsContent value="abtesting" className="space-y-4">
            <ABTestingPanel />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <CostAlertsPanel />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="p-8 text-center text-muted-foreground">
              Advanced analytics coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default EnterpriseRouter;
