/**
 * Face Beauty Service
 * Provides AI-powered facial enhancement and beauty filters
 * Includes skin smoothing, brightening, eye enhancement, and more
 */

export interface BeautySettings {
  skinSmoothness: number; // 0-100 (blur strength)
  skinBrightness: number; // -50 to +50
  eyeBrightness: number; // -50 to +50
  eyeSharpness: number; // 0-100 (clarity for eyes)
  cheekTint: number; // 0-100 (warm tint)
  lipColor: number; // 0-100 (warmth)
  faceSharpening: number; // 0-50
}

export interface BeautyPreset {
  name: string;
  description: string;
  icon: string;
  settings: BeautySettings;
}

class FaceBeautyService {
  private readonly BEAUTY_PRESETS: BeautyPreset[] = [
    {
      name: 'Natural Glow',
      description: 'Subtle enhancement with natural look',
      icon: '✨',
      settings: {
        skinSmoothness: 30,
        skinBrightness: 15,
        eyeBrightness: 20,
        eyeSharpness: 40,
        cheekTint: 20,
        lipColor: 15,
        faceSharpening: 10,
      },
    },
    {
      name: 'Flawless Skin',
      description: 'Premium skin smoothing and refinement',
      icon: '💎',
      settings: {
        skinSmoothness: 60,
        skinBrightness: 25,
        eyeBrightness: 30,
        eyeSharpness: 50,
        cheekTint: 30,
        lipColor: 25,
        faceSharpening: 15,
      },
    },
    {
      name: 'Radiant',
      description: 'Bright and vibrant look',
      icon: '🌟',
      settings: {
        skinSmoothness: 45,
        skinBrightness: 35,
        eyeBrightness: 40,
        eyeSharpness: 55,
        cheekTint: 40,
        lipColor: 35,
        faceSharpening: 20,
      },
    },
    {
      name: 'Bold Look',
      description: 'Dramatic enhancement for impact',
      icon: '⚡',
      settings: {
        skinSmoothness: 50,
        skinBrightness: 20,
        eyeBrightness: 45,
        eyeSharpness: 70,
        cheekTint: 50,
        lipColor: 50,
        faceSharpening: 30,
      },
    },
    {
      name: 'Soft Focus',
      description: 'Dreamy, soft appearance',
      icon: '🎀',
      settings: {
        skinSmoothness: 75,
        skinBrightness: 20,
        eyeBrightness: 15,
        eyeSharpness: 30,
        cheekTint: 25,
        lipColor: 20,
        faceSharpening: 5,
      },
    },
    {
      name: 'Professional',
      description: 'Polished look for portraits',
      icon: '👔',
      settings: {
        skinSmoothness: 40,
        skinBrightness: 10,
        eyeBrightness: 25,
        eyeSharpness: 60,
        cheekTint: 15,
        lipColor: 10,
        faceSharpening: 25,
      },
    },
  ];

  /**
   * Get all beauty presets
   */
  getAllPresets(): BeautyPreset[] {
    return this.BEAUTY_PRESETS;
  }

  /**
   * Get preset by name
   */
  getPreset(name: string): BeautyPreset | undefined {
    return this.BEAUTY_PRESETS.find((p) => p.name === name);
  }

  /**
   * Generate CSS filter string for beauty effects
   * Converts beauty settings to browser-compatible filters
   */
  generateFilterString(settings: BeautySettings): string {
    const filters: string[] = [];

    // Brightness adjustment for face
    const baseBrightness = 100 + settings.skinBrightness * 0.5; // Convert -50..50 to 75..125
    filters.push(`brightness(${baseBrightness}%)`);

    // Saturation for skin tone warmth
    const saturation = 100 + settings.cheekTint * 0.3;
    filters.push(`saturate(${saturation}%)`);

    // Contrast for sharpening
    const contrast = 100 + settings.faceSharpening * 0.5;
    filters.push(`contrast(${contrast}%)`);

    return filters.join(' ');
  }

  /**
   * Generate blur filter for skin smoothing
   * Uses CSS blur filter
   */
  generateBlurFilter(skinSmoothness: number): string {
    // Scale 0-100 to 0-8px blur
    const blurAmount = (skinSmoothness / 100) * 8;
    return `blur(${blurAmount}px)`;
  }

  /**
   * Generate shadow/glow for eye brightening effect
   * Creates illusion of brighter, more awake eyes
   */
  generateEyeGlowEffect(eyeBrightness: number): string {
    // Higher eyeBrightness = more glow
    const glowIntensity = (eyeBrightness / 100) * 0.3; // 0-0.3 opacity
    return `drop-shadow(0 0 ${eyeBrightness * 0.3}px rgba(255, 255, 200, ${glowIntensity}))`;
  }

  /**
   * Validate beauty settings
   */
  validateSettings(settings: BeautySettings): boolean {
    return (
      settings.skinSmoothness >= 0 &&
      settings.skinSmoothness <= 100 &&
      settings.skinBrightness >= -50 &&
      settings.skinBrightness <= 50 &&
      settings.eyeBrightness >= -50 &&
      settings.eyeBrightness <= 50 &&
      settings.eyeSharpness >= 0 &&
      settings.eyeSharpness <= 100 &&
      settings.cheekTint >= 0 &&
      settings.cheekTint <= 100 &&
      settings.lipColor >= 0 &&
      settings.lipColor <= 100 &&
      settings.faceSharpening >= 0 &&
      settings.faceSharpening <= 50
    );
  }

  /**
   * Get default beauty settings (no enhancement)
   */
  getDefaultSettings(): BeautySettings {
    return {
      skinSmoothness: 0,
      skinBrightness: 0,
      eyeBrightness: 0,
      eyeSharpness: 0,
      cheekTint: 0,
      lipColor: 0,
      faceSharpening: 0,
    };
  }

  /**
   * Blend two beauty settings
   * Useful for gradual transitions or combinations
   */
  blendSettings(settings1: BeautySettings, settings2: BeautySettings, factor: number): BeautySettings {
    // factor: 0 = all settings1, 1 = all settings2, 0.5 = 50/50
    const factor2 = 1 - factor;
    return {
      skinSmoothness: settings1.skinSmoothness * factor2 + settings2.skinSmoothness * factor,
      skinBrightness: settings1.skinBrightness * factor2 + settings2.skinBrightness * factor,
      eyeBrightness: settings1.eyeBrightness * factor2 + settings2.eyeBrightness * factor,
      eyeSharpness: settings1.eyeSharpness * factor2 + settings2.eyeSharpness * factor,
      cheekTint: settings1.cheekTint * factor2 + settings2.cheekTint * factor,
      lipColor: settings1.lipColor * factor2 + settings2.lipColor * factor,
      faceSharpening: settings1.faceSharpening * factor2 + settings2.faceSharpening * factor,
    };
  }
}

let instance: FaceBeautyService | null = null;

export const getFaceBeautyService = (): FaceBeautyService => {
  if (!instance) {
    instance = new FaceBeautyService();
  }
  return instance;
};

export default FaceBeautyService;
