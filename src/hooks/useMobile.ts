import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');
  const [isOled, setIsOled] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsNative(Capacitor.isNativePlatform());
      setPlatform(Capacitor.getPlatform() as 'ios' | 'android' | 'web');
      
      // Check for OLED display capability (primarily for mobile)
      const hasOledSupport = mobile && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const oledEnabled = localStorage.getItem('oled-mode') === 'true';
      setIsOled(hasOledSupport && oledEnabled);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Configure status bar for native apps
  useEffect(() => {
    if (isNative) {
      StatusBar.setStyle({ style: Style.Dark });
      if (platform === 'android') {
        StatusBar.setBackgroundColor({ color: '#000000' });
      }
    }
  }, [isNative, platform]);

  return { isMobile, isNative, platform, isOled };
}

export function useKeyboard() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { isNative } = useMobile();

  useEffect(() => {
    if (!isNative) return;

    let showListener: any;
    let hideListener: any;

    const setupListeners = async () => {
      showListener = await Keyboard.addListener('keyboardWillShow', () => {
        setIsKeyboardVisible(true);
      });

      hideListener = await Keyboard.addListener('keyboardWillHide', () => {
        setIsKeyboardVisible(false);
      });
    };

    setupListeners();

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, [isNative]);

  return { isKeyboardVisible };
}

export function useHaptics() {
  const { isNative } = useMobile();

  const light = async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const medium = async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  };

  const heavy = async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  };

  const selection = async () => {
    if (isNative) {
      await Haptics.selectionStart();
    }
  };

  const notification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (isNative) {
      await Haptics.notification({ type: type.toUpperCase() as any });
    }
  };

  return { light, medium, heavy, selection, notification };
}
