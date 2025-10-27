/**
 * Image Editing and Filters Service
 * Advanced image manipulation capabilities including filters, adjustments, and effects
 */

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // 0 to 360
  blur: number; // 0 to 20
  sharpen: number; // 0 to 10
  temperature: number; // -50 to 50 (warm/cool)
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
}

export interface FilterPreset {
  name: string;
  label: string;
  adjustments: Partial<ImageAdjustments>;
  category: 'professional' | 'vibrant' | 'vintage' | 'creative';
}

/**
 * Default/neutral adjustments
 */
export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sharpen: 0,
  temperature: 0,
  highlights: 0,
  shadows: 0,
};

/**
 * Professional filter presets optimized for car photography
 */
export const FILTER_PRESETS: FilterPreset[] = [
  {
    name: 'original',
    label: 'Original',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    category: 'professional',
  },
  {
    name: 'cinematic',
    label: 'Cinematic',
    adjustments: {
      contrast: 15,
      saturation: 10,
      temperature: -10,
      shadows: 10,
      highlights: -5,
    },
    category: 'professional',
  },
  {
    name: 'vibrant',
    label: 'Vibrant',
    adjustments: {
      saturation: 25,
      contrast: 10,
      brightness: 5,
      sharpen: 2,
    },
    category: 'vibrant',
  },
  {
    name: 'luxury',
    label: 'Luxury',
    adjustments: {
      contrast: 20,
      saturation: 5,
      temperature: 15,
      highlights: -10,
      shadows: 15,
      sharpen: 3,
    },
    category: 'professional',
  },
  {
    name: 'vintage',
    label: 'Vintage',
    adjustments: {
      saturation: -15,
      temperature: 20,
      brightness: 5,
      contrast: -5,
    },
    category: 'vintage',
  },
  {
    name: 'portrait',
    label: 'Portrait',
    adjustments: {
      saturation: -5,
      temperature: 10,
      blur: 0.5,
      highlights: -8,
      sharpen: 1,
    },
    category: 'professional',
  },
  {
    name: 'bold',
    label: 'Bold',
    adjustments: {
      saturation: 30,
      contrast: 25,
      sharpen: 4,
      shadows: 5,
    },
    category: 'vibrant',
  },
  {
    name: 'soft',
    label: 'Soft',
    adjustments: {
      brightness: 8,
      contrast: -10,
      saturation: -5,
      blur: 0.3,
    },
    category: 'creative',
  },
];

/**
 * Build CSS filter string from adjustments
 */
export const buildFilterString = (adjustments: ImageAdjustments): string => {
  const filters: string[] = [];

  // Brightness (0% = black, 100% = normal, 200% = double bright)
  if (adjustments.brightness !== 0) {
    const value = 100 + adjustments.brightness;
    filters.push(`brightness(${Math.max(0, value)}%)`);
  }

  // Contrast (0% = gray, 100% = normal, 200% = double contrast)
  if (adjustments.contrast !== 0) {
    const value = 100 + adjustments.contrast;
    filters.push(`contrast(${Math.max(0, value)}%)`);
  }

  // Saturation (0% = gray, 100% = normal, 200% = double saturation)
  if (adjustments.saturation !== 0) {
    const value = 100 + adjustments.saturation;
    filters.push(`saturate(${Math.max(0, value)}%)`);
  }

  // Hue rotation (0 = no change, 360 = full rotation)
  if (adjustments.hue !== 0) {
    filters.push(`hue-rotate(${adjustments.hue}deg)`);
  }

  // Blur (in pixels)
  if (adjustments.blur !== 0) {
    filters.push(`blur(${Math.max(0, adjustments.blur)}px)`);
  }

  // Sharpen (using contrast + slight blur inverse)
  if (adjustments.sharpen !== 0) {
    // Sharpen is achieved through contrast increase
    filters.push(`contrast(${100 + adjustments.sharpen * 5}%)`);
  }

  // Temperature (color adjustment - warm/cool)
  if (adjustments.temperature !== 0) {
    // Positive = warm (more orange), negative = cool (more blue)
    if (adjustments.temperature > 0) {
      filters.push(`sepia(${Math.min(30, adjustments.temperature / 2)}%)`);
    } else {
      filters.push(`hue-rotate(${Math.max(-20, adjustments.temperature / 2)}deg)`);
    }
  }

  // Highlights (reduce saturation in bright areas)
  if (adjustments.highlights !== 0) {
    // This is a pseudo-effect through contrast adjustment
    filters.push(`contrast(${100 + adjustments.highlights / 5}%)`);
  }

  // Shadows (increase contrast in dark areas)
  if (adjustments.shadows !== 0) {
    filters.push(`contrast(${100 + adjustments.shadows / 10}%)`);
  }

  return filters.join(' ');
};

/**
 * Apply adjustments to canvas
 */
export const applyImageAdjustments = async (
  imageData: ImageData,
  adjustments: ImageAdjustments
): Promise<ImageData> => {
  const data = imageData.data;
  const length = data.length;

  // Apply brightness and contrast adjustments at pixel level
  const brightness = adjustments.brightness / 100;
  const contrast = (adjustments.contrast + 100) / 100;
  const saturation = (adjustments.saturation + 100) / 100;
  const hue = adjustments.hue;

  for (let i = 0; i < length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    // Apply brightness
    r += brightness * 255;
    g += brightness * 255;
    b += brightness * 255;

    // Apply contrast
    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;

    // Clamp values to 0-255
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
    data[i + 3] = a;
  }

  return imageData;
};

/**
 * Convert image to canvas and apply CSS filters
 */
export const applyFiltersToImage = (
  imageUrl: string,
  adjustments: ImageAdjustments
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Apply CSS filters by drawing to canvas
      ctx.filter = buildFilterString(adjustments);
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * Blend two images at specified opacity
 */
export const blendImages = (
  baseImage: string,
  overlayImage: string,
  opacity: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let loadedCount = 0;
    let baseImg: HTMLImageElement;
    let overlayImg: HTMLImageElement;

    const tryBlend = () => {
      loadedCount++;
      if (loadedCount === 2) {
        performBlend();
      }
    };

    const performBlend = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = baseImg.width;
      canvas.height = baseImg.height;

      ctx.drawImage(baseImg, 0, 0);
      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
      ctx.drawImage(overlayImg, 0, 0);

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };

    baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.onload = tryBlend;
    baseImg.onerror = () => reject(new Error('Failed to load base image'));
    baseImg.src = baseImage;

    overlayImg = new Image();
    overlayImg.crossOrigin = 'anonymous';
    overlayImg.onload = tryBlend;
    overlayImg.onerror = () => reject(new Error('Failed to load overlay image'));
    overlayImg.src = overlayImage;
  });
};

/**
 * Get filter preset by name
 */
export const getFilterPreset = (name: string): FilterPreset | undefined => {
  return FILTER_PRESETS.find((preset) => preset.name === name);
};

/**
 * Get all presets for a category
 */
export const getPresetsByCategory = (category: string): FilterPreset[] => {
  return FILTER_PRESETS.filter((preset) => preset.category === category);
};

/**
 * Merge adjustments (for layering effects)
 */
export const mergeAdjustments = (
  base: ImageAdjustments,
  overlay: Partial<ImageAdjustments>
): ImageAdjustments => {
  return {
    ...base,
    ...overlay,
  };
};
