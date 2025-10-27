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

export interface EditOptions {
  theme: Theme;
  message: string;
  ctaText: string;
  logoBase64: string | null;
  logoMimeType: string | null;
  aspectRatio: AspectRatio;
  logoPosition: LogoPosition;
}

export interface LogoData {
  base64: string;
  mimeType: string;
}
