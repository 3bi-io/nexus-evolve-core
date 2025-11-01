# 📱 Native App Deployment Guide

Complete guide for deploying Oneiros.me to Apple App Store and Google Play Store.

## Prerequisites

### For iOS Deployment
- **Mac computer** with macOS 11 or later
- **Xcode 14+** installed from Mac App Store
- **Apple Developer Account** ($99/year)
- **CocoaPods** installed: `sudo gem install cocoapods`

### For Android Deployment
- **Android Studio** installed
- **Java Development Kit (JDK) 11+** installed
- **Google Play Developer Account** ($25 one-time fee)

## Initial Setup (Already Completed)

The project is already configured with:
- ✅ Capacitor installed and configured
- ✅ Mobile UI components
- ✅ PWA manifest
- ✅ Service worker for offline support
- ✅ Mobile analytics

## Step 1: Export & Clone Project

1. In Lovable, click **GitHub** → **Create Repository**
2. Clone your repository locally:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

3. Install dependencies:
```bash
npm install
```

## Step 2: Add Native Platforms

### Add iOS Platform
```bash
npx cap add ios
npx cap update ios
```

### Add Android Platform
```bash
npx cap add android
npx cap update android
```

## Step 3: Build Web Assets

```bash
npm run build
npx cap sync
```

This builds your React app and copies it to native projects.

## Step 4: iOS Deployment

### 4.1 Open iOS Project
```bash
npx cap open ios
```

### 4.2 Configure App in Xcode

1. **Select Project** → Select "App" target
2. **General Tab:**
   - Display Name: `Oneiros.me`
   - Bundle Identifier: `app.lovable.65580e8af56c4de38418f23a06a1eb6e`
   - Version: `1.0.0`
   - Build: `1`
   - Deployment Target: iOS 13.0 or later

3. **Signing & Capabilities:**
   - Team: Select your Apple Developer team
   - Signing Certificate: Automatic
   - Add Capability: Push Notifications (if needed)
   - Add Capability: Background Modes → Background fetch, Remote notifications

