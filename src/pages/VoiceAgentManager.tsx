import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useElevenLabsAgents } from "@/hooks/useElevenLabsAgents";
import { Mic, Plus, Pencil, Trash2, Copy, Check, Settings, MessageSquare, Globe } from "lucide-react";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

export default function VoiceAgentManager() {
  const { agents, voices, isLoading, createAgent, updateAgent, deleteAgent } = useElevenLabsAgents();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    prompt: "",
    firstMessage: "",
    voiceId: "",
    language: "en",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      prompt: "",
      firstMessage: "",
      voiceId: "",
      language: "en",
    });
    setEditingAgent(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.voiceId) {
      toast.error("Please fill in required fields");
      return;
    }

    const config = {
      name: formData.name,
      conversation_config: {
        agent: {
          prompt: { prompt: formData.prompt },
          first_message: formData.firstMessage,
          language: formData.language,
        },
        tts: {
          voice_id: formData.voiceId,
        },
      },
    };

    if (editingAgent) {
      await updateAgent.mutateAsync({ agentId: editingAgent.agent_id, ...config });
    } else {
      await createAgent.mutateAsync(config);
    }

    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = (agent: any) => {
    setFormData({
      name: agent.name,
      prompt: agent.conversation_config?.agent?.prompt?.prompt || "",
      firstMessage: agent.conversation_config?.agent?.first_message || "",
      voiceId: agent.conversation_config?.tts?.voice_id || "",
      language: agent.conversation_config?.agent?.language || "en",
    });
    setEditingAgent(agent);
    setIsCreateOpen(true);
  };

  const copyAgentId = (agentId: string) => {
    navigator.clipboard.writeText(agentId);
    setCopiedId(agentId);
    toast.success("Agent ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageLayout title="Voice Agent Manager" showBack={true}>
      <SEO
        title="Voice Agent Manager - Manage ElevenLabs Agents"
        description="Create and manage ElevenLabs conversational AI agents. Configure voices, prompts, and settings."
        keywords="voice agent manager, ElevenLabs, conversational AI, voice configuration"
      />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Mic className="w-10 h-10 text-primary" />
              Voice Agent Manager
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your ElevenLabs conversational AI agents
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAgent ? "Edit Agent" : "Create New Agent"}
                </DialogTitle>
                <DialogDescription>
                  Configure your conversational AI agent settings
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name *</Label>
                  <Input
                    id="name"
                    placeholder="Customer Support Agent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice">Voice *</Label>
                  <Select
                    value={formData.voiceId}
                    onValueChange={(value) => setFormData({ ...formData, voiceId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices?.map((voice) => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">System Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="You are a helpful customer support agent..."
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define how the agent should behave and respond
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstMessage">First Message</Label>
                  <Textarea
                    id="firstMessage"
                    placeholder="Hello! How can I help you today?"
                    value={formData.firstMessage}
                    onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    The first thing the agent will say when starting a conversation
                  </p>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingAgent ? "Update Agent" : "Create Agent"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agents && agents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent: any) => (
              <Card key={agent.agent_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Mic className="w-5 h-5 text-primary" />
                        {agent.name}
                      </CardTitle>
                      <CardDescription className="mt-2 font-mono text-xs">
                        ID: {agent.agent_id.slice(0, 12)}...
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      <Globe className="w-3 h-3 mr-1" />
                      {agent.conversation_config?.agent?.language || "en"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {agent.conversation_config?.agent?.prompt?.prompt && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Settings className="w-3 h-3" />
                        <span>System Prompt</span>
                      </div>
                      <p className="text-sm line-clamp-3">
                        {agent.conversation_config.agent.prompt.prompt}
                      </p>
                    </div>
                  )}

                  {agent.conversation_config?.agent?.first_message && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3" />
                        <span>First Message</span>
                      </div>
                      <p className="text-sm line-clamp-2">
                        {agent.conversation_config.agent.first_message}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyAgentId(agent.agent_id)}
                    >
                      {copiedId === agent.agent_id ? (
                        <Check className="w-4 h-4 mr-1" />
                      ) : (
                        <Copy className="w-4 h-4 mr-1" />
                      )}
                      Copy ID
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(agent)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{agent.name}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAgent.mutate(agent.agent_id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Mic className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Agents Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first conversational AI agent to get started
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Agent
            </Button>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
