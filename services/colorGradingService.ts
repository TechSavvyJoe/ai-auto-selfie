/**
 * Color Grading Service
 * Provides professional color grading presets
 * Instagram-style color filters for photos
 */

export interface ColorGrade {
  name: string;
  description: string;
  icon: string;
  filters: {
    brightness: number; // -50 to 50
    contrast: number; // -50 to 50
    saturation: number; // -50 to 100
    hueRotate: number; // 0 to 360 (degrees)
    sepia: number; // 0 to 100
    invert: number; // 0 to 100
    grayscale: number; // 0 to 100
  };
}

class ColorGradingService {
  private readonly PRESETS: ColorGrade[] = [
    {
      name: 'Vivid',
      description: 'Bold, saturated colors',
      icon: '🌈',
      filters: {
        brightness: 5,
        contrast: 15,
        saturation: 40,
        hueRotate: 0,
        sepia: 0,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Warm',
      description: 'Golden, sunset tones',
      icon: '🌅',
      filters: {
        brightness: 10,
        contrast: 10,
        saturation: 20,
        hueRotate: -10,
        sepia: 20,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Cool',
      description: 'Blue, icy tones',
      icon: '❄️',
      filters: {
        brightness: 5,
        contrast: 8,
        saturation: 15,
        hueRotate: 10,
        sepia: 0,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Vintage',
      description: 'Retro film look',
      icon: '📽️',
      filters: {
        brightness: -5,
        contrast: 5,
        saturation: -20,
        hueRotate: -5,
        sepia: 30,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Black & White',
      description: 'Timeless monochrome',
      icon: '⬜',
      filters: {
        brightness: 0,
        contrast: 20,
        saturation: 0,
        hueRotate: 0,
        sepia: 0,
        invert: 0,
        grayscale: 100,
      },
    },
    {
      name: 'Sepia',
      description: 'Warm brown tones',
      icon: '🟤',
      filters: {
        brightness: 0,
        contrast: 10,
        saturation: -30,
        hueRotate: 0,
        sepia: 100,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'High Contrast',
      description: 'Punchy, dramatic look',
      icon: '⚫',
      filters: {
        brightness: 0,
        contrast: 40,
        saturation: 20,
        hueRotate: 0,
        sepia: 0,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Soft Pastel',
      description: 'Gentle, muted colors',
      icon: '🎨',
      filters: {
        brightness: 15,
        contrast: -10,
        saturation: -30,
        hueRotate: 0,
        sepia: 10,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Neon',
      description: 'Bright, electric vibes',
      icon: '⚡',
      filters: {
        brightness: 10,
        contrast: 30,
        saturation: 60,
        hueRotate: 0,
        sepia: 0,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Cinematic',
      description: 'Movie-like color grading',
      icon: '🎬',
      filters: {
        brightness: -10,
        contrast: 15,
        saturation: -10,
        hueRotate: 0,
        sepia: 5,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Desert',
      description: 'Sand and earth tones',
      icon: '🏜️',
      filters: {
        brightness: 15,
        contrast: 10,
        saturation: 10,
        hueRotate: -20,
        sepia: 25,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Ocean',
      description: 'Water and sky blues',
      icon: '🌊',
      filters: {
        brightness: 10,
        contrast: 12,
        saturation: 20,
        hueRotate: 20,
        sepia: 0,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Moody',
      description: 'Dark and atmospheric',
      icon: '🌙',
      filters: {
        brightness: -20,
        contrast: 25,
        saturation: -20,
        hueRotate: 0,
        sepia: 10,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Fade',
      description: 'Faded, worn film',
      icon: '👻',
      filters: {
        brightness: 20,
        contrast: -15,
        saturation: -40,
        hueRotate: 0,
        sepia: 15,
        invert: 0,
        grayscale: 0,
      },
    },
    {
      name: 'Forest',
      description: 'Green and natural',
      icon: '🌲',
      filters: {
        brightness: -5,
        contrast: 10,
        saturation: 15,
        hueRotate: 30,
        sepia: 0,
        invert: 0,
        grayscale: 0,
      },
    },
  ];

  /**
   * Get all color grade presets
   */
  getAllPresets(): ColorGrade[] {
    return this.PRESETS;
  }

  /**
   * Get preset by name
   */
  getPreset(name: string): ColorGrade | undefined {
    return this.PRESETS.find((p) => p.name === name);
  }

  /**
   * Generate CSS filter string from color grade
   */
  generateFilterString(grade: ColorGrade): string {
    const filters: string[] = [];
    const f = grade.filters;

    // Brightness: -50 to 50 → 50% to 150%
    const brightness = 100 + f.brightness;
    filters.push(`brightness(${brightness}%)`);

    // Contrast: -50 to 50 → 50% to 150%
    const contrast = 100 + f.contrast;
    filters.push(`contrast(${contrast}%)`);

    // Saturation: -50 to 100 → 50% to 200%
    const saturation = 100 + f.saturation;
    filters.push(`saturate(${saturation}%)`);

    // Hue rotate: 0 to 360 degrees
    if (f.hueRotate !== 0) {
      filters.push(`hue-rotate(${f.hueRotate}deg)`);
    }

    // Sepia: 0 to 100
    if (f.sepia > 0) {
      filters.push(`sepia(${f.sepia}%)`);
    }

    // Invert: 0 to 100
    if (f.invert > 0) {
      filters.push(`invert(${f.invert}%)`);
    }

    // Grayscale: 0 to 100
    if (f.grayscale > 0) {
      filters.push(`grayscale(${f.grayscale}%)`);
    }

    return filters.join(' ');
  }

  /**
   * Get default (no color grading) preset
   */
  getDefault(): ColorGrade {
    return {
      name: 'Normal',
      description: 'No color grading',
      icon: '⭕',
      filters: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hueRotate: 0,
        sepia: 0,
        invert: 0,
        grayscale: 0,
      },
    };
  }

  /**
   * Blend two color grades
   */
  blendGrades(grade1: ColorGrade, grade2: ColorGrade, factor: number): ColorGrade {
    const factor2 = 1 - factor;
    return {
      name: `${grade1.name} + ${grade2.name}`,
      description: 'Blended grade',
      icon: '🎨',
      filters: {
        brightness: grade1.filters.brightness * factor2 + grade2.filters.brightness * factor,
        contrast: grade1.filters.contrast * factor2 + grade2.filters.contrast * factor,
        saturation: grade1.filters.saturation * factor2 + grade2.filters.saturation * factor,
        hueRotate: grade1.filters.hueRotate * factor2 + grade2.filters.hueRotate * factor,
        sepia: grade1.filters.sepia * factor2 + grade2.filters.sepia * factor,
        invert: grade1.filters.invert * factor2 + grade2.filters.invert * factor,
        grayscale: grade1.filters.grayscale * factor2 + grade2.filters.grayscale * factor,
      },
    };
  }

  /**
   * Get presets by category/mood
   */
  getByMood(mood: 'warm' | 'cool' | 'neutral' | 'artistic' | 'dramatic'): ColorGrade[] {
    const warmPresets = ['Warm', 'Vintage', 'Sepia', 'Desert', 'Forest'];
    const coolPresets = ['Cool', 'Ocean', 'High Contrast'];
    const neutralPresets = ['Normal', 'Vivid'];
    const artisticPresets = ['Soft Pastel', 'Neon', 'Fade'];
    const dramaticPresets = ['Moody', 'Cinematic', 'Black & White'];

    let names: string[] = [];
    switch (mood) {
      case 'warm':
        names = warmPresets;
        break;
      case 'cool':
        names = coolPresets;
        break;
      case 'neutral':
        names = neutralPresets;
        break;
      case 'artistic':
        names = artisticPresets;
        break;
      case 'dramatic':
        names = dramaticPresets;
        break;
    }

    return this.PRESETS.filter((p) => names.includes(p.name));
  }
}

let instance: ColorGradingService | null = null;

export const getColorGradingService = (): ColorGradingService => {
  if (!instance) {
    instance = new ColorGradingService();
  }
  return instance;
};

export default ColorGradingService;
