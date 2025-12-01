import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NegotiationMessage {
  role: 'user' | 'assistant';
  content: string;
  score?: number;
  timestamp: Date;
}

interface NegotiationState {
  session_id: string | null;
  cumulative_score: number;
  current_price: number;
  round_number: number;
}

export function useNegotiationAgent() {
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [state, setState] = useState<NegotiationState>({
    session_id: null,
    cumulative_score: 0,
    current_price: 11.99,
    round_number: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, persona: string = 'zara') => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: NegotiationMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('negotiate-agent', {
        body: {
          session_id: state.session_id,
          message: content,
          persona
        }
      });

      if (invokeError) throw invokeError;

      // Add assistant response
      const assistantMessage: NegotiationMessage = {
        role: 'assistant',
        content: data.response,
        score: data.cumulative_score - state.cumulative_score,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update state
      setState({
        session_id: data.session_id,
        cumulative_score: data.cumulative_score,
        current_price: data.current_price,
        round_number: data.round_number
      });

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "yo something went wrong on my end, try again?",
        timestamp: new Date()
      }]);
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.session_id, state.cumulative_score]);

  const resetSession = useCallback(() => {
    setMessages([]);
    setState({
      session_id: null,
      cumulative_score: 0,
      current_price: 11.99,
      round_number: 0
    });
    setError(null);
  }, []);

  const getProgressPercentage = useCallback(() => {
    // Max practical score is around 100
    return Math.min(100, (state.cumulative_score / 100) * 100);
  }, [state.cumulative_score]);

  const getPriceReduction = useCallback(() => {
    const maxPrice = 11.99;
    const reduction = ((maxPrice - state.current_price) / maxPrice) * 100;
    return Math.round(reduction);
  }, [state.current_price]);

  return {
    messages,
    state,
    isLoading,
    error,
    sendMessage,
    resetSession,
    getProgressPercentage,
    getPriceReduction,
    // Convenience accessors
    sessionId: state.session_id,
    cumulativeScore: state.cumulative_score,
    currentPrice: state.current_price,
    roundNumber: state.round_number
  };
}