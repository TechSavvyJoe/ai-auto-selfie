/**
 * Enterprise-grade Design System
 * Color palette, typography, spacing, and animation tokens
 */

export const colors = {
  // Primary brand colors - Premium blue with depth
  primary: {
    50: '#f0f7ff',
    100: '#e0ecff',
    200: '#c7deff',
    300: '#a3ccff',
    400: '#7eb3ff',
    500: '#5a9bff', // Primary
    600: '#4284ff',
    700: '#2d65ff',
    800: '#1e4bff',
    900: '#143aff',
  },

  // Neutral colors - Professional grays
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Semantic colors
  success: {
    light: '#d1fae5',
    main: '#10b981',
    dark: '#047857',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#d97706',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#1d4ed8',
  },

  // Gradients
  gradients: {
    brand: 'linear-gradient(135deg, #5a9bff 0%, #2d65ff 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
};

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  // Heading styles
  heading: {
    h1: {
      fontSize: '3.5rem',
      fontWeight: '900',
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: '800',
      lineHeight: '1.2',
      letterSpacing: '-0.015em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: '700',
      lineHeight: '1.3',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: '700',
      lineHeight: '1.4',
    },
  },

  // Body text sizes
  body: {
    lg: {
      fontSize: '1.125rem',
      fontWeight: '400',
      lineHeight: '1.75',
    },
    base: {
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    sm: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.4',
    },
    xs: {
      fontSize: '0.75rem',
      fontWeight: '500',
      lineHeight: '1.2',
    },
  },

  // Labels and captions
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    lineHeight: '1.3',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  6: '1.5rem',
  8: '2rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
};

export const borderRadius = {
  none: '0',
  xs: '0.25rem',
  sm: '0.375rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  // Premium glass effect
  glass: '0 8px 32px rgba(31, 38, 135, 0.37)',
  // Elevation shadows for premium feel
  elevated: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.12)',
    md: '0 4px 16px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
};

export const transitions = {
  // Durations
  duration: {
    fastest: '50ms',
    fast: '100ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing functions
  easing: {
    // Linear
    linear: 'linear',
    // Cubic bezier curves for natural motion
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // For entrance animations
    entrance: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    // For exit animations
    exit: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Pre-defined transitions
  common: {
    all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

/**
 * Theme object combining all design tokens
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
};

export type Theme = typeof theme;
