import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AgentBuilder } from '@/components/agents/AgentBuilder';
import { AgentTemplates } from '@/components/agents/AgentTemplates';
import { MyAgents } from '@/components/agents/MyAgents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Plus, Library } from 'lucide-react';

export default function AgentStudio() {
  const [activeTab, setActiveTab] = useState('my-agents');

  return (
    <PageLayout>
      <div className="container max-w-7xl py-8">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Agent Studio</h1>
            <p className="text-muted-foreground">
              Create, customize, and manage your AI agents
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="my-agents" className="gap-2">
              <Library className="w-4 h-4" />
              My Agents
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Plus className="w-4 h-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-agents" className="mt-6">
            <MyAgents />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <AgentBuilder />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <AgentTemplates />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
