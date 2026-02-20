import { Platform } from 'react-native';

export const Colors = {
  // Dark cinema palette
  background: '#0A0A0F',
  surface: '#13131A',
  surfaceElevated: '#1C1C26',
  border: '#2A2A3A',

  // Accent
  accent: '#E50914',
  accentSoft: 'rgba(229, 9, 20, 0.15)',
  accentGlow: 'rgba(229, 9, 20, 0.08)',

  // Gold
  gold: '#F5C518',
  goldSoft: 'rgba(245, 197, 24, 0.15)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textTertiary: '#5A5A70',
  textMuted: '#3A3A50',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',

  // Gradient stops
  gradientDark: '#0A0A0F',
  gradientMid: 'rgba(10, 10, 15, 0.85)',
  gradientTransparent: 'rgba(10, 10, 15, 0)',

  // Legacy (kept for hook compatibility)
  light: {
    text: '#0A0A0F',
    background: '#FFFFFF',
    tint: '#E50914',
    icon: '#5A5A70',
    tabIconDefault: '#5A5A70',
    tabIconSelected: '#E50914',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0A0A0F',
    tint: '#E50914',
    icon: '#A0A0B0',
    tabIconDefault: '#A0A0B0',
    tabIconSelected: '#E50914',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
