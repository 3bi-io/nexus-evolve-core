import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Save, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AVAILABLE_TOOLS = [
  { id: 'web_search', name: 'Web Search', description: 'Search the internet' },
  { id: 'calculator', name: 'Calculator', description: 'Perform calculations' },
  { id: 'semantic_search', name: 'Semantic Search', description: 'Search knowledge base' },
  { id: 'zapier', name: 'Zapier Integration', description: 'Trigger Zapier workflows' },
  { id: 'grok_trends', name: 'Grok Trends', description: 'Access real-time X trends' },
];

export function AgentBuilder() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [agent, setAgent] = useState({
    name: '',
    description: '',
    system_prompt: '',
    tools_enabled: [] as string[],
    model_preference: 'auto',
    temperature: 0.7,
    is_public: false,
  });

  const handleSave = async () => {
    if (!agent.name.trim() || !agent.system_prompt.trim()) {
      toast.error('Please provide a name and system prompt');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('custom_agents').insert({
        user_id: user.id,
        name: agent.name,
        description: agent.description,
        system_prompt: agent.system_prompt,
        tools_enabled: agent.tools_enabled,
        model_preference: agent.model_preference,
        temperature: agent.temperature,
        is_public: agent.is_public,
      });

      if (error) throw error;

      toast.success('Agent created successfully!');
      navigate('/agent-studio');
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast.error('Failed to create agent: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleTool = (toolId: string) => {
    setAgent((prev) => ({
      ...prev,
      tools_enabled: prev.tools_enabled.includes(toolId)
        ? prev.tools_enabled.filter((t) => t !== toolId)
        : [...prev.tools_enabled, toolId],
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Agent Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Research Assistant, Code Mentor..."
              value={agent.name}
              onChange={(e) => setAgent({ ...agent, name: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of what your agent does"
              value={agent.description}
              onChange={(e) => setAgent({ ...agent, description: e.target.value })}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="system_prompt">System Prompt *</Label>
            <Textarea
              id="system_prompt"
              placeholder="You are a helpful assistant that..."
              value={agent.system_prompt}
              onChange={(e) => setAgent({ ...agent, system_prompt: e.target.value })}
              className="mt-2 min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This defines your agent's personality, expertise, and behavior
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Tools & Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AVAILABLE_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                agent.tools_enabled.includes(tool.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleTool(tool.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
                <Switch
                  checked={agent.tools_enabled.includes(tool.id)}
                  onCheckedChange={() => toggleTool(tool.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Advanced Settings</h3>
        <div className="space-y-6">
          <div>
            <Label>Temperature: {agent.temperature.toFixed(1)}</Label>
            <Slider
              value={[agent.temperature]}
              onValueChange={([value]) => setAgent({ ...agent, temperature: value })}
              min={0}
              max={2}
              step={0.1}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Lower = more focused, Higher = more creative
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Make Public</Label>
              <p className="text-xs text-muted-foreground">
                Allow others to discover and use your agent
              </p>
            </div>
            <Switch
              checked={agent.is_public}
              onCheckedChange={(checked) => setAgent({ ...agent, is_public: checked })}
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Agent'}
        </Button>
        <Button variant="outline" disabled>
          <TestTube className="w-4 h-4 mr-2" />
          Test
        </Button>
      </div>
    </div>
  );
}
