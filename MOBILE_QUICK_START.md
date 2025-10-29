# 📱 Mobile Quick Start Guide

## Run Your Native App in 5 Steps

### 1️⃣ Export to GitHub
Click **GitHub** button → **Create Repository**

### 2️⃣ Clone and Install
```bash
git clone <your-repo-url>
cd <your-repo-name>
npm install
```

### 3️⃣ Add Platform
**iOS (Mac + Xcode required):**
```bash
npx cap add ios
npx cap update ios
```

**Android (Android Studio required):**
```bash
npx cap add android
npx cap update android
```

### 4️⃣ Build
```bash
npm run build
npx cap sync
```

### 5️⃣ Run
**iOS:**
```bash
npx cap open ios
```
Then click ▶️ in Xcode to run

**Android:**
```bash
npx cap open android
```
Then click ▶️ in Android Studio to run

---

## 🔄 After Making Changes

### In Lovable (Hot Reload Active)
Just save - changes appear instantly on device! ✨

### After Pulling from GitHub
```bash
npm install
npx cap sync
```

---

## 🎯 Quick Component Reference

### Add Mobile Layout
```tsx
import { MobileLayout } from '@/components/mobile/MobileLayout';

<MobileLayout title="My Page" showBack showBottomNav>
  <Content />
</MobileLayout>
```

### Add Haptic Feedback
```tsx
import { useHaptics } from '@/hooks/useMobile';

const { light } = useHaptics();
<Button onClick={async () => {
  await light();
  handleClick();
}}>
```

### Detect Mobile
```tsx
import { useMobile } from '@/hooks/useMobile';

const { isMobile, isNative, platform } = useMobile();
```

---

## 🚨 Troubleshooting

**"Command not found: npx"**
→ Install Node.js from nodejs.org

**"Cannot find module"**
→ Run `npm install`

**"Xcode not found"**
→ Install from Mac App Store (iOS only)

**"Android Studio not found"**
→ Download from developer.android.com (Android only)

---

## 📚 Full Documentation
See `PHASE_6_MOBILE_SETUP.md` for complete details!
