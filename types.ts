export enum AppState {
  START,
  CAMERA,
  EDITING,
  RESULT,
  GALLERY,
  GALLERY_DETAIL,
}

export type Theme = 'modern' | 'luxury' | 'dynamic' | 'family';
export type AspectRatio = 'original' | '1:1' | '9:16' | '1.91:1';
export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

// AI enhancement controls
export type AIMode = 'professional' | 'cinematic' | 'portrait' | 'creative' | 'natural';
export type EnhancementLevel = 'subtle' | 'moderate' | 'dramatic';

export interface ImageAdjustments {
  exposure: number;      // -50 to 50
  contrast: number;      // -50 to 50
  temperature: number;   // -50 to 50 (warm to cool)
  saturation: number;    // -50 to 50
  sharpen: number;       // 0 to 10
}

export const DEFAULT_IMAGE_ADJUSTMENTS: ImageAdjustments = {
  exposure: 0,
  contrast: 0,
  temperature: 0,
  saturation: 0,
  sharpen: 0,
};

export interface EditOptions {
  theme: Theme;
  message: string;
  ctaText: string;
  logoBase64: string | null;
  logoMimeType: string | null;
  aspectRatio: AspectRatio;
  logoPosition: LogoPosition;
  // Optional AI-specific controls
  aiMode?: AIMode;
  enhancementLevel?: EnhancementLevel;
  // Optional image adjustments (hints for AI enhancement)
  adjustments?: ImageAdjustments;
  compareMode?: boolean; // For before/after preview
}

export interface LogoData {
  base64: string;
  mimeType: string;
}

export interface GalleryImage {
  id: string;
  imageDataUrl: string;
  thumbnail?: string; // Smaller preview for grid
  createdAt: number;
  // Enhancement metadata
  theme?: Theme;
  aiMode?: AIMode;
  enhancementLevel?: EnhancementLevel;
  adjustments?: ImageAdjustments;
  // Editing metadata
  message?: string;
  ctaText?: string;
  aspectRatio?: AspectRatio;
  logoPosition?: LogoPosition;
  // Analytics
  processingTime?: number; // milliseconds
  rating?: number; // 1-5 stars
  isFavorite?: boolean;
  tags?: string[];
  // Auto-enhance metadata
  enhanceStrategy?: string;
  enhanceConfidence?: number;
}

// Settings & Preferences
export interface ShortcutKey {
  id: string;
  keys: string[];
  enabled: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultAIMode: AIMode;
  defaultEnhancementLevel: EnhancementLevel;
  enableAutoSuggest: boolean;
  enableTutorial: boolean;
  shortcuts: ShortcutKey[];
  enableAnalytics: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  defaultAIMode: 'professional',
  defaultEnhancementLevel: 'moderate',
  enableAutoSuggest: true,
  enableTutorial: true,
  shortcuts: [],
  enableAnalytics: true,
};

// Analytics
export interface AnalyticsMetrics {
  totalPhotos: number;
  totalEnhancements: number;
  averageProcessingTime: number;
  mostUsedAIMode: AIMode | null;
  mostUsedTheme: Theme | null;
  mostUsedEnhanceStrategy: string | null;
  strategyUsage: Record<string, number>;
  aiModeUsage: Record<AIMode, number>;
  themeUsage: Record<Theme, number>;
  averageRating: number;
  sessionCount: number;
  lastSessionDate: number;
}

export interface AnalyticsEvent {
  id: string;
  type: 'photo_captured' | 'enhancement_applied' | 'preset_used' | 'shortcut_used' | 'strategy_used' | 'rating_given';
  timestamp: number;
  metadata: Record<string, any>;
}

// Tutorial System
export type TutorialStep = 'welcome' | 'camera' | 'editing' | 'ai-modes' | 'shortcuts' | 'presets' | 'gallery' | 'complete';

export interface TutorialState {
  isActive: boolean;
  currentStep: TutorialStep;
  completedSteps: TutorialStep[];
  shouldShowIntroduction: boolean;
}

// Batch Processing
export interface BatchJob {
  id: string;
  imageIds: string[];
  strategy: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  results: string[]; // Enhanced image data URLs
  startedAt: number;
  completedAt?: number;
}

// Performance Metrics
export interface PerformanceMetrics {
  imageProcessingTime: number; // milliseconds
  enhancementTime: number; // milliseconds
  totalTime: number; // milliseconds
  imageSizeMB: number;
  adjustmentsApplied: number;
  gpuAccelerated: boolean;
}
