import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/ui/empty-state';
import { AgentChat } from '@/components/agents/AgentChat';
import { SEO } from '@/components/SEO';

export default function AgentExecutor() {
  const { agentId } = useParams<{ agentId: string }>();

  if (!agentId) {
    return (
      <AppLayout title="Agent Chat" showBottomNav>
        <EmptyState
          icon={AgentChat as any}
          title="Agent not found"
          description="The requested agent could not be found"
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Agent Chat" showBottomNav>
      <SEO
        title="Agent Chat - Execute Custom AI Agent"
        description="Chat with your custom AI agent and leverage its specialized capabilities"
        canonical="https://oneiros.me/agent-executor"
      />
      <div className="container max-w-5xl py-8">
        <AgentChat agentId={agentId} />
      </div>
    </AppLayout>
  );
}
