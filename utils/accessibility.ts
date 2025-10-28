/**
 * Accessibility Utilities
 * Ensures app meets WCAG 2.1 AA standards
 * Supports keyboard navigation, screen readers, and focus management
 */

/**
 * Generates unique accessible ID for form elements
 */
export const generateAccessibleId = (prefix: string): string => {
  return prefix + '-' + Math.random().toString(36).substr(2, 9);
};

/**
 * Manages focus for modals and dialogs
 */
export class FocusTrap {
  private initialFocus: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  activate(): void {
    this.initialFocus = document.activeElement as HTMLElement;
    this.focusableElements = Array.from(
      this.container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }

    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    if (this.initialFocus && typeof this.initialFocus.focus === 'function') {
      this.initialFocus.focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    const first = this.focusableElements[0];
    const last = this.focusableElements[this.focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
}

/**
 * Keyboard event helpers
 */
export const isEnterKey = (event: KeyboardEvent): boolean => event.key === 'Enter';
export const isEscapeKey = (event: KeyboardEvent): boolean => event.key === 'Escape';
export const isArrowUp = (event: KeyboardEvent): boolean => event.key === 'ArrowUp';
export const isArrowDown = (event: KeyboardEvent): boolean => event.key === 'ArrowDown';
export const isArrowLeft = (event: KeyboardEvent): boolean => event.key === 'ArrowLeft';
export const isArrowRight = (event: KeyboardEvent): boolean => event.key === 'ArrowRight';

/**
 * Announces messages to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('role', 'status');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
};

/**
 * Makes element focusable programmatically
 */
export const makeFocusable = (element: HTMLElement): void => {
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
  }
};

/**
 * Checks if element is keyboard accessible
 */
export const isKeyboardAccessible = (element: HTMLElement): boolean => {
  const tabindex = element.getAttribute('tabindex');
  const isNaturallyFocusable = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
    element.tagName
  );
  return isNaturallyFocusable || (tabindex !== null && parseInt(tabindex) >= 0);
};

/**
 * Safe focus management
 */
export const safeFocus = (element: HTMLElement | null): void => {
  if (element && typeof element.focus === 'function') {
    element.focus();
    announceToScreenReader('Element focused');
  }
};

/**
 * Generates ARIA label for icon-only buttons
 */
export const getIconButtonAriaLabel = (iconType: string): string => {
  const labels: Record<string, string> = {
    settings: 'Open settings',
    download: 'Download image',
    share: 'Share image',
    delete: 'Delete image',
    edit: 'Edit image',
    close: 'Close dialog',
    menu: 'Open menu',
    search: 'Search',
    filter: 'Filter results',
  };
  return labels[iconType] || 'Button';
};
