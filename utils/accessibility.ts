/**
 * Accessibility Utilities
 * Focus management, keyboard navigation, and ARIA helpers
 * Ensures WCAG 2.1 AA compliance
 */

/**
 * Manage focus trap for modals and overlays
 */
export const createFocusTrap = (containerEl: HTMLElement) => {
  const focusableElements = containerEl.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  containerEl.addEventListener('keydown', handleKeyDown);

  // Auto-focus first element
  firstElement?.focus();

  return () => {
    containerEl.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Restore focus to previously focused element
 */
export const saveFocus = () => {
  const activeElement = document.activeElement as HTMLElement;
  return () => {
    activeElement?.focus();
  };
};

/**
 * Skip to main content keyboard shortcut
 */
export const initSkipToContent = () => {
  if (typeof document === 'undefined') return;

  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className =
    'absolute top-0 left-0 -translate-y-12 focus:translate-y-0 bg-primary-500 text-white px-3 py-2 rounded z-50 transition-transform';

  document.body.prepend(skipLink);

  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.setAttribute('tabindex', '-1');
  }
};

/**
 * Announce screen reader messages
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement is read
  setTimeout(() => {
    announcement.remove();
  }, 1000);
};

/**
 * Accessible icon button helper
 */
export const getIconButtonProps = (label: string) => ({
  'aria-label': label,
  title: label,
});

/**
 * Accessible image helper
 */
export const getImageProps = (alt: string, decorative: boolean = false) =>
  decorative ? { 'aria-hidden': 'true', alt: '' } : { alt };

/**
 * Keyboard event helpers
 */
export const keyboardEventHelpers = {
  isEnter: (e: KeyboardEvent) => e.key === 'Enter' || e.code === 'Enter',
  isSpace: (e: KeyboardEvent) => e.key === ' ' || e.code === 'Space',
  isEscape: (e: KeyboardEvent) => e.key === 'Escape' || e.code === 'Escape',
  isArrowUp: (e: KeyboardEvent) => e.key === 'ArrowUp' || e.code === 'ArrowUp',
  isArrowDown: (e: KeyboardEvent) => e.key === 'ArrowDown' || e.code === 'ArrowDown',
  isArrowLeft: (e: KeyboardEvent) => e.key === 'ArrowLeft' || e.code === 'ArrowLeft',
  isArrowRight: (e: KeyboardEvent) => e.key === 'ArrowRight' || e.code === 'ArrowRight',
  isTab: (e: KeyboardEvent) => e.key === 'Tab' || e.code === 'Tab',
};

/**
 * Color contrast checker for accessibility
 */
export const getContrastRatio = (rgb1: number[], rgb2: number[]): number => {
  const getLuminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map((value) => {
      const v = value / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Ensure minimum color contrast (WCAG AA)
 */
export const meetsContrastRequirement = (
  rgb1: number[],
  rgb2: number[],
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const ratio = getContrastRatio(rgb1, rgb2);
  return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
};

/**
 * Accessible focus visible styles
 */
export const focusVisibleStyles = `
  :focus-visible {
    outline: 2px solid #5a9bff;
    outline-offset: 2px;
  }

  /* Remove outline for mouse users in Firefox */
  :focus:not(:focus-visible) {
    outline: none;
  }
`;

/**
 * Reduced motion respects prefers-reduced-motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Apply reduced motion variant if user prefers it
 */
export const getMotionStyles = (normalStyle: string, reducedStyle: string): string => {
  return prefersReducedMotion() ? reducedStyle : normalStyle;
};

/**
 * Mobile gesture helpers
 */
export const touchEventHelpers = {
  isTouchEvent: (e: unknown): e is TouchEvent => {
    return typeof e === 'object' && e !== null && 'touches' in e;
  },
  getTouchCoordinates: (e: TouchEvent) => {
    const touch = e.touches[0] || e.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  },
};

/**
 * Dropdown accessibility helpers
 */
export const getDropdownProps = (isOpen: boolean, buttonId: string, menuId: string) => ({
  button: {
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    'aria-controls': menuId,
    id: buttonId,
  },
  menu: {
    role: 'menu',
    id: menuId,
    'aria-labelledby': buttonId,
  },
});

/**
 * Combobox accessibility helpers (for searchable dropdowns)
 */
export const getComboboxProps = (isOpen: boolean, inputId: string, listId: string, activeDescendant?: string) => ({
  input: {
    'aria-autocomplete': 'list',
    'aria-controls': listId,
    'aria-expanded': isOpen,
    'aria-activedescendant': activeDescendant || undefined,
    role: 'combobox',
    id: inputId,
  },
  list: {
    role: 'listbox',
    id: listId,
    'aria-labelledby': inputId,
  },
});
