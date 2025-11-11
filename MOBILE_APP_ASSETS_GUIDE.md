# Mobile App Assets & Configuration Guide

## Overview
This guide covers creating app icons, splash screens, and configuring native permissions for iOS and Android deployment.

---

## 1. App Icons

### Required Sizes

#### iOS Icons (place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`)
- 1024x1024 (App Store, no transparency)
- 180x180 (iPhone 3x)
- 120x120 (iPhone 2x)
- 167x167 (iPad Pro)
- 152x152 (iPad 2x)
- 76x76 (iPad)

#### Android Icons (place in respective `android/app/src/main/res/` folders)
- `mipmap-mdpi/ic_launcher.png` - 48x48
- `mipmap-hdpi/ic_launcher.png` - 72x72
- `mipmap-xhdpi/ic_launcher.png` - 96x96
- `mipmap-xxhdpi/ic_launcher.png` - 144x144
- `mipmap-xxxhdpi/ic_launcher.png` - 192x192

#### Android Adaptive Icons (place in respective `mipmap-` folders)
- `ic_launcher_foreground.png` - Same sizes as above
- `ic_launcher_background.png` - Same sizes as above

### Design Guidelines
- **Master Icon**: Create a 1024x1024 PNG with:
  - Oneiros branding/logo centered
  - Dark theme colors (#0f0a1e background with purple/cyan accents)
  - No transparency for iOS
  - Padding: 20% safe zone from edges
- **Use Icon Generator**: 
  - Upload to https://icon.kitchen or https://www.appicon.co
  - Download all sizes
  - Extract to respective folders

### Quick Command (after generating icons)
```bash
# iOS - manually copy icons to Xcode Assets.xcassets
# Android - copy to res folders
cp icons/android/* android/app/src/main/res/
```

---

## 2. Splash Screens

### Configuration
Already configured in `capacitor.config.ts`:
- Background color: `#0f0a1e` (dark purple)
- Duration: 2000ms
- Auto-hide enabled

### Required Assets

#### iOS Splash Screens
Create in `ios/App/App/Assets.xcassets/Splash.imageset/`:
- `splash-2732x2732.png` - Universal (iPad Pro 12.9")
- `splash-2732x2732-1.png` - Dark mode variant
- `splash-2732x2732-2.png` - Light mode variant (optional)

Or use Xcode to add launch screen storyboard:
1. Open `ios/App/App.xcodeproj` in Xcode
2. Select `LaunchScreen.storyboard`
3. Add image view with logo
4. Set background to #0f0a1e

#### Android Splash Screens
Create in `android/app/src/main/res/drawable/`:
- `splash.png` - 1080x1920 (or use 9-patch)
- Place logo centered on #0f0a1e background

Alternative: Use Capacitor Splash Screen plugin to auto-generate

### Design Guidelines
- **Background**: #0f0a1e (matches app theme)
- **Logo**: Oneiros logo centered, ~30% of screen width
- **Optional**: Add tagline "Advanced AI Platform" below logo
- **Colors**: Purple/cyan gradient accents matching brand

### Quick Setup (after creating splash images)
```bash
# iOS - add to Assets.xcassets via Xcode
# Android - place in drawable folder
cp splash-android.png android/app/src/main/res/drawable/splash.png
```

---

## 3. Native Permissions Configuration

### iOS Permissions (ios/App/App/Info.plist)

Add these entries inside `<dict>` tag:

```xml
<!-- Camera Access -->
<key>NSCameraUsageDescription</key>
<string>Oneiros needs camera access to upload images and use vision AI features</string>

<!-- Microphone Access -->
<key>NSMicrophoneUsageDescription</key>
<string>Oneiros needs microphone access for voice AI conversations and audio recording</string>

<!-- Photo Library Access -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Oneiros needs photo library access to upload and share images</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Oneiros needs permission to save generated images to your photo library</string>

<!-- Face ID / Touch ID -->
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID or Touch ID to securely sign in to Oneiros</string>

<!-- Location (if implementing location features) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Oneiros uses your location for geo-specific AI features</string>

<!-- Speech Recognition (if using Siri or speech-to-text) -->
<key>NSSpeechRecognitionUsageDescription</key>
<string>Oneiros uses speech recognition for voice commands</string>

<!-- Allow HTTP for development -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

### Android Permissions (android/app/src/main/AndroidManifest.xml)

Add these inside `<manifest>` tag (before `<application>`):

```xml
<!-- Camera and Audio -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />

<!-- Storage -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

<!-- Network -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Biometric -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />

<!-- Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Location (if needed) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Vibration for haptics -->
<uses-permission android:name="android.permission.VIBRATE" />
```

Also add deep link intent filter inside `<activity>` in AndroidManifest.xml:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="oneiros" />
</intent-filter>
```

---

## 4. App Store Assets Checklist

### Screenshots Needed (create after icons/splash are done)
- **iOS**: 6.7" (1290x2796), 6.5" (1242x2688), 5.5" (1242x2208)
- **Android**: 1080x1920 minimum

### Screenshot Content Ideas
1. Hero/Landing screen
2. Chat with AI conversation
3. Voice AI in action
4. Agent marketplace
5. Analytics dashboard
6. Agent builder interface

### Metadata Required
- **App Name**: "Oneiros - AI Platform"
- **Subtitle (iOS)**: "Voice AI & Agent Automation"
- **Short Description (Android)**: "Advanced AI platform with voice AI, multi-agent system, and marketplace"
- **Keywords**: AI, chatbot, voice AI, agents, automation, assistant
- **Category**: Productivity / Business
- **Age Rating**: 4+ / Everyone
- **Privacy Policy URL**: (add to your website)
- **Support URL**: (add to your website)

---

## 5. Build Commands

### Development (with live reload from web)
```bash
# Keep server config in capacitor.config.ts
npm run build
npx cap sync
npx cap run ios    # or
npx cap run android
```

### Production (for app store submission)
```bash
# 1. Comment out server config in capacitor.config.ts
# 2. Build for production
npm run build

# 3. Sync to native platforms
npx cap sync

# 4. Update native dependencies
npx cap update ios
npx cap update android

# 5. Open in native IDE
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio

# 6. Build/Archive in respective IDE
# iOS: Product > Archive in Xcode
# Android: Build > Generate Signed Bundle/APK in Android Studio
```

---

## 6. Testing Checklist

### Before Building
- [ ] Icons created and placed in correct folders
- [ ] Splash screens created and configured
- [ ] Permissions added to Info.plist and AndroidManifest.xml
- [ ] Deep linking scheme configured
- [ ] Server URL commented out in capacitor.config.ts
- [ ] App name updated in capacitor.config.ts
- [ ] Version numbers updated (package.json, Info.plist, build.gradle)

### After Building
- [ ] App launches without crashes
- [ ] Splash screen displays correctly
- [ ] App icon appears on home screen
- [ ] Camera permission prompt works
- [ ] Microphone permission prompt works
- [ ] Voice AI features work
- [ ] Deep links work (test `oneiros://chat`)
- [ ] No console errors in native logs

---

## 7. Quick Start Script

Run this after you have all assets ready:

```bash
#!/bin/bash

echo "🚀 Setting up Oneiros mobile app..."

# 1. Install dependencies
npm install

# 2. Add platforms if not already added
npx cap add ios
npx cap add android

# 3. Build web assets
npm run build

# 4. Sync to native platforms
npx cap sync

echo "✅ Setup complete!"
echo "📱 Next steps:"
echo "1. Add app icons to ios/App/App/Assets.xcassets/"
echo "2. Add splash screens to respective folders"
echo "3. Update permissions in Info.plist and AndroidManifest.xml"
echo "4. Open in IDE: npx cap open ios (or android)"
echo "5. Test on device/simulator"
```

---

## Resources

- **Icon Generator**: https://icon.kitchen
- **Splash Screen Generator**: https://apetools.webprofusion.com/app/#/tools/imagegorilla
- **Capacitor Docs**: https://capacitorjs.com/docs
- **iOS Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **Android Guidelines**: https://developer.android.com/design

---

## Support

For issues, refer to:
- NATIVE_APP_DEPLOYMENT.md (detailed deployment guide)
- Capacitor documentation
- Project README.md
