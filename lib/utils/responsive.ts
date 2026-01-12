import { Platform, useWindowDimensions } from 'react-native';

// Breakpoints for responsive design
export const breakpoints = {
  sm: 640,   // Small tablets
  md: 768,   // Tablets
  lg: 1024,  // Desktop
  xl: 1280,  // Large desktop
};

// Max content width for desktop (keeps content readable)
export const MAX_CONTENT_WIDTH = 480;

// Hook for responsive values (web-only, no-op on native)
export function useResponsive() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  return {
    isWeb,
    isDesktop: isWeb && width >= breakpoints.md,
    isLargeDesktop: isWeb && width >= breakpoints.lg,
    screenWidth: width,
    // Container style for centering content on desktop
    containerStyle: isWeb && width >= breakpoints.md
      ? {
          maxWidth: MAX_CONTENT_WIDTH,
          width: '100%' as const,
          marginHorizontal: 'auto' as const,
        }
      : {},
  };
}

// Static platform check (for non-hook contexts)
export const isWeb = Platform.OS === 'web';