4. **Info.plist Configurations:**
   Add these keys (Xcode: Info tab):
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>We need camera access for image uploads</string>
   
   <key>NSMicrophoneUsageDescription</key>
   <string>We need microphone access for voice features</string>
   
   <key>NSPhotoLibraryUsageDescription</key>
   <string>We need photo library access to upload images</string>
   ```

### 4.3 Create App Store Connect Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in details:
   - Platform: iOS
   - Name: Oneiros.me
   - Primary Language: English
   - Bundle ID: Select your bundle ID
   - SKU: `oneiros-me-001`
   - User Access: Full Access

### 4.4 Prepare App Store Assets

**Screenshots Required:**
- 6.7" Display (iPhone 14 Pro Max): 1290 x 2796 px
- 6.5" Display (iPhone 11 Pro Max): 1242 x 2688 px
- 5.5" Display (iPhone 8 Plus): 1242 x 2208 px

**App Icon:**
- 1024 x 1024 px PNG (no alpha channel)
- Already configured in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

**Metadata:**
- App Name: Oneiros.me
- Subtitle: The Most Advanced AI Platform
- Description: (Use marketing copy from landing page)
- Keywords: AI, artificial intelligence, chatbot, voice AI, agents
- Support URL: Your website
- Privacy Policy URL: Your privacy policy page

### 4.5 Build and Upload

1. In Xcode, select **Product** → **Archive**
2. Once archived, click **Distribute App**
3. Select **App Store Connect**
4. Select **Upload**
5. Follow prompts to sign and upload

### 4.6 Submit for Review

1. In App Store Connect, fill in all required fields
2. Add screenshots and preview videos
3. Set pricing (Free)
4. Click **Submit for Review**

**Review Timeline:** 24-48 hours typically

---

## Step 5: Android Deployment

### 5.1 Open Android Project
```bash
npx cap open android
```

### 5.2 Configure App in Android Studio

1. **Open `android/app/build.gradle`:**
```gradle
android {
    defaultConfig {
        applicationId "app.lovable.65580e8af56c4de38418f23a06a1eb6e"
        minSdkVersion 22
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
}
```

2. **Update `android/app/src/main/res/values/strings.xml`:**
```xml
<resources>
    <string name="app_name">Oneiros.me</string>
    <string name="title_activity_main">Oneiros.me</string>
    <string name="package_name">app.lovable.65580e8af56c4de38418f23a06a1eb6e</string>
    <string name="custom_url_scheme">app.lovable.65580e8af56c4de38418f23a06a1eb6e</string>
</resources>
```

3. **Update App Icon:**
   - Replace icons in `android/app/src/main/res/mipmap-*/`
   - Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

### 5.3 Generate Signing Key

```bash
keytool -genkey -v -keystore oneiros-release-key.keystore -alias oneiros-key -keyalg RSA -keysize 2048 -validity 10000
```

Save the keystore file securely and remember the passwords!

### 5.4 Configure Signing

Create `android/key.properties`:
```properties
storePassword=<your-keystore-password>
keyPassword=<your-key-password>
keyAlias=oneiros-key
storeFile=../oneiros-release-key.keystore
```

Update `android/app/build.gradle`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 5.5 Build Release APK/AAB

```bash
cd android
./gradlew assembleRelease  # For APK
./gradlew bundleRelease    # For AAB (recommended for Play Store)
```

Output location:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### 5.6 Create Google Play Console Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create App**
3. Fill in details:
   - App name: Oneiros.me
   - Default language: English
   - App type: App
   - Free or Paid: Free

### 5.7 Prepare Play Store Assets

**Screenshots Required:**
- Phone: 1080 x 1920 px to 1080 x 2340 px (min 2 screenshots)
- 7-inch Tablet: 1200 x 1920 px (optional)
- 10-inch Tablet: 1600 x 2560 px (optional)

**Feature Graphic:**
- 1024 x 500 px JPG or PNG

**App Icon:**
- 512 x 512 px PNG
- Already in `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

**Metadata:**
- Short description: 80 characters
- Full description: 4000 characters
- Screenshots: Minimum 2

### 5.8 Upload and Submit

1. In Play Console, go to **Production** → **Create new release**
2. Upload your AAB file
3. Fill in release details
4. Review and rollout to production

**Review Timeline:** 1-7 days typically

---

## Step 6: Post-Deployment

### Update Checklist
- [ ] Monitor crash reports (Xcode Organizer / Play Console)
- [ ] Check user reviews daily
- [ ] Set up app analytics (Firebase, Amplitude, etc.)
- [ ] Monitor performance metrics
- [ ] Respond to user feedback
- [ ] Plan regular updates (monthly recommended)

### Updating the App

When you make changes:

1. Update version numbers:
   - iOS: Xcode → General → Version and Build
   - Android: `build.gradle` → `versionCode` and `versionName`

2. Build and sync:
```bash
npm run build
npx cap sync
```

3. Test thoroughly on devices

4. Submit new version following Steps 4-5 above

---

## Troubleshooting

### iOS Issues

**"Failed to code sign"**
- Solution: Check your Apple Developer account is active
- Verify certificate in Xcode → Preferences → Accounts

**"Provisioning profile doesn't match"**
- Solution: Let Xcode manage signing automatically
- Or create new provisioning profile in Apple Developer Portal

### Android Issues

**"Duplicate class found"**
- Solution: Clean build: `./gradlew clean`
- Check for conflicting dependencies

**"Unable to find bundletool"**
- Solution: Update Android Studio and Gradle
- Or download bundletool manually

### General Issues

**"White screen on launch"**
- Solution: Check `capacitor.config.ts` server URL
- Remove server config for production builds

**"API calls not working"**
- Solution: Configure CORS for native apps
- Check Supabase URL and keys are correct

---

## Cost Breakdown

### One-Time Costs
- Apple Developer Account: $99/year
- Google Play Developer Account: $25 one-time

### Ongoing Costs
- Hosting: Covered by Lovable/Supabase
- Apple renewal: $99/year
- Optional: App store optimization tools

---

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://developer.android.com/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Policy](https://play.google.com/about/developer-content-policy/)

---

## Next Steps

After successful deployment:

1. **Marketing:**
   - Create launch announcement
   - Submit to app review sites
   - Share on social media
   - Create demo video

2. **Optimization:**
   - Monitor app store rankings
   - Optimize keywords
   - A/B test screenshots
   - Encourage user reviews

3. **Updates:**
   - Plan feature roadmap
   - Address user feedback
   - Fix bugs promptly
   - Regular security updates

Good luck with your app launch! 🚀
