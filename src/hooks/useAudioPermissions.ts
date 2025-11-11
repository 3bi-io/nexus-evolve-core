import { useState, useEffect } from 'react';

interface AudioPermissionState {
  mic: 'pending' | 'granted' | 'denied';
  speaker: 'pending' | 'granted' | 'denied';
  lastChecked: string;
}

const STORAGE_KEY = 'oneiros_audio_permissions';

/**
 * Custom hook to manage persistent audio permissions state
 * Stores microphone and speaker permission states in localStorage
 */
export const useAudioPermissions = () => {
  const [permissionState, setPermissionState] = useState<AudioPermissionState>(() => {
    // Load from localStorage on initialization
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored permissions:', e);
      }
    }
    return {
      mic: 'pending',
      speaker: 'pending',
      lastChecked: new Date().toISOString(),
    };
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(permissionState));
  }, [permissionState]);

  const updateMicPermission = (status: 'granted' | 'denied') => {
    setPermissionState(prev => ({
      ...prev,
      mic: status,
      lastChecked: new Date().toISOString(),
    }));
  };

  const updateSpeakerPermission = (status: 'granted' | 'denied') => {
    setPermissionState(prev => ({
      ...prev,
      speaker: status,
      lastChecked: new Date().toISOString(),
    }));
  };

  const requestMicPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      updateMicPermission('granted');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      updateMicPermission('denied');
      return false;
    }
  };

  const checkSpeakerPermission = () => {
    // Speakers don't require explicit permission, but we track if they work
    if ('speechSynthesis' in window || 'Audio' in window) {
      updateSpeakerPermission('granted');
      return true;
    }
    updateSpeakerPermission('denied');
    return false;
  };

  const resetPermissions = () => {
    setPermissionState({
      mic: 'pending',
      speaker: 'pending',
      lastChecked: new Date().toISOString(),
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    micPermission: permissionState.mic,
    speakerPermission: permissionState.speaker,
    lastChecked: permissionState.lastChecked,
    updateMicPermission,
    updateSpeakerPermission,
    requestMicPermission,
    checkSpeakerPermission,
    resetPermissions,
  };
};
