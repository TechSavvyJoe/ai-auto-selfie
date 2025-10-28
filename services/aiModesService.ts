/**
 * AI Modes Service
 * Provides 12 professional AI enhancement modes
 * Each mode has specific image processing priorities
 */

export interface AIMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'enhancement' | 'style' | 'specialty';
  settings: {
    brightness: number;
    contrast: number;
    saturation: number;
    sharpness: number;
    warmth: number; // -50 to 50
  };
}

class AiModesService {
  private readonly MODES: AIMode[] = [
    // ===== CORE ENHANCEMENT MODES (3) =====
    {
      id: 'professional',
      name: 'Professional',
      description: 'Business-focused with natural clarity',
      icon: '💼',
      category: 'enhancement',
      settings: {
        brightness: 5,
        contrast: 15,
        saturation: 10,
        sharpness: 20,
        warmth: 0,
      },
    },
    {
      id: 'natural',
      name: 'Natural',
      description: 'Preserve natural look with subtle enhancement',
      icon: '🌿',
      category: 'enhancement',
      settings: {
        brightness: 0,
        contrast: 5,
        saturation: 5,
        sharpness: 10,
        warmth: 0,
      },
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold and artistic interpretation',
      icon: '🎨',
      category: 'enhancement',
      settings: {
        brightness: 10,
        contrast: 25,
        saturation: 35,
        sharpness: 15,
        warmth: 5,
      },
    },

    // ===== STYLE MODES (4) =====
    {
      id: 'cinematic',
      name: 'Cinematic',
      description: 'Movie-like color grading and depth',
      icon: '🎬',
      category: 'style',
      settings: {
        brightness: -5,
        contrast: 20,
        saturation: 15,
        sharpness: 12,
        warmth: -5,
      },
    },
    {
      id: 'portrait',
      name: 'Portrait',
      description: 'Optimized for faces with skin smoothing',
      icon: '👤',
      category: 'style',
      settings: {
        brightness: 5,
        contrast: 8,
        saturation: 20,
        sharpness: -5, // Slight blur for flattering effect
        warmth: 10,
      },
    },
    {
      id: 'vivid',
      name: 'Vivid',
      description: 'High saturation and contrast for impact',
      icon: '🌈',
      category: 'style',
      settings: {
        brightness: 10,
        contrast: 30,
        saturation: 50,
        sharpness: 25,
        warmth: 0,
      },
    },
    {
      id: 'vintage',
      name: 'Vintage',
      description: 'Retro film aesthetic with warm tones',
      icon: '📽️',
      category: 'style',
      settings: {
        brightness: -10,
        contrast: 10,
        saturation: -15,
        sharpness: 5,
        warmth: 30,
      },
    },

    // ===== SPECIALTY MODES (5) =====
    {
      id: 'anime',
      name: 'Anime',
      description: 'Stylized anime/illustration look',
      icon: '🎌',
      category: 'specialty',
      settings: {
        brightness: 15,
        contrast: 40,
        saturation: 60,
        sharpness: 30,
        warmth: 0,
      },
    },
    {
      id: 'watercolor',
      name: 'Watercolor',
      description: 'Soft, artistic watercolor effect',
      icon: '🎨',
      category: 'specialty',
      settings: {
        brightness: 10,
        contrast: -15,
        saturation: 30,
        sharpness: -20,
        warmth: 15,
      },
    },
    {
      id: 'neon',
      name: 'Neon',
      description: 'Bright, electric neon aesthetic',
      icon: '⚡',
      category: 'specialty',
      settings: {
        brightness: 15,
        contrast: 35,
        saturation: 80,
        sharpness: 25,
        warmth: 0,
      },
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean, simple with reduced colors',
      icon: '⬜',
      category: 'specialty',
      settings: {
        brightness: 5,
        contrast: 12,
        saturation: -30,
        sharpness: 15,
        warmth: 0,
      },
    },
  ];

