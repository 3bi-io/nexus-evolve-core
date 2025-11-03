import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface WebSearchResponse {
  answer: string;
  results: WebSearchResult[];
  query: string;
  follow_up_questions: string[];
}

export function useWebSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<WebSearchResponse | null>(null);

  const searchWeb = async (
    query: string, 
    depth: "basic" | "advanced" = "basic"
  ): Promise<WebSearchResponse | null> => {
    setIsSearching(true);
    setSearchResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("tavily-search", {
        body: { 
          query, 
          searchDepth: depth, 
          maxResults: 5 
        }
      });

      if (error) throw error;

      setSearchResults(data);
      return data;
    } catch (error) {
      console.error("Web search error:", error);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setSearchResults(null);
  };

  return {
    searchWeb,
    isSearching,
    searchResults,
    clearResults,
  };
}
