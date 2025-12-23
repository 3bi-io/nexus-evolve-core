import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Mic, 
  Settings, 
  Brain, 
  Volume2, 
  Search, 
  Database, 
  BarChart3, 
  Play,
  Save,
  RefreshCw,
  Loader2,
  Sparkles,
  MessageSquare
} from "lucide-react";

interface ErosConfig {
  system_prompt: string;
  model_settings: {
    model: string;
    temperature: number;
    max_tokens: number;
  };
  wake_word: string;
  features: {
    web_search_enabled: boolean;
    memory_enabled: boolean;
    analytics_enabled: boolean;
  };
  voice_settings: {
    rate: number;
    pitch: number;
    volume: number;
  };
  knowledge_base: Array<{ topic: string; content: string }>;
}

const DEFAULT_CONFIG: ErosConfig = {
  system_prompt: "You are Eros, a sophisticated AI assistant. Respond concisely and naturally.",
  model_settings: { model: "grok-3", temperature: 0.7, max_tokens: 500 },
  wake_word: "Zephel",
  features: { web_search_enabled: true, memory_enabled: true, analytics_enabled: true },
  voice_settings: { rate: 0.85, pitch: 0.9, volume: 1.0 },
  knowledge_base: []
};

export function ErosManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ErosConfig>(DEFAULT_CONFIG);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testing, setTesting] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState({ topic: "", content: "" });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("eros_config")
        .select("config_key, config_value");

      if (error) throw error;

      if (data) {
        const configMap: Record<string, any> = {};
        data.forEach((row: any) => {
          configMap[row.config_key] = row.config_value;
        });

        setConfig({
          system_prompt: configMap.system_prompt || DEFAULT_CONFIG.system_prompt,
          model_settings: configMap.model_settings || DEFAULT_CONFIG.model_settings,
          wake_word: configMap.wake_word || DEFAULT_CONFIG.wake_word,
          features: configMap.features || DEFAULT_CONFIG.features,
          voice_settings: configMap.voice_settings || DEFAULT_CONFIG.voice_settings,
          knowledge_base: configMap.knowledge_base || DEFAULT_CONFIG.knowledge_base,
        });
      }
    } catch (error) {
      console.error("Failed to load Eros config:", error);
      toast({
        title: "Error",
        description: "Failed to load Eros configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (key: string, value: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("eros_config")
        .update({ 
          config_value: value, 
          updated_by: user?.id 
        })
        .eq("config_key", key);

      if (error) throw error;

      toast({
        title: "Saved",
        description: `${key.replace("_", " ")} updated successfully`,
      });
    } catch (error) {
      console.error("Failed to save config:", error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testEros = async () => {
    if (!testMessage.trim()) return;
    
    setTesting(true);
    setTestResponse("");
    
    try {
      const { data, error } = await supabase.functions.invoke("xai-chat", {
        body: {
          messages: [
            { role: "system", content: config.system_prompt },
            { role: "user", content: testMessage }
          ],
          model: config.model_settings.model,
          temperature: config.model_settings.temperature,
          max_tokens: config.model_settings.max_tokens,
          search: config.features.web_search_enabled
        }
      });

      if (error) throw error;
      
      setTestResponse(data.choices[0].message.content);
    } catch (error) {
      console.error("Test failed:", error);
      setTestResponse("Error: Failed to get response from Eros");
    } finally {
      setTesting(false);
    }
  };

  const addKnowledge = () => {
    if (!newKnowledge.topic || !newKnowledge.content) return;
    
    const updated = [...config.knowledge_base, newKnowledge];
    setConfig({ ...config, knowledge_base: updated });
    saveConfig("knowledge_base", updated);
    setNewKnowledge({ topic: "", content: "" });
  };

  const removeKnowledge = (index: number) => {
    const updated = config.knowledge_base.filter((_, i) => i !== index);
    setConfig({ ...config, knowledge_base: updated });
    saveConfig("knowledge_base", updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Eros Voice Agent
          </h2>
          <p className="text-muted-foreground">Configure Eros personality, model settings, and features</p>
        </div>
        <Button onClick={loadConfig} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="personality" className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-1">
          <TabsTrigger value="personality" className="gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Personality</span>
          </TabsTrigger>
          <TabsTrigger value="model" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Model</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Volume2 className="h-4 w-4" />
            <span className="hidden sm:inline">Voice</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Knowledge</span>
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-2">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Test</span>
          </TabsTrigger>
        </TabsList>

        {/* Personality Tab */}
        <TabsContent value="personality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Personality & System Prompt
              </CardTitle>
              <CardDescription>
                Define Eros's personality, knowledge, and response behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Wake Word</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.wake_word}
                    onChange={(e) => setConfig({ ...config, wake_word: e.target.value })}
                    placeholder="Wake word phrase"
                  />
                  <Button 
                    onClick={() => saveConfig("wake_word", config.wake_word)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Users say this to activate Eros voice mode
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  value={config.system_prompt}
                  onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                  placeholder="Enter Eros's system prompt..."
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {config.system_prompt.length} characters
                  </p>
                  <Button 
                    onClick={() => saveConfig("system_prompt", config.system_prompt)}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Prompt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Settings Tab */}
        <TabsContent value="model">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Model Configuration
              </CardTitle>
              <CardDescription>
                Configure the AI model parameters for Eros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  value={config.model_settings.model}
                  onChange={(e) => setConfig({
                    ...config,
                    model_settings: { ...config.model_settings, model: e.target.value }
                  })}
                  placeholder="Model name"
                />
                <p className="text-xs text-muted-foreground">
                  xAI model to use (e.g., grok-beta, grok-2)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Temperature</Label>
                  <Badge variant="outline">{config.model_settings.temperature}</Badge>
                </div>
                <Slider
                  value={[config.model_settings.temperature]}
                  onValueChange={([value]) => setConfig({
                    ...config,
                    model_settings: { ...config.model_settings, temperature: value }
                  })}
                  min={0}
                  max={2}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">
                  Lower = more focused, Higher = more creative
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Max Tokens</Label>
                  <Badge variant="outline">{config.model_settings.max_tokens}</Badge>
                </div>
                <Slider
                  value={[config.model_settings.max_tokens]}
                  onValueChange={([value]) => setConfig({
                    ...config,
                    model_settings: { ...config.model_settings, max_tokens: value }
                  })}
                  min={100}
                  max={4000}
                  step={100}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum response length (keep lower for voice)
                </p>
              </div>

              <Button 
                onClick={() => saveConfig("model_settings", config.model_settings)}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Model Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
              <CardDescription>
                Enable or disable Eros capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <Label className="text-base">Web Search</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow Eros to search the web for current information
                  </p>
                </div>
                <Switch
                  checked={config.features.web_search_enabled}
                  onCheckedChange={(checked) => {
                    const updated = { ...config.features, web_search_enabled: checked };
                    setConfig({ ...config, features: updated });
                    saveConfig("features", updated);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <Label className="text-base">Conversation Memory</Label>
                  <p className="text-sm text-muted-foreground">
                    Remember context across voice sessions
                  </p>
                </div>
                <Switch
                  checked={config.features.memory_enabled}
                  onCheckedChange={(checked) => {
                    const updated = { ...config.features, memory_enabled: checked };
                    setConfig({ ...config, features: updated });
                    saveConfig("features", updated);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <Label className="text-base">Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track Eros usage for performance insights
                  </p>
                </div>
                <Switch
                  checked={config.features.analytics_enabled}
                  onCheckedChange={(checked) => {
                    const updated = { ...config.features, analytics_enabled: checked };
                    setConfig({ ...config, features: updated });
                    saveConfig("features", updated);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Settings Tab */}
        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Voice Settings
              </CardTitle>
              <CardDescription>
                Configure text-to-speech output parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Speech Rate</Label>
                  <Badge variant="outline">{config.voice_settings.rate}</Badge>
                </div>
                <Slider
                  value={[config.voice_settings.rate]}
                  onValueChange={([value]) => setConfig({
                    ...config,
                    voice_settings: { ...config.voice_settings, rate: value }
                  })}
                  min={0.5}
                  max={2}
                  step={0.05}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Pitch</Label>
                  <Badge variant="outline">{config.voice_settings.pitch}</Badge>
                </div>
                <Slider
                  value={[config.voice_settings.pitch]}
                  onValueChange={([value]) => setConfig({
                    ...config,
                    voice_settings: { ...config.voice_settings, pitch: value }
                  })}
                  min={0.5}
                  max={2}
                  step={0.05}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Volume</Label>
                  <Badge variant="outline">{config.voice_settings.volume}</Badge>
                </div>
                <Slider
                  value={[config.voice_settings.volume]}
                  onValueChange={([value]) => setConfig({
                    ...config,
                    voice_settings: { ...config.voice_settings, volume: value }
                  })}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>

              <Button 
                onClick={() => saveConfig("voice_settings", config.voice_settings)}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Voice Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Knowledge Base
              </CardTitle>
              <CardDescription>
                Add custom knowledge for Eros to reference
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 p-4 rounded-lg border">
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input
                    value={newKnowledge.topic}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, topic: e.target.value })}
                    placeholder="e.g., Pricing, Features, Support"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={newKnowledge.content}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, content: e.target.value })}
                    placeholder="Knowledge content..."
                    className="min-h-[100px]"
                  />
                </div>
                <Button onClick={addKnowledge} disabled={!newKnowledge.topic || !newKnowledge.content}>
                  Add Knowledge Entry
                </Button>
              </div>

              <Separator />

              <ScrollArea className="h-[300px]">
                {config.knowledge_base.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No knowledge entries yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {config.knowledge_base.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg border flex justify-between items-start">
                        <div>
                          <Badge variant="secondary">{item.topic}</Badge>
                          <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeKnowledge(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Console Tab */}
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Test Console
              </CardTitle>
              <CardDescription>
                Test Eros responses with current configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Test Message</Label>
                <Textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a test message..."
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                onClick={testEros}
                disabled={testing || !testMessage.trim()}
                className="w-full"
              >
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Eros Response
                  </>
                )}
              </Button>

              {testResponse && (
                <div className="p-4 rounded-lg bg-muted space-y-2">
                  <Label className="text-sm text-muted-foreground">Eros Response:</Label>
                  <p className="text-sm whitespace-pre-wrap">{testResponse}</p>
                </div>
              )}

              <Separator />

              <div className="p-4 rounded-lg border space-y-2">
                <Label className="text-sm font-medium">Current Configuration Preview</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Model: <Badge variant="outline">{config.model_settings.model}</Badge></div>
                  <div>Temperature: <Badge variant="outline">{config.model_settings.temperature}</Badge></div>
                  <div>Max Tokens: <Badge variant="outline">{config.model_settings.max_tokens}</Badge></div>
                  <div>Web Search: <Badge variant={config.features.web_search_enabled ? "default" : "secondary"}>
                    {config.features.web_search_enabled ? "Enabled" : "Disabled"}
                  </Badge></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}