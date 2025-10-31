import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { BookOpen, Search, Sparkles, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function RAGSearch() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'semantic' | 'keyword' | 'hybrid'>('hybrid');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim() || !user) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('llamaindex-rag', {
        body: {
          query,
          userId: user.id,
          searchMode,
          topK: 5,
          rerankResults: true
        }
      });

      if (error) throw error;
      setResult(data);
      toast.success('Search completed!');
    } catch (error) {
      console.error('RAG search error:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Advanced RAG Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Textarea
                placeholder="Ask a question about your knowledge base..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Select value={searchMode} onValueChange={(v: any) => setSearchMode(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="semantic">Semantic</SelectItem>
                  <SelectItem value="keyword">Keyword</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={isSearching} className="gap-2">
                <Search className="h-4 w-4" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{result.retrievedDocs} docs found</Badge>
                <span>•</span>
                <span className="italic">{result.transformedQuery}</span>
              </div>

              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {result.answer}
                  </div>
                </CardContent>
              </Card>

              {result.sources?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Sources
                  </h4>
                  <div className="space-y-2">
                    {result.sources.map((source: any, idx: number) => (
                      <Card key={source.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Badge variant="secondary" className="mt-1">{idx + 1}</Badge>
                            <div className="flex-1 space-y-1">
                              <h5 className="font-medium text-sm">{source.title}</h5>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {source.content}
                              </p>
                              {source.source_url && (
                                <a 
                                  href={source.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  View source
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
