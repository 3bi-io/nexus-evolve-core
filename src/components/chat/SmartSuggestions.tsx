import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, MessageSquare, HelpCircle, Lightbulb } from 'lucide-react';

interface SmartSuggestionsProps {
  lastResponse?: string;
  onSuggestionClick: (suggestion: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  { icon: MessageSquare, text: "Tell me more about this", category: "follow-up" },
  { icon: HelpCircle, text: "Can you explain this differently?", category: "clarification" },
  { icon: Lightbulb, text: "What are the key takeaways?", category: "summary" },
];

export function SmartSuggestions({ lastResponse, onSuggestionClick }: SmartSuggestionsProps) {
  // In a real implementation, this would use AI to generate contextual suggestions
  // For now, we'll show smart defaults based on the response
  const getSuggestions = () => {
    if (!lastResponse) return DEFAULT_SUGGESTIONS;

    const suggestions = [...DEFAULT_SUGGESTIONS];

    // Add context-specific suggestions based on response content
    if (lastResponse.toLowerCase().includes('code')) {
      suggestions.unshift({
        icon: Sparkles,
        text: "Can you show me an example?",
        category: "example"
      });
    }

    if (lastResponse.toLowerCase().includes('step') || lastResponse.toLowerCase().includes('process')) {
      suggestions.push({
        icon: HelpCircle,
        text: "Break this down further",
        category: "detail"
      });
    }

    return suggestions.slice(0, 4); // Show max 4 suggestions
  };

  const suggestions = getSuggestions();

  return (
    <Card className="p-3 bg-muted/30 border-primary/20">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Continue the conversation:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSuggestionClick(suggestion.text)}
              className="gap-2 hover:bg-primary/10 hover:border-primary transition-colors"
            >
              <Icon className="h-3 w-3" />
              {suggestion.text}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
