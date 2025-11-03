import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KnowledgeItem {
  id: string;
  content: string;
  metadata: {
    title?: string;
    chunk?: number;
    total_chunks?: number;
  };
  created_at: string;
}

interface KnowledgeBaseManagerProps {
  agentId: string;
}

export const KnowledgeBaseManager = ({ agentId }: KnowledgeBaseManagerProps) => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentText, setDocumentText] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const { toast } = useToast();

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_knowledge_links')
        .select('knowledge_id, knowledge_base(*)')
        .eq('agent_id', agentId);

      if (error) throw error;

      const items = data
        ?.map(item => item.knowledge_base)
        .filter(Boolean) as KnowledgeItem[];
      
      setKnowledge(items);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge base",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [agentId]);

  const handleUpload = async () => {
    if (!documentText.trim() || !documentTitle.trim()) {
      toast({
        title: "Error",
        description: "Please provide both title and content",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { data, error } = await supabase.functions.invoke('upload-agent-document', {
        body: {
          agentId,
          document: documentText,
          title: documentTitle
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message
      });

      setDocumentText("");
      setDocumentTitle("");
      fetchKnowledge();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (knowledgeId: string) => {
    try {
      const { error } = await supabase
        .from('agent_knowledge_links')
        .delete()
        .eq('agent_id', agentId)
        .eq('knowledge_id', knowledgeId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Knowledge item removed successfully"
      });

      fetchKnowledge();
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast({
        title: "Error",
        description: "Failed to delete knowledge item",
        variant: "destructive"
      });
    }
  };

  const groupedKnowledge = knowledge.reduce((acc, item) => {
    const title = item.metadata.title || 'Untitled';
    if (!acc[title]) {
      acc[title] = [];
    }
    acc[title].push(item);
    return acc;
  }, {} as Record<string, KnowledgeItem[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Document Title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
          />
          <Textarea
            placeholder="Paste your document content here (will be automatically chunked and processed)..."
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            rows={8}
          />
          <Button
            onClick={handleUpload}
            disabled={uploading || !documentText.trim() || !documentTitle.trim()}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload & Process Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Knowledge Base ({Object.keys(groupedKnowledge).length} documents)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              Loading knowledge base...
            </div>
          ) : Object.keys(groupedKnowledge).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet. Upload your first document to get started!
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {Object.entries(groupedKnowledge).map(([title, items]) => (
                  <div key={title} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {items.length} chunk{items.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(items[0].id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {items[0].content.substring(0, 200)}...
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
