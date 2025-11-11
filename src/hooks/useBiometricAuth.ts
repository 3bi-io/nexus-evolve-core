import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth';
import { Preferences } from '@capacitor/preferences';
import { toast } from 'sonner';

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkAvailability();
    checkEnabled();
  }, []);

  const checkAvailability = async () => {
    if (!Capacitor.isNativePlatform()) {
      setIsAvailable(false);
      return;
    }

    try {
      const result = await BiometricAuth.checkBiometry();
      setIsAvailable(result.isAvailable);
      setBiometryType(result.biometryType);
    } catch (error) {
      console.error('Biometric check failed:', error);
      setIsAvailable(false);
    }
  };

  const checkEnabled = async () => {
    try {
      const { value } = await Preferences.get({ key: 'biometric-auth-enabled' });
      setIsEnabled(value === 'true');
    } catch (error) {
      console.error('Error checking biometric status:', error);
    }
  };

  const enroll = async (): Promise<boolean> => {
    if (!isAvailable) {
      toast.error('Biometric authentication is not available on this device');
      return false;
    }

    try {
      await BiometricAuth.authenticate({
        reason: 'Enable biometric authentication for quick sign-in',
        cancelTitle: 'Cancel',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Use Passcode'
      });

      await Preferences.set({ 
        key: 'biometric-auth-enabled', 
        value: 'true' 
      });
      setIsEnabled(true);
      return true;
    } catch (error: any) {
      console.error('Biometric enrollment error:', error);
      
      if (error.code === 10) {
        // User cancelled
        toast.error('Biometric setup cancelled');
      } else {
        toast.error('Failed to enable biometric authentication');
      }
      
      return false;
    }
  };

  const authenticate = async (reason?: string): Promise<boolean> => {
    if (!isEnabled || !isAvailable) {
      return false;
    }

    try {
      await BiometricAuth.authenticate({
        reason: reason || 'Authenticate to access Oneiros',
        cancelTitle: 'Cancel',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Use Passcode'
      });

      return true;
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      
      if (error.code === 10) {
        // User cancelled, not an error
        return false;
      }
      
      toast.error('Authentication failed');
      return false;
    }
  };

  const disable = async () => {
    try {
      await Preferences.remove({ key: 'biometric-auth-enabled' });
      setIsEnabled(false);
      toast.success('Biometric authentication disabled');
    } catch (error) {
      console.error('Error disabling biometric auth:', error);
      toast.error('Failed to disable biometric authentication');
    }
  };

  const getBiometryName = (): string => {
    switch (biometryType) {
      case BiometryType.faceId:
        return 'Face ID';
      case BiometryType.touchId:
        return 'Touch ID';
      case BiometryType.fingerprintAuthentication:
        return 'Fingerprint';
      case BiometryType.faceAuthentication:
        return 'Face Recognition';
      case BiometryType.irisAuthentication:
        return 'Iris Scan';
      default:
        return 'Biometric';
    }
  };

  return {
    isAvailable,
    isEnabled,
    biometryType,
    biometryName: getBiometryName(),
    enroll,
    authenticate,
    disable
  };
}
