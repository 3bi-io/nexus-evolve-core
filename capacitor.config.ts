import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.65580e8af56c4de38418f23a06a1eb6e',
  appName: 'Oneiros.me',
  webDir: 'dist',
  server: {
    url: 'https://65580e8a-f56c-4de3-8418-f23a06a1eb6e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    }
  }
};

export default config;