  /**
   * Get all AI modes
   */
  getAllModes(): AIMode[] {
    return this.MODES;
  }

  /**
   * Get mode by ID
   */
  getMode(id: string): AIMode | undefined {
    return this.MODES.find((m) => m.id === id);
  }

  /**
   * Get modes by category
   */
  getByCategory(category: AIMode['category']): AIMode[] {
    return this.MODES.filter((m) => m.category === category);
  }

  /**
   * Get recommended modes for a specific use case
   */
  getRecommended(useCase: 'selfie' | 'portrait' | 'landscape' | 'product' | 'creative'): AIMode[] {
    const recommendations: Record<string, string[]> = {
      selfie: ['portrait', 'vivid', 'professional', 'creative'],
      portrait: ['portrait', 'cinematic', 'natural', 'professional'],
      landscape: ['natural', 'vivid', 'creative', 'cinematic'],
      product: ['professional', 'vivid', 'minimal', 'natural'],
      creative: ['creative', 'anime', 'neon', 'watercolor'],
    };

    const modeIds = recommendations[useCase] || [];
    return modeIds.map((id) => this.getMode(id)).filter((m) => m !== undefined) as AIMode[];
  }

  /**
   * Get contrast between two modes (for comparison)
   */
  compare(mode1Id: string, mode2Id: string): { mode1: AIMode; mode2: AIMode; differences: string[] } | null {
    const mode1 = this.getMode(mode1Id);
    const mode2 = this.getMode(mode2Id);

    if (!mode1 || !mode2) return null;

    const differences: string[] = [];
    const s1 = mode1.settings;
    const s2 = mode2.settings;

    if (s1.brightness !== s2.brightness) differences.push('Brightness');
    if (s1.contrast !== s2.contrast) differences.push('Contrast');
    if (s1.saturation !== s2.saturation) differences.push('Saturation');
    if (s1.sharpness !== s2.sharpness) differences.push('Sharpness');
    if (s1.warmth !== s2.warmth) differences.push('Warmth');

    return { mode1, mode2, differences };
  }

  /**
   * Create a custom blend of two modes
   */
  blendModes(mode1Id: string, mode2Id: string, factor: number): AIMode {
    const mode1 = this.getMode(mode1Id);
    const mode2 = this.getMode(mode2Id);

    if (!mode1 || !mode2) {
      throw new Error('Invalid mode ID');
    }

    const factor2 = 1 - factor;
    return {
      id: `blend-${mode1Id}-${mode2Id}`,
      name: `${mode1.name} + ${mode2.name}`,
      description: `Blend of ${mode1.name} and ${mode2.name}`,
      icon: '🔀',
      category: 'enhancement',
      settings: {
        brightness: mode1.settings.brightness * factor2 + mode2.settings.brightness * factor,
        contrast: mode1.settings.contrast * factor2 + mode2.settings.contrast * factor,
        saturation: mode1.settings.saturation * factor2 + mode2.settings.saturation * factor,
        sharpness: mode1.settings.sharpness * factor2 + mode2.settings.sharpness * factor,
        warmth: mode1.settings.warmth * factor2 + mode2.settings.warmth * factor,
      },
    };
  }

  /**
   * Get mode categories with metadata
   */
  getCategories() {
    return [
      { id: 'enhancement', label: '🚀 Enhancement', description: 'Core enhancement modes' },
      { id: 'style', label: '🎨 Style', description: 'Artistic style modes' },
      { id: 'specialty', label: '⭐ Specialty', description: 'Special effect modes' },
    ];
  }

  /**
   * Search modes by name or description
   */
  search(query: string): AIMode[] {
    const lowercased = query.toLowerCase();
    return this.MODES.filter(
      (m) => m.name.toLowerCase().includes(lowercased) || m.description.toLowerCase().includes(lowercased)
    );
  }
}

let instance: AiModesService | null = null;

export const getAiModesService = (): AiModesService => {
  if (!instance) {
    instance = new AiModesService();
  }
  return instance;
};

export default AiModesService;
