import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe, X } from "lucide-react";
import { WebSearchResponse } from "@/hooks/useWebSearch";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface WebSearchResultsProps {
  results: WebSearchResponse;
  onClose?: () => void;
}

export function WebSearchResults({ results, onClose }: WebSearchResultsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!results) return null;

  return (
    <Card className={cn(
      "mb-4 border-primary/20 bg-primary/5",
      !isExpanded && "cursor-pointer"
    )} onClick={() => !isExpanded && setIsExpanded(true)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Web Search Results</CardTitle>
            <Badge variant="outline" className="text-xs">
              {results.results.length} sources
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <span className="text-xs">−</span>
              ) : (
                <span className="text-xs">+</span>
              )}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {isExpanded && results.answer && (
          <CardDescription className="text-sm mt-2 leading-relaxed">
            {results.answer}
          </CardDescription>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-3">
          {results.results.map((result, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded-lg bg-card border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-medium text-sm line-clamp-1">{result.title}</h4>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {(result.score * 100).toFixed(0)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {result.content}
              </p>
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 group"
              >
                <span className="truncate">{result.url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
