/**
 * Performance Optimization Utilities
 * Code splitting, lazy loading, memoization helpers, and performance monitoring
 */

/**
 * Lazy load component (React.lazy wrapper with better error handling)
 */
export const lazyLoadComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  displayName?: string
): React.LazyExoticComponent<T> => {
  const Component = React.lazy(importFunc);
  if (displayName) {
    Component.displayName = `Lazy(${displayName})`;
  }
  return Component;
};

/**
 * Performance monitoring decorator
 */
export const measurePerformance = (
  label: string,
  callback: () => void
): void => {
  if (typeof window === 'undefined' || !window.performance) return;

  const startTime = performance.now();
  try {
    callback();
  } finally {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    console.log(`[Performance] ${label}: ${duration}ms`);
  }
};

/**
 * Async performance measurement
 */
export const measureAsyncPerformance = async <T>(
  label: string,
  asyncFn: () => Promise<T>
): Promise<T> => {
  if (typeof window === 'undefined' || !window.performance) {
    return asyncFn();
  }

  const startTime = performance.now();
  try {
    return await asyncFn();
  } finally {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    console.log(`[Performance] ${label}: ${duration}ms`);
  }
};

/**
 * Debounce function for event handlers
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Throttle function for event handlers
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Memoize expensive computations
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Request idle callback polyfill with fallback
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback) => {
        const start = Date.now();
        return setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          });
        }, 1);
      };

/**
 * Cancel idle callback
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : clearTimeout;

/**
 * Intersection Observer for lazy loading images
 */
export const createLazyImageObserver = (
  onIntersect: (element: HTMLElement) => void
): IntersectionObserver => {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect(entry.target as HTMLElement);
        }
      });
    },
    {
      rootMargin: '50px',
    }
  );
};

/**
 * Virtual scrolling helper for large lists
 */
export interface VirtualScrollState {
  visibleStart: number;
  visibleEnd: number;
  scrollTop: number;
}

export const calculateVisibleRange = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): VirtualScrollState => {
  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEnd = Math.min(
    totalItems,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  return {
    visibleStart,
    visibleEnd,
    scrollTop,
  };
};

/**
 * Resource hints for performance
 */
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  // DNS prefetch for external APIs
  const dnsLinks = [
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  dnsLinks.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  });
};

/**
 * Web Worker helper for CPU-intensive tasks
 */
export const createWorkerPool = <T>(
  workerScript: string,
  poolSize: number = 4
) => {
  const workers: Worker[] = [];
  const taskQueue: Array<{
    task: any;
    resolve: (value: T) => void;
    reject: (error: Error) => void;
  }> = [];

  const createWorker = () => {
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    worker.onmessage = (event) => {
      const item = taskQueue.shift();
      if (item) {
        item.resolve(event.data);
      }
    };
    worker.onerror = (error) => {
      const item = taskQueue.shift();
      if (item) {
        item.reject(error);
      }
    };
    return worker;
  };

  // Initialize pool
  for (let i = 0; i < poolSize; i++) {
    workers.push(createWorker());
  }

  return {
    execute: (task: any): Promise<T> => {
      return new Promise((resolve, reject) => {
        taskQueue.push({ task, resolve, reject });
        const worker = workers.shift();
        if (worker) {
          worker.postMessage(task);
          workers.push(worker);
        }
      });
    },
    terminate: () => {
      workers.forEach((worker) => worker.terminate());
      workers.length = 0;
    },
  };
};

/**
 * Memory leak detection (development only)
 */
export const detectMemoryLeaks = () => {
  if (typeof window === 'undefined' || !('memory' in performance)) return;

  const perf = performance as any;
  const initialMemory = perf.memory?.usedJSHeapSize;

  return {
    checkGrowth: () => {
      const currentMemory = perf.memory?.usedJSHeapSize;
      const growth = (currentMemory - initialMemory) / initialMemory;
      if (growth > 0.2) {
        console.warn(`[Memory] Potential leak detected: ${(growth * 100).toFixed(1)}% growth`);
      }
      return growth;
    },
  };
};

/**
 * Image optimization utilities
 */
export const optimizeImageUrl = (url: string, width: number, quality: number = 85): string => {
  // This would integrate with a CDN like Cloudinary or Imgix
  // For now, returning the original URL
  return url;
};

/**
 * CSS-in-JS performance: avoid creating new objects on each render
 */
export const createStyleCache = () => {
  const cache = new Map<string, React.CSSProperties>();

  return {
    get: (key: string, creator: () => React.CSSProperties): React.CSSProperties => {
      if (!cache.has(key)) {
        cache.set(key, creator());
      }
      return cache.get(key)!;
    },
    clear: () => cache.clear(),
  };
};

/**
 * React import
 */
import React from 'react';
