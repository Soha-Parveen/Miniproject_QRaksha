import { MD3LightTheme, MD3Theme } from 'react-native-paper';

export const COLORS = {
  // Brand colors
  primary: '#0A1E3F',          // Deep Navy Blue
  primaryDark: '#061329',
  primaryLight: '#1E3A8A',
  accent: '#2563EB',           // Royal Blue

  // Semantic Status Colors
  safe: '#10B981',             // Emerald Green
  safeDark: '#047857',
  safeLight: '#ECFDF5',
  safeBorder: '#A7F3D0',

  caution: '#F59E0B',          // Amber
  cautionDark: '#B45309',
  cautionLight: '#FFFBEB',
  cautionBorder: '#FDE68A',

  danger: '#EF4444',           // Crimson Red
  dangerDark: '#B91C1C',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FECACA',

  // Neutrals & Surfaces
  background: '#F8FAFC',       // Slate 50
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0',           // Slate 200
  divider: '#F1F5F9',

  // Typography
  textPrimary: '#0F172A',      // Slate 900
  textSecondary: '#64748B',    // Slate 500
  textMuted: '#94A3B8',        // Slate 400
  textInverse: '#FFFFFF',

  // Overlay
  backdrop: 'rgba(10, 30, 63, 0.65)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0A1E3F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0A1E3F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0A1E3F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    onPrimary: COLORS.textInverse,
    primaryContainer: '#E0E7FF',
    onPrimaryContainer: COLORS.primaryDark,
    background: COLORS.background,
    surface: COLORS.surface,
    onSurface: COLORS.textPrimary,
    error: COLORS.danger,
    onError: COLORS.textInverse,
    outline: COLORS.border,
  },
};
