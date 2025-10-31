import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSecretValidation } from "@/hooks/useSecretValidation";
import { Shield, RefreshCw, CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const API_KEY_INFO: Record<string, { name: string; description: string; docsUrl: string }> = {
  OPENAI_API_KEY: {
    name: "OpenAI API",
    description: "Powers main chat functionality with GPT models",
    docsUrl: "https://platform.openai.com/api-keys"
  },
  LOVABLE_API_KEY: {
    name: "Lovable AI Gateway",
    description: "Manages AI routing and observability",
    docsUrl: "https://docs.lovable.dev"
  },
  TAVILY_API_KEY: {
    name: "Tavily Search",
    description: "Enables web search capabilities for AI agents",
    docsUrl: "https://tavily.com"
  },
  ANTHROPIC_API_KEY: {
    name: "Anthropic Claude",
    description: "Provides Claude models for advanced reasoning",
    docsUrl: "https://console.anthropic.com"
  },
  REPLICATE_API_KEY: {
    name: "Replicate",
    description: "Runs ML models for image generation and processing",
    docsUrl: "https://replicate.com/account/api-tokens"
  },
  MEM0_API_KEY: {
    name: "Mem0",
    description: "Advanced memory management for AI applications",
    docsUrl: "https://mem0.ai"
  },
  PINECONE_API_KEY: {
    name: "Pinecone Vector DB",
    description: "Vector database for semantic search and RAG",
    docsUrl: "https://app.pinecone.io"
  },
  PINECONE_HOST: {
    name: "Pinecone Host",
    description: "Pinecone index host URL",
    docsUrl: "https://docs.pinecone.io"
  }
};

const SystemHealth = () => {
  const { validation, isLoading, refetch } = useSecretValidation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getStatusIcon = (valid: boolean, error?: string) => {
    if (error === 'Not configured') {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return valid 
      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
      : <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = (valid: boolean, error?: string) => {
    if (error === 'Not configured') {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Not Configured</Badge>;
    }
    return valid
      ? <Badge variant="outline" className="text-green-600 border-green-600">Valid</Badge>
      : <Badge variant="destructive">Invalid</Badge>;
  };

  return (
    <PageLayout>
      <Helmet>
        <title>System Health - API Key Validation</title>
        <meta name="description" content="Monitor and validate API key configurations" />
      </Helmet>

      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              System Health
            </h1>
            <p className="text-muted-foreground">
              Monitor API key validation status and system configuration
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading || isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Re-validate All
          </Button>
        </div>

        {validation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{validation.summary.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{validation.summary.valid}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {validation.summary.invalid + validation.summary.notConfigured}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>API Keys Status</CardTitle>
            <CardDescription>
              {validation 
                ? `Last checked ${formatDistanceToNow(new Date(validation.timestamp))} ago`
                : 'Loading validation status...'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validation && Object.entries(validation.results).map(([key, result]) => {
                const info = API_KEY_INFO[key];
                if (!info) return null;

                return (
                  <div 
                    key={key}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(result.valid, result.error)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{info.name}</h3>
                        {getStatusBadge(result.valid, result.error)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {info.description}
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600 font-medium">
                          Error: {result.error}
                        </p>
                      )}
                      {result.endpoint && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Endpoint: {result.endpoint}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(info.docsUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              API keys should be configured in your Supabase project's edge function secrets.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://supabase.com/dashboard/project/coobieessxvnujkkiadc/settings/functions', '_blank')}
              className="mt-2"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Supabase Secrets
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SystemHealth;
