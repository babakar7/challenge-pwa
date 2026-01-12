// Revive Brand Color Palette
// A warm, supportive health/wellness aesthetic

export const colors = {
  // Primary brand color - Revive purple
  primary: '#7C547D',
  primaryMuted: 'rgba(124, 84, 125, 0.12)',
  primaryLight: 'rgba(124, 84, 125, 0.08)',

  // Semantic colors - slightly desaturated for softness
  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.12)',
  warning: '#F59E0B',
  warningMuted: 'rgba(245, 158, 11, 0.12)',
  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.12)',

  // Revive warm foundation
  background: '#FBF6F0', // Cream - main background
  card: '#FFFDFB', // Warm white - cards blend with cream background
  cardAlt: '#F2E7E2', // Warm blush - alternative card/section background

  // Text hierarchy - based on Revive dark brown
  text: '#413733', // Primary - Revive brown
  textSecondary: '#5C524D', // Secondary - lighter brown
  textMuted: '#8A817A', // Muted
  textFaint: '#B8B0A9', // Faint

  // Borders - warm, subtle
  border: 'rgba(65, 55, 51, 0.10)',
  borderStrong: 'rgba(65, 55, 51, 0.16)',

  // Feature colors - coordinated with Revive purple
  streak: '#F97316', // Orange - achievement
  streakMuted: 'rgba(249, 115, 22, 0.12)',
  weight: '#7C547D', // Revive purple - progress
  weightMuted: 'rgba(124, 84, 125, 0.12)',
  steps: '#10B981', // Emerald - activity
  stepsMuted: 'rgba(16, 185, 129, 0.12)',
  meals: '#E879A0', // Soft rose - nutrition (coordinated with palette)
  mealsMuted: 'rgba(232, 121, 160, 0.12)',
};

// 4px grid spacing system
export const spacing = {
  xs: 4,   // Micro spacing
  sm: 8,   // Tight spacing (within components)
  md: 12,  // Standard spacing (between related elements)
  lg: 16,  // Comfortable spacing (section padding)
  xl: 24,  // Generous spacing (between sections)
  xxl: 32, // Major separation
};

// Consistent soft corners
export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadow system - warm shadows using Revive brown
export const shadows = {
  sm: {
    shadowColor: '#413733',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#413733',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#413733',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
};

// Typography - humanist, warm
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  mono: {
    fontSize: 14,
    fontWeight: '500' as const,
    fontFamily: 'monospace',
  },
};

// Animation timing
export const animation = {
  fast: 150,
  normal: 200,
  slow: 250,
};
