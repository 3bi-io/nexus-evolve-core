# Mobile-First Responsive Development Guide

This guide explains how to use the new mobile-first responsive system in Oneiros.me.

## Overview

The platform now uses a comprehensive mobile-first approach with:
- **Responsive Hooks**: `useResponsive()` for device detection
- **Responsive Components**: Pre-built containers, grids, and sections
- **Touch-Optimized**: Proper touch targets and gestures
- **Performance**: Optimized for mobile devices

## Hooks

### useResponsive()

Enhanced responsive detection hook that provides detailed device information.

```tsx
import { useResponsive } from '@/hooks/useResponsive';

function MyComponent() {
  const {
    breakpoint,      // 'mobile' | 'tablet' | 'desktop' | 'wide'
    isMobile,        // width < 768px
    isTablet,        // 768px ≤ width < 1024px
    isDesktop,       // 1024px ≤ width < 1536px
    isWide,          // width ≥ 1536px
    width,           // Current viewport width
    height,          // Current viewport height
    orientation,     // 'portrait' | 'landscape'
    isTouchDevice,   // Has touch capability
    isSmallMobile,   // width < 375px
    isMediumMobile,  // 375px ≤ width ≤ 428px
    isLargeMobile,   // 428px < width < 768px
  } = useResponsive();

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### Utility Hooks

```tsx
import { useBreakpoint, useMinBreakpoint } from '@/hooks/useResponsive';

// Check for specific breakpoint
const isMobile = useBreakpoint('mobile');

// Check for minimum breakpoint
const isTabletOrLarger = useMinBreakpoint('tablet');
```

## Components

### ResponsiveContainer

Mobile-first container with automatic responsive padding.

```tsx
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';

<ResponsiveContainer
  size="lg"           // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding="md"        // 'none' | 'sm' | 'md' | 'lg'
  center={true}       // Center horizontally
  fullHeight={false}  // Full viewport height
>
  <YourContent />
</ResponsiveContainer>
```

### ResponsiveGrid

Automatic responsive grid layout.

```tsx
import { ResponsiveGrid } from '@/components/layout/ResponsiveContainer';

<ResponsiveGrid
  cols={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap="md"  // 'sm' | 'md' | 'lg'
>
  <Card />
  <Card />
  <Card />
</ResponsiveGrid>
```

### ResponsiveStack

Flexible stack that adapts to screen size.

```tsx
import { ResponsiveStack } from '@/components/layout/ResponsiveContainer';

<ResponsiveStack
  direction="responsive"  // 'vertical' | 'horizontal' | 'responsive'
  gap="md"               // 'sm' | 'md' | 'lg'
  align="stretch"        // 'start' | 'center' | 'end' | 'stretch'
>
  <div>Item 1</div>
  <div>Item 2</div>
</ResponsiveStack>
```

### ResponsiveSection

Full-width section with responsive spacing and optional header.

```tsx
import { ResponsiveSection } from '@/components/layout/ResponsiveSection';

<ResponsiveSection
  title="Section Title"
  description="Section description"
  action={<Button>Action</Button>}
  spacing="md"          // 'none' | 'sm' | 'md' | 'lg'
  background="default"  // 'default' | 'muted' | 'card'
  fullWidth={false}
>
  <YourContent />
</ResponsiveSection>
```

### TouchTarget

Accessible touch target with minimum 44x44px size.

```tsx
import { TouchTarget } from '@/components/layout/ResponsiveSection';

<TouchTarget
  onClick={() => console.log('tapped')}
  disabled={false}
>
  <Icon />
</TouchTarget>
```

## Best Practices

### 1. Mobile-First CSS

Always write CSS mobile-first, then add larger breakpoints:

```tsx
// ✅ Good: Mobile-first
<div className="text-sm sm:text-base lg:text-lg">

// ❌ Bad: Desktop-first
<div className="text-lg lg:text-base sm:text-sm">
```

### 2. Touch Targets

Ensure all interactive elements are at least 44x44px:

```tsx
// ✅ Good: Proper touch target
<button className="min-h-[44px] min-w-[44px] p-3">

// ❌ Bad: Too small
<button className="p-1">
```

### 3. Responsive Spacing

Use responsive padding and margins:

```tsx
// ✅ Good: Responsive spacing
<div className="p-3 sm:p-4 lg:p-6">

// ❌ Bad: Fixed spacing
<div className="p-6">
```

### 4. Responsive Typography

Scale text appropriately:

```tsx
// ✅ Good: Responsive text
<h1 className="text-2xl sm:text-3xl lg:text-4xl">

// ❌ Bad: Fixed text
<h1 className="text-4xl">
```

### 5. Conditional Rendering

Use hooks for conditional content:

```tsx
const { isMobile } = useResponsive();

return (
  <>
    {isMobile ? (
      <MobileOptimizedComponent />
    ) : (
      <DesktopComponent />
    )}
  </>
);
```

### 6. Performance

Optimize for mobile performance:

```tsx
// Use touch-action for better scrolling
<div className="touch-pan-y">

// Prevent tap highlight
style={{ WebkitTapHighlightColor: 'transparent' }}

// Use will-change sparingly
<div className="will-change-transform">
```

## Breakpoints

The system uses these breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1536px
- **Wide**: ≥ 1536px

### Sub-mobile breakpoints:
- **Small Mobile**: < 375px
- **Medium Mobile**: 375px - 428px
- **Large Mobile**: > 428px

## Example: Complete Page

```tsx
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout/ResponsiveContainer';
import { ResponsiveSection } from '@/components/layout/ResponsiveSection';
import { useResponsive } from '@/hooks/useResponsive';

export default function MyPage() {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveContainer size="xl" padding="md">
      <ResponsiveSection
        title="Page Title"
        description="Page description"
        spacing="lg"
      >
        <ResponsiveGrid
          cols={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap="md"
        >
          {items.map(item => (
            <Card key={item.id}>
              <h3 className="text-lg sm:text-xl">{item.title}</h3>
              <p className="text-sm sm:text-base">{item.description}</p>
            </Card>
          ))}
        </ResponsiveGrid>
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
```

## Migration Guide

### Converting Existing Pages

1. **Replace useMobile() with useResponsive()**:
   ```tsx
   // Before
   const { isMobile } = useMobile();
   
   // After
   const { isMobile } = useResponsive();
   ```

2. **Add responsive containers**:
   ```tsx
   // Before
   <div className="container mx-auto p-4">
   
   // After
   <ResponsiveContainer size="xl" padding="md">
   ```

3. **Use responsive components**:
   ```tsx
   // Before
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
   
   // After
   <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
   ```

## Testing

Test your responsive layouts on multiple devices:

1. **Browser DevTools**: Use responsive mode
2. **Physical Devices**: Test on actual phones/tablets
3. **Orientations**: Test both portrait and landscape
4. **Touch**: Verify touch targets are large enough
5. **Gestures**: Test swipe and scroll gestures

## Common Patterns

### Responsive Navigation
```tsx
const { isMobile } = useResponsive();
return isMobile ? <MobileNav /> : <DesktopNav />;
```

### Responsive Modals
```tsx
<Dialog>
  <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg">
```

### Responsive Cards
```tsx
<Card className="p-3 sm:p-4 lg:p-6">
  <CardHeader className="pb-2 sm:pb-3">
    <CardTitle className="text-lg sm:text-xl lg:text-2xl">
```

### Responsive Forms
```tsx
<form className="space-y-3 sm:space-y-4">
  <Input className="h-10 sm:h-11 text-sm sm:text-base" />
  <Button className="h-10 sm:h-11 text-sm sm:text-base">
```
