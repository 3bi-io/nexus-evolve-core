import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.65580e8af56c4de38418f23a06a1eb6e',
  appName: 'Oneiros - AI Platform',
  webDir: 'dist',
  // PRODUCTION: Comment out server config when building for app stores
  // server: {
  //   url: 'https://65580e8a-f56c-4de3-8418-f23a06a1eb6e.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f0a1e',
      overlaysWebView: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f0a1e',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    App: {
      deepLinkSchemes: ['oneiros']
    }
  }
};

export default config;
