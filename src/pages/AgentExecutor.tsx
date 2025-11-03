import { useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { AgentChat } from '@/components/agents/AgentChat';
import { SEO } from '@/components/SEO';

export default function AgentExecutor() {
  const { agentId } = useParams<{ agentId: string }>();

  if (!agentId) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Agent not found</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO 
        title="Agent Chat - Execute Custom AI Agent"
        description="Chat with your custom AI agent and leverage its specialized capabilities"
        canonical="https://oneiros.me/agent-executor"
      />
      <div className="container max-w-5xl py-8">
        <AgentChat agentId={agentId} />
      </div>
    </PageLayout>
  );
}
