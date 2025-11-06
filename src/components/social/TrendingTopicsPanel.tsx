import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Trend {
  topic: string;
  volume?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  description?: string;
}

export function TrendingTopicsPanel() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('grok-reality-agent', {
        body: {
          action: 'trends',
          model: 'grok-3',
          searchMode: 'on',
          returnCitations: true,
          sources: [
            { type: 'x', xHandles: ['applyai', 'grok', 'xai'] },
            { type: 'web' }
          ]
        }
      });

      if (error) throw error;

      setTrends(data.trends || []);
      setCached(data.cached || false);
      
      if (!data.cached) {
        toast.success('Fetched live trends from X');
      }
    } catch (error: any) {
      console.error('Error fetching trends:', error);
      toast.error('Failed to fetch trends: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'negative': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Live Trending Topics</h2>
          {cached && (
            <Badge variant="outline" className="ml-2">
              Cached
            </Badge>
          )}
        </div>
        <Button
          onClick={fetchTrends}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && trends.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {trends.map((trend, index) => (
            <div
              key={index}
              className="p-4 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {trend.topic}
                    </h3>
                  </div>
                  {trend.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {trend.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  {trend.sentiment && (
                    <Badge className={getSentimentColor(trend.sentiment)}>
                      {trend.sentiment}
                    </Badge>
                  )}
                  {trend.volume && (
                    <span className="text-xs text-muted-foreground">
                      {trend.volume}+ posts
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {trends.length === 0 && !loading && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No trends available</p>
              <Button onClick={fetchTrends} variant="outline" className="mt-4">
                Fetch Trends
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
