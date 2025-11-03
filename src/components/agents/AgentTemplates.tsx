import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tools_enabled: string[];
  is_featured: boolean;
  usage_count: number;
}

export function AgentTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_templates')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: fullTemplate } = await supabase
        .from('agent_templates')
        .select('system_prompt')
        .eq('id', template.id)
        .single();

      const { data, error } = await supabase.from('custom_agents').insert({
        user_id: user.id,
        name: `${template.name} (Copy)`,
        description: template.description,
        system_prompt: fullTemplate?.system_prompt || '',
        tools_enabled: template.tools_enabled,
        is_template: false,
      }).select().single();

      if (error) throw error;
      toast.success('Agent created from template!');
      navigate('/agent-studio?tab=my-agents');
    } catch (error: any) {
      console.error('Error using template:', error);
      toast.error('Failed to create agent: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted/50 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl">{template.icon}</div>
            {template.is_featured && (
              <Badge className="gap-1">
                <Star className="w-3 h-3" />
                Featured
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="capitalize">
              {template.category}
            </Badge>
            {template.tools_enabled.slice(0, 2).map((tool) => (
              <Badge key={tool} variant="secondary" className="text-xs">
                {tool}
              </Badge>
            ))}
            {template.tools_enabled.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tools_enabled.length - 2}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {template.usage_count} uses
            </span>
            <Button size="sm" onClick={() => handleUseTemplate(template)}>
              <Plus className="w-4 h-4 mr-2" />
              Use Template
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
