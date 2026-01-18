# Fix PWA Viewport Cutting Issue

## Problem Statement
On the PWA, the top and bottom content gets cut off when scrolling. The bottom navigation bar overlaps content and requires hard scrolling to reveal. When the bottom menu appears, it cuts text at the top.

## Root Cause Analysis
The app uses `viewport-fit=cover` in the viewport meta tag, which extends content under the system UI (notches, home indicators, browser chrome). However, the CSS and layout don't compensate for this using safe-area-inset values.

**Key issues found:**
1. `app/+html.tsx:44-50` - CSS styles don't use `env(safe-area-inset-*)` variables
2. `app/(tabs)/_layout.tsx:71-74` - Tab bar has no bottom safe area padding
3. `app/(tabs)/index.tsx:96` - SafeAreaView only protects top edge, not bottom

## Solution

### Step 1: Update CSS in +html.tsx
Add CSS safe-area-inset handling to the global styles to ensure the root element accounts for device safe areas:

```css
html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background-color: #FBF6F0;
}
```

### Step 2: Add safe area padding to tab bar
Update the `tabBarStyle` in `_layout.tsx` to include bottom padding for PWA:

```typescript
tabBarStyle: {
  backgroundColor: colors.card,
  borderTopColor: colors.border,
  paddingBottom: Platform.OS === 'web' ? 'env(safe-area-inset-bottom)' : undefined,
},
```

## Files to Modify
1. `revive-challenge/app/+html.tsx` - Add safe-area-inset CSS
2. `revive-challenge/app/(tabs)/_layout.tsx` - Add tab bar bottom padding

## Verification Steps
1. Build and deploy the PWA
2. Test on mobile device (iOS Safari, Chrome Android)
3. Verify bottom navigation doesn't overlap content
4. Verify scrolling to bottom shows all content without extra effort
5. Verify top content isn't cut off when bottom nav appears
