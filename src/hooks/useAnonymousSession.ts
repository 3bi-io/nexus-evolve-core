import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnonymousSessionData {
  messages: any[];
  preferences: Record<string, any>;
  interactions: number;
}

const STORAGE_KEY = 'oneiros_anonymous_session';
const CONVERSION_PROMPT_THRESHOLD = 3;

export function useAnonymousSession() {
  const [sessionData, setSessionData] = useState<AnonymousSessionData>({
    messages: [],
    preferences: {},
    interactions: 0,
  });
  const [showConversionPrompt, setShowConversionPrompt] = useState(false);

  useEffect(() => {
    // Load session data from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSessionData(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse anonymous session data:', error);
      }
    }
  }, []);

  const updateSession = (updates: Partial<AnonymousSessionData>) => {
    const newData = { ...sessionData, ...updates };
    setSessionData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

    // Check if we should show conversion prompt
    if (newData.interactions >= CONVERSION_PROMPT_THRESHOLD && !showConversionPrompt) {
      setShowConversionPrompt(true);
    }
  };

  const addMessage = (message: any) => {
    const newMessages = [...sessionData.messages, message];
    updateSession({
      messages: newMessages,
      interactions: sessionData.interactions + 1,
    });
  };

  const setPreference = (key: string, value: any) => {
    updateSession({
      preferences: { ...sessionData.preferences, [key]: value },
    });
  };

  const migrateToUser = async (userId: string) => {
    try {
      // Store anonymous session data for the user
      await supabase.from('user_preferences').upsert({
        user_id: userId,
        preferences: {
          ...sessionData.preferences,
          migrated_from_anonymous: true,
          anonymous_interactions: sessionData.interactions,
        },
      });

      // Clear anonymous session
      localStorage.removeItem(STORAGE_KEY);
      setSessionData({ messages: [], preferences: {}, interactions: 0 });
      setShowConversionPrompt(false);

      return true;
    } catch (error) {
      console.error('Failed to migrate anonymous session:', error);
      return false;
    }
  };

  const dismissConversionPrompt = () => {
    setShowConversionPrompt(false);
    // Set a flag to not show again for 24 hours
    const dismissedUntil = Date.now() + 24 * 60 * 60 * 1000;
    setPreference('conversion_prompt_dismissed_until', dismissedUntil);
  };

  const shouldShowConversionPrompt = () => {
    const dismissedUntil = sessionData.preferences.conversion_prompt_dismissed_until;
    if (dismissedUntil && Date.now() < dismissedUntil) {
      return false;
    }
    return showConversionPrompt;
  };

  return {
    sessionData,
    addMessage,
    setPreference,
    migrateToUser,
    showConversionPrompt: shouldShowConversionPrompt(),
    dismissConversionPrompt,
  };
}