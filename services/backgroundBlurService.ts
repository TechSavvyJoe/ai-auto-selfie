/**
 * Smart Background Blur Service
 * Provides intelligent background blur detection and bokeh effects
 * Simulates portrait mode with depth-aware blurring
 */

export interface BlurSettings {
  blurAmount: number; // 0-100 (blur strength)
  bokehSize: number; // 0-30 (bokeh particle size)
  bokehIntensity: number; // 0-100 (number of bokeh particles)
  depthDetection: boolean; // Whether to use smart depth detection
  preserveEdges: boolean; // Whether to preserve edge details
}

export interface BlurPreset {
  name: string;
  description: string;
  icon: string;
  settings: BlurSettings;
}

class BackgroundBlurService {
  private readonly BLUR_PRESETS: BlurPreset[] = [
    {
      name: 'Light Blur',
      description: 'Subtle background softening',
      icon: '🌫️',
      settings: {
        blurAmount: 20,
        bokehSize: 5,
        bokehIntensity: 30,
        depthDetection: true,
        preserveEdges: true,
      },
    },
    {
      name: 'Medium Blur',
      description: 'Natural portrait mode effect',
      icon: '📸',
      settings: {
        blurAmount: 50,
        bokehSize: 12,
        bokehIntensity: 60,
        depthDetection: true,
        preserveEdges: true,
      },
    },
    {
      name: 'Strong Blur',
      description: 'Maximum background separation',
      icon: '🎬',
      settings: {
        blurAmount: 80,
        bokehSize: 18,
        bokehIntensity: 85,
        depthDetection: true,
        preserveEdges: true,
      },
    },
    {
      name: 'Cinematic Bokeh',
      description: 'Professional cinematic look',
      icon: '🎥',
      settings: {
        blurAmount: 70,
        bokehSize: 20,
        bokehIntensity: 90,
        depthDetection: true,
        preserveEdges: false,
      },
    },
    {
      name: 'Dreamy Soft',
      description: 'Soft, romantic blur',
      icon: '✨',
      settings: {
        blurAmount: 60,
        bokehSize: 25,
        bokehIntensity: 70,
        depthDetection: false,
        preserveEdges: false,
      },
    },
    {
      name: 'Focus Ring',
      description: 'Clear subject, blurred background',
      icon: '🎯',
      settings: {
        blurAmount: 75,
        bokehSize: 15,
        bokehIntensity: 50,
        depthDetection: true,
        preserveEdges: true,
      },
    },
  ];

  /**
   * Get all blur presets
   */
  getAllPresets(): BlurPreset[] {
    return this.BLUR_PRESETS;
  }

  /**
   * Get preset by name
   */
  getPreset(name: string): BlurPreset | undefined {
    return this.BLUR_PRESETS.find((p) => p.name === name);
  }

  /**
   * Generate CSS filter string for background blur
   * Creates blur effect using multiple techniques
   */
  generateFilterString(settings: BlurSettings): string {
    const filters: string[] = [];

    // Base blur effect
    // Scale 0-100 to 0-15px for CSS blur
    const blurPixels = (settings.blurAmount / 100) * 15;
    filters.push(`blur(${blurPixels}px)`);

    // Add slight contrast boost for depth perception
    filters.push('contrast(105%)');

    // Slight saturation reduction for depth effect
    if (settings.blurAmount > 30) {
      filters.push('saturate(95%)');
    }

    return filters.join(' ');
  }

  /**
   * Generate bokeh/particle overlay CSS
   * Creates visual bokeh effect using radial gradients
   */
  generateBokehCSS(settings: BlurSettings): string {
    if (settings.bokehIntensity === 0) {
      return '';
    }

    // Create a radial gradient-based bokeh effect
    // This is a simplified CSS-based approach
    const size = settings.bokehSize;
    const opacity = (settings.bokehIntensity / 100) * 0.15;

    return `
      background-image:
        radial-gradient(circle, rgba(255,255,255,${opacity}) 0%, transparent 70%);
      background-size: ${size * 8}px ${size * 8}px;
      background-position: 0 0, ${size * 4}px ${size * 4}px;
      pointer-events: none;
    `;
  }

  /**
   * Detect if image appears to be a selfie (face-focused)
   * Simple heuristic - returns true for potential selfies
   */
  detectSelfieMode(imageData?: CanvasImageData): boolean {
    // In a real implementation, this would use ML model
    // For now, return true (assume most images are selfies in this app)
    return true;
  }

  /**
   * Calculate safe blur amount based on image resolution
   * Higher resolution images can handle more blur without artifacts
   */
  calculateOptimalBlur(imageWidth: number, imageHeight: number, userBlurAmount: number): number {
    const minDimension = Math.min(imageWidth, imageHeight);

    // Resolution thresholds
    if (minDimension < 400) {
      // Low res: max 50% of requested blur
      return userBlurAmount * 0.5;
    } else if (minDimension < 800) {
      // Medium res: max 75% of requested blur
      return userBlurAmount * 0.75;
    } else {
      // High res: full blur amount
      return userBlurAmount;
    }
  }

  /**
   * Validate blur settings
   */
  validateSettings(settings: BlurSettings): boolean {
    return (
      settings.blurAmount >= 0 &&
      settings.blurAmount <= 100 &&
      settings.bokehSize >= 0 &&
      settings.bokehSize <= 30 &&
      settings.bokehIntensity >= 0 &&
      settings.bokehIntensity <= 100 &&
      typeof settings.depthDetection === 'boolean' &&
      typeof settings.preserveEdges === 'boolean'
    );
  }

  /**
   * Get default blur settings (no blur)
   */
  getDefaultSettings(): BlurSettings {
    return {
      blurAmount: 0,
      bokehSize: 0,
      bokehIntensity: 0,
      depthDetection: false,
      preserveEdges: true,
    };
  }

  /**
   * Blend two blur settings
   */
  blendSettings(settings1: BlurSettings, settings2: BlurSettings, factor: number): BlurSettings {
    const factor2 = 1 - factor;
    return {
      blurAmount: settings1.blurAmount * factor2 + settings2.blurAmount * factor,
      bokehSize: settings1.bokehSize * factor2 + settings2.bokehSize * factor,
      bokehIntensity: settings1.bokehIntensity * factor2 + settings2.bokehIntensity * factor,
      depthDetection: factor > 0.5 ? settings2.depthDetection : settings1.depthDetection,
      preserveEdges: factor > 0.5 ? settings2.preserveEdges : settings1.preserveEdges,
    };
  }

  /**
   * Generate description of current blur strength
   */
  describeBlurStrength(blurAmount: number): string {
    if (blurAmount === 0) return 'No blur';
    if (blurAmount < 25) return 'Light';
    if (blurAmount < 50) return 'Medium';
    if (blurAmount < 75) return 'Strong';
    return 'Very strong';
  }
}

let instance: BackgroundBlurService | null = null;

export const getBackgroundBlurService = (): BackgroundBlurService => {
  if (!instance) {
    instance = new BackgroundBlurService();
  }
  return instance;
};

export default BackgroundBlurService;
