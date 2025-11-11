#!/bin/bash

echo "🚀 Preparing Oneiros for Production Build..."
echo ""

# Check if running from project root
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ Error: Please run this script from the project root"
    exit 1
fi

# 1. Check for server config in capacitor.config.ts
if grep -q "server:" capacitor.config.ts; then
    if grep -q "// server:" capacitor.config.ts; then
        echo "✅ Server config already commented out"
    else
        echo "⚠️  WARNING: Server config is not commented out in capacitor.config.ts"
        echo "   For production builds, comment out the server section"
        read -p "   Would you like me to comment it out? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sed -i.bak 's/^  server:/  \/\/ server:/' capacitor.config.ts
            sed -i.bak 's/^    url:/    \/\/ url:/' capacitor.config.ts
            sed -i.bak 's/^    cleartext:/    \/\/ cleartext:/' capacitor.config.ts
            sed -i.bak 's/^  },/  \/\/ },/' capacitor.config.ts
            echo "✅ Server config commented out"
        fi
    fi
else
    echo "✅ No server config found (production ready)"
fi

# 2. Check for resources
echo ""
echo "📱 Checking for app assets..."

if [ -f "resources/icon.png" ]; then
    echo "✅ Master icon found"
else
    echo "⚠️  Master icon not found at resources/icon.png"
    echo "   Create a 1024x1024 PNG icon before building"
fi

if [ -f "resources/splash.png" ]; then
    echo "✅ Master splash screen found"
else
    echo "⚠️  Master splash screen not found at resources/splash.png"
    echo "   Create a 2732x2732 PNG splash screen before building"
fi

# 3. Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"

# 4. Build web assets
echo ""
echo "🏗️  Building web assets..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Web assets built"

# 5. Check if platforms are added
echo ""
echo "📱 Checking native platforms..."

if [ ! -d "ios" ]; then
    echo "⚠️  iOS platform not added"
    read -p "   Add iOS platform? (requires Mac) (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx cap add ios
        echo "✅ iOS platform added"
    fi
else
    echo "✅ iOS platform exists"
fi

if [ ! -d "android" ]; then
    echo "⚠️  Android platform not added"
    read -p "   Add Android platform? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx cap add android
        echo "✅ Android platform added"
    fi
else
    echo "✅ Android platform exists"
fi

# 6. Sync to native platforms
echo ""
echo "🔄 Syncing to native platforms..."
npx cap sync
if [ $? -ne 0 ]; then
    echo "❌ Sync failed"
    exit 1
fi
echo "✅ Synced to native platforms"

# 7. Update native platforms
echo ""
echo "🔄 Updating native dependencies..."
if [ -d "ios" ]; then
    npx cap update ios
    echo "✅ iOS updated"
fi
if [ -d "android" ]; then
    npx cap update android
    echo "✅ Android updated"
fi

# 8. Summary
echo ""
echo "============================================"
echo "✅ Production build preparation complete!"
echo "============================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Review assets:"
echo "   - App icon: resources/icon.png"
echo "   - Splash screen: resources/splash.png"
echo ""
echo "2. Configure permissions (if not done):"
echo "   - iOS: ios/App/App/Info.plist"
echo "   - Android: android/app/src/main/AndroidManifest.xml"
echo "   See MOBILE_APP_ASSETS_GUIDE.md for details"
echo ""
echo "3. Update version numbers:"
echo "   - iOS: Open Xcode, update version in General tab"
echo "   - Android: Edit android/app/build.gradle"
echo ""
echo "4. Open in native IDE:"
echo "   - iOS: npx cap open ios"
echo "   - Android: npx cap open android"
echo ""
echo "5. Build for app stores:"
echo "   - iOS: Product > Archive in Xcode"
echo "   - Android: Build > Generate Signed Bundle in Android Studio"
echo ""
echo "📚 Documentation:"
echo "   - MOBILE_APP_ASSETS_GUIDE.md"
echo "   - NATIVE_APP_DEPLOYMENT.md"
echo ""
