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
