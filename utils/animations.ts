/**
 * Animation and Transition Utilities
 * Reusable animation definitions for consistent motion design
 */

export const keyframes = {
  // Entrance animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeInUp: {
    from: { opacity: 0, transform: 'translateY(16px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  fadeInDown: {
    from: { opacity: 0, transform: 'translateY(-16px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  fadeInLeft: {
    from: { opacity: 0, transform: 'translateX(-16px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  fadeInRight: {
    from: { opacity: 0, transform: 'translateX(16px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },

  // Exit animations
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  fadeOutUp: {
    from: { opacity: 1, transform: 'translateY(0)' },
    to: { opacity: 0, transform: 'translateY(16px)' },
  },

  // Micro-interactions
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  shimmer: {
    '0%': { backgroundPosition: '200% center' },
    '100%': { backgroundPosition: '-200% center' },
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-8px)' },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  wiggle: {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-2px)' },
    '75%': { transform: 'translateX(2px)' },
  },

  // Loading animations
  slideInFromLeft: {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' },
  },
  slideInFromRight: {
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' },
  },
};

export const transitions = {
  // Fast interactions
  fast: 'all 100ms cubic-bezier(0.4, 0, 0.2, 1)',
  fastOpacity: 'opacity 100ms cubic-bezier(0.4, 0, 0.2, 1)',
  fastTransform: 'transform 100ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Standard transitions
  standard: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  standardOpacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  standardTransform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Slow/deliberate
  slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slowOpacity: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Entrance animations
  entrance: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  entranceOpacity: 'opacity 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',

  // Exit animations
  exit: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
};

/**
 * Generate inline animation CSS
 */
export const createAnimation = (
  name: string,
  frames: Record<string, Record<string, string>>,
  duration: string = '300ms',
  easing: string = 'cubic-bezier(0.4, 0, 0.2, 1)',
  delay: string = '0ms'
): string => {
  const keyframeString = Object.entries(frames)
    .map(([key, styles]) => {
      const styleString = Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join(' ');
      return `${key} { ${styleString} }`;
    })
    .join(' ');

  return `animation: ${name} ${duration} ${easing} ${delay} forwards;`;
};

/**
 * Stagger animation delays for lists
 */
export const getStaggerDelay = (index: number, baseDelay: number = 50): string => {
  return `${index * baseDelay}ms`;
};

/**
 * Common animation classes (to be added to Tailwind config)
 */
export const animationClasses = {
  fadeIn: 'animate-fadeIn',
  fadeInUp: 'animate-fadeInUp',
  fadeInDown: 'animate-fadeInDown',
  fadeInLeft: 'animate-fadeInLeft',
  fadeInRight: 'animate-fadeInRight',
  scaleIn: 'animate-scaleIn',
  pulse: 'animate-pulse',
  shimmer: 'animate-shimmer',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
};
