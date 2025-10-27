/**
 * Premium Design System - $100M Application Grade
 * Inspired by Apple, Linear, and Stripe design systems
 */

export const colors = {
  // Primary brand colors - Sophisticated purple-blue gradient system
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6', // Primary
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },

  // Accent colors - Vibrant cyan for highlights
  accent: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  // Neutral colors - Premium grays with subtle warmth
  neutral: {
    0: '#ffffff',
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
    950: '#0c0a09',
  },

  // Semantic colors - Enhanced for clarity
  success: {
    50: '#f0fdf4',
    light: '#bbf7d0',
    main: '#22c55e',
    dark: '#15803d',
    darker: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#d97706',
    darker: '#92400e',
  },
  error: {
    50: '#fef2f2',
    light: '#fecaca',
    main: '#ef4444',
    dark: '#dc2626',
    darker: '#991b1b',
  },
  info: {
    50: '#eff6ff',
    light: '#bfdbfe',
    main: '#3b82f6',
    dark: '#1d4ed8',
    darker: '#1e3a8a',
  },

  // Premium gradients - Multi-stop, sophisticated
  gradients: {
    primary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
    accent: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    aurora: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)',
    ocean: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
    sunset: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
    forest: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    mesh: 'radial-gradient(at 0% 0%, #8b5cf6 0%, transparent 50%), radial-gradient(at 100% 100%, #06b6d4 0%, transparent 50%), radial-gradient(at 100% 0%, #ec4899 0%, transparent 50%)',
  },

  // Glass morphism
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.2)',
  },

  // Overlay colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.4)',
    medium: 'rgba(0, 0, 0, 0.6)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },
};

export const typography = {
  fontFamily: {
    sans: "'Inter var', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Cal Sans', 'Inter var', 'Inter', sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  },

  // Display & Heading styles
  display: {
    xl: {
      fontSize: '5rem',
      fontWeight: '900',
      lineHeight: '1',
      letterSpacing: '-0.03em',
    },
    lg: {
      fontSize: '4rem',
      fontWeight: '900',
      lineHeight: '1.05',
      letterSpacing: '-0.025em',
    },
    md: {
      fontSize: '3rem',
      fontWeight: '800',
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
    },
  },

  heading: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: '800',
      lineHeight: '1.15',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.015em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: '700',
      lineHeight: '1.3',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.4',
    },
  },

  // Body text sizes
  body: {
    xl: {
      fontSize: '1.25rem',
      fontWeight: '400',
      lineHeight: '1.8',
    },
    lg: {
      fontSize: '1.125rem',
      fontWeight: '400',
      lineHeight: '1.75',
    },
    base: {
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.6',
    },
    sm: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    xs: {
      fontSize: '0.75rem',
      fontWeight: '500',
      lineHeight: '1.4',
    },
  },

  // Labels and captions
  label: {
    lg: {
      fontSize: '0.938rem',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0.01em',
    },
    base: {
      fontSize: '0.875rem',
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '0.01em',
    },
    sm: {
      fontSize: '0.75rem',
      fontWeight: '600',
      lineHeight: '1.2',
      letterSpacing: '0.02em',
      textTransform: 'uppercase' as const,
    },
  },
};

export const spacing = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

export const borderRadius = {
  none: '0',
  xs: '0.25rem',
  sm: '0.375rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  base: '0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 20px -5px rgba(0, 0, 0, 0.15), 0 4px 8px -4px rgba(0, 0, 0, 0.08)',
  xl: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 8px 12px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 30px 60px -15px rgba(0, 0, 0, 0.3), 0 12px 24px -8px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Premium shadows with color tints
  glow: {
    primary: '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
    accent: '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.1)',
    success: '0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.1)',
    error: '0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1)',
  },
  
  // Glass morphism shadows
  glass: {
    sm: '0 4px 16px rgba(31, 38, 135, 0.15)',
    md: '0 8px 32px rgba(31, 38, 135, 0.25)',
    lg: '0 16px 48px rgba(31, 38, 135, 0.35)',
  },
  
  // Elevation system for depth
  elevated: {
    1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
    2: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
    3: '0 6px 12px rgba(0, 0, 0, 0.18), 0 3px 6px rgba(0, 0, 0, 0.12)',
    4: '0 12px 24px rgba(0, 0, 0, 0.2), 0 6px 12px rgba(0, 0, 0, 0.14)',
    5: '0 24px 48px rgba(0, 0, 0, 0.25), 0 12px 24px rgba(0, 0, 0, 0.16)',
  },
};

export const animations = {
  // Timing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Duration presets
  duration: {
    instant: '100ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  // Common transitions
  transition: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  max: 9999,
};

// Blur strengths for glass morphism
export const blur = {
  none: 0,
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
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
  animations,
  breakpoints,
  zIndex,
  blur,
};

export type Theme = typeof theme;
