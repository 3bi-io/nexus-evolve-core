# Mobile App Resources

This folder contains assets for native mobile app builds.

## Structure

```
resources/
├── icon.png          # Master icon (1024x1024)
├── splash.png        # Master splash screen (2732x2732)
├── ios/              # iOS-specific resources
│   └── icon/         # iOS icon sizes (generated)
│   └── splash/       # iOS splash screens (generated)
└── android/          # Android-specific resources
    └── icon/         # Android icon sizes (generated)
    └── splash/       # Android splash screens (generated)
```

## How to Generate

### 1. Create Master Assets

**icon.png** (1024x1024):
- Oneiros logo/branding centered
- Dark background (#0f0a1e)
- 20% padding from edges
- No transparency for iOS

**splash.png** (2732x2732):
- Dark background (#0f0a1e)
- Oneiros logo centered (~30% width)
- Optional: "Advanced AI Platform" tagline

### 2. Generate All Sizes

Use Capacitor's asset generator or online tools:

```bash
# Using Capacitor CLI (recommended)
npm install -g @capacitor/assets
npx capacitor-assets generate --iconPath resources/icon.png --splashPath resources/splash.png
```

Or use online tools:
- https://icon.kitchen (icons)
- https://apetools.webprofusion.com/app/#/tools/imagegorilla (splash)

### 3. Manual Placement

If not using Capacitor Assets, manually copy to:

**iOS Icons**: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
**iOS Splash**: `ios/App/App/Assets.xcassets/Splash.imageset/`
**Android Icons**: `android/app/src/main/res/mipmap-*/`
**Android Splash**: `android/app/src/main/res/drawable/`

## Design Guidelines

### Colors
- Primary background: `#0f0a1e` (dark purple)
- Accent colors: Purple/cyan gradients from brand
- Ensure good contrast for app icon visibility

### Icon Design
- Simple, recognizable at small sizes
- Avoid fine details or text
- Test on both light and dark backgrounds
- Follow platform guidelines (iOS flat design, Android Material)

### Splash Screen
- Keep it simple - logo + background
- Match app's initial loading screen
- Don't show for too long (2 seconds max)

## Need Help?

Refer to:
- MOBILE_APP_ASSETS_GUIDE.md (detailed instructions)
- NATIVE_APP_DEPLOYMENT.md (full deployment guide)
- https://capacitorjs.com/docs/guides/splash-screens-and-icons
