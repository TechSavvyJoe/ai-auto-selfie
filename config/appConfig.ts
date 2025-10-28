/**
 * App Configuration
 * Centralized configuration for the entire application
 * Follows 12-factor app methodology
 */

export const APP_CONFIG = {
  // App Metadata
  name: 'AI Auto Selfie',
  version: '1.0.0',
  description: 'Professional AI-powered photo enhancement',
  homepage: 'https://ai-auto-selfie.com',

  // Feature Flags
  features: {
    cameraMode: true,
    galleryMode: true,
    desktopMode: true,
    mobileMode: true,
    batchProcessing: true,
  },

  // Performance
  performance: {
    maxImageSize: 10 * 1024 * 1024,
    maxGallerySize: 500,
    imageCacheLimit: 20,
    chunkSize: 1024 * 1024,
    debounceDelay: 300,
    throttleDelay: 500,
  },

  // Limits
  limits: {
    maxTextLength: 64,
    maxCaptionLength: 256,
    maxTags: 10,
    maxOverlays: 10,
    maxSelectionSize: 100,
    apiTimeout: 30000,
  },

  // UI/UX
  ui: {
    animationDuration: 300,
    transitionDuration: 200,
    toastDuration: 3000,
    modalAnimationDuration: 200,
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },

  // Storage
  storage: {
    maxLocalStorageSize: 50 * 1024 * 1024,
    persistenceEnabled: true,
    autoSyncInterval: 60000,
  },
};

export default APP_CONFIG;
