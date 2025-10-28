/**
 * Input Validation & Sanitization Utilities
 * Ensures all user inputs are safe and properly formatted
 * Follows OWASP standards and industry best practices
 */

/**
 * Validates and sanitizes text input
 * Prevents XSS attacks and invalid characters
 */
export const sanitizeText = (text: string, maxLength: number = 512): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Validates email address format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates file size
 */
export const validateFileSize = (fileSizeInBytes: number, maxSizeInMB: number = 50): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSizeInBytes <= maxSizeInBytes;
};

/**
 * Validates file type
 */
export const validateFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  return allowedTypes.includes(`.${fileExtension}`) || allowedTypes.includes(fileExtension);
};

/**
 * Validates URL format
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates image dimensions
 */
export const validateImageDimensions = (
  width: number,
  height: number,
  minWidth: number = 100,
  minHeight: number = 100,
  maxWidth: number = 8000,
  maxHeight: number = 8000
): boolean => {
  return width >= minWidth && 
         height >= minHeight && 
         width <= maxWidth && 
         height <= maxHeight;
};

/**
 * Sanitizes HTML content (for safe display)
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Validates color format
 */
export const validateColor = (color: string): boolean => {
  const colorRegex = /^#[0-9A-F]{6}$/i;
  return colorRegex.test(color);
};

/**
 * Safe JSON parse with default value
 */
export const safeJsonParse = <T>(json: string, defaultValue: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * Validates that a value is not null/undefined
 */
export const isValid = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Throttle function to prevent excessive calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
};

/**
 * Debounce function for delayed execution
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
