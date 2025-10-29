import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Frown, Meh, TrendingUp, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SentimentData {
  overall: 'positive' | 'negative' | 'neutral';
  positive_percentage?: number;
  negative_percentage?: number;
  neutral_percentage?: number;
  key_themes?: string[];
  trend?: 'rising' | 'falling' | 'stable';
  text?: string;
}

export function SocialSentimentDashboard() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [cached, setCached] = useState(false);

  const analyzeSentiment = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('grok-reality-agent', {
        body: {
          action: 'sentiment',
          topic: topic.trim()
        }
      });

      if (error) throw error;

      setSentiment(data.sentiment);
      setCached(data.cached || false);
      
      if (!data.cached) {
        toast.success('Analyzed sentiment from live X data');
      }
    } catch (error: any) {
      console.error('Error analyzing sentiment:', error);
      toast.error('Failed to analyze sentiment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (type: string) => {
    switch (type) {
      case 'positive': return <Heart className="w-5 h-5 text-green-500" />;
      case 'negative': return <Frown className="w-5 h-5 text-red-500" />;
      default: return <Meh className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getSentimentColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Social Sentiment Analysis</h2>
        {cached && (
          <Badge variant="outline" className="ml-2">
            Cached
          </Badge>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Enter topic to analyze sentiment..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && analyzeSentiment()}
        />
        <Button onClick={analyzeSentiment} disabled={loading || !topic.trim()}>
          <Search className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
        </Button>
      </div>

      {sentiment && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              {getSentimentIcon(sentiment.overall)}
              <div>
                <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                <p className={`text-xl font-semibold capitalize ${getSentimentColor(sentiment.overall)}`}>
                  {sentiment.overall}
                </p>
              </div>
            </div>
            {sentiment.trend && (
              <Badge variant="outline">
                Trend: {sentiment.trend}
              </Badge>
            )}
          </div>

          {(sentiment.positive_percentage !== undefined) && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-500">Positive</span>
                  <span className="text-green-500 font-medium">
                    {sentiment.positive_percentage}%
                  </span>
                </div>
                <Progress value={sentiment.positive_percentage} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-yellow-500">Neutral</span>
                  <span className="text-yellow-500 font-medium">
                    {sentiment.neutral_percentage || 0}%
                  </span>
                </div>
                <Progress value={sentiment.neutral_percentage || 0} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-red-500">Negative</span>
                  <span className="text-red-500 font-medium">
                    {sentiment.negative_percentage || 0}%
                  </span>
                </div>
                <Progress value={sentiment.negative_percentage || 0} className="h-2" />
              </div>
            </div>
          )}

          {sentiment.key_themes && sentiment.key_themes.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3">Key Themes</p>
              <div className="flex flex-wrap gap-2">
                {sentiment.key_themes.map((theme, index) => (
                  <Badge key={index} variant="outline">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {sentiment.text && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {sentiment.text}
              </p>
            </div>
          )}
        </div>
      )}

      {!sentiment && !loading && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-sm">
            Enter a topic to analyze social sentiment
          </p>
        </div>
      )}
    </Card>
  );
}
