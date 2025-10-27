/**
 * Auto-Enhance Service
 * Smart one-click image enhancement with multiple strategies
 */

import { ImageAdjustments, AIMode, EnhancementLevel } from '../types';

export type EnhanceStrategy = 'balanced' | 'vibrant' | 'professional' | 'cinematic' | 'portrait';

export interface AutoEnhanceResult {
  strategy: EnhanceStrategy;
  adjustments: ImageAdjustments;
  aiMode: AIMode;
  enhancementLevel: EnhancementLevel;
  confidence: number; // 0-100, how confident the auto-enhance is
  analysisDetails: {
    brightness: number; // -50 to 50
    contrast: number; // -50 to 50
    saturation: number; // -50 to 50
    colorTemp: number; // -50 to 50
    sharpness: number; // 0-10
  };
}

/**
 * Analyze image data to suggest optimal enhancements
 */
function analyzeImage(imageData: ImageData): AutoEnhanceResult['analysisDetails'] {
  const data = imageData.data;
  let r = 0, g = 0, b = 0;
  let min = 255, max = 0;
  let pixelCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    r += red;
    g += green;
    b += blue;
    min = Math.min(min, red, green, blue);
    max = Math.max(max, red, green, blue);
    pixelCount++;
  }

  // Calculate averages
  const avgR = r / pixelCount;
  const avgG = g / pixelCount;
  const avgB = b / pixelCount;

  // Brightness: average luminance (-50 to 50)
  const luminance = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114) / 255;
  const brightness = (luminance - 0.5) * 100; // Ideal is 0.5 (50% brightness)

  // Contrast: range between min and max
  const contrastLevel = (max - min) / 255;
  const contrast = (contrastLevel - 0.3) * 50; // Ideal is ~0.3 range

  // Saturation: color intensity
  const avgColor = (avgR + avgG + avgB) / 3;
  const avgColorDiff =
    (Math.abs(avgR - avgColor) + Math.abs(avgG - avgColor) + Math.abs(avgB - avgColor)) / 3;
  const saturation = (avgColorDiff / 255 - 0.3) * 100; // Ideal ~0.3 difference

  // Color temperature: red vs blue dominance
  const colorTemp = ((avgR - avgB) / 255) * 50; // Positive = warm, negative = cool

  // Sharpness: default to slight sharpening for clarity
  const sharpness = 2; // Default slight sharpen

  return {
    brightness: Math.max(-50, Math.min(50, brightness)),
    contrast: Math.max(-50, Math.min(50, contrast)),
    saturation: Math.max(-50, Math.min(50, saturation)),
    colorTemp: Math.max(-50, Math.min(50, colorTemp)),
    sharpness,
  };
}

/**
 * Apply balanced enhancement strategy
 */
function balancedStrategy(analysis: AutoEnhanceResult['analysisDetails']): AutoEnhanceResult {
  return {
    strategy: 'balanced',
    adjustments: {
      exposure: Math.max(-20, Math.min(20, -analysis.brightness * 0.3)),
      contrast: Math.max(-20, Math.min(20, -analysis.contrast * 0.4)),
      temperature: Math.max(-15, Math.min(15, -analysis.colorTemp * 0.2)),
      saturation: Math.max(-15, Math.min(15, -analysis.saturation * 0.3)),
      sharpen: analysis.sharpness,
    },
    aiMode: 'professional',
    enhancementLevel: 'moderate',
    confidence: 75,
    analysisDetails: analysis,
  };
}

/**
 * Apply vibrant enhancement strategy
 */
function vibrantStrategy(analysis: AutoEnhanceResult['analysisDetails']): AutoEnhanceResult {
  return {
    strategy: 'vibrant',
    adjustments: {
      exposure: Math.max(-10, Math.min(15, -analysis.brightness * 0.2)),
      contrast: Math.max(5, Math.min(25, -analysis.contrast * 0.6)),
      temperature: Math.max(-10, Math.min(20, -analysis.colorTemp * 0.3)),
      saturation: Math.max(10, Math.min(30, -analysis.saturation * 0.5)),
      sharpen: analysis.sharpness + 1,
    },
    aiMode: 'creative',
    enhancementLevel: 'dramatic',
    confidence: 70,
    analysisDetails: analysis,
  };
}

/**
 * Apply professional enhancement strategy
 */
function professionalStrategy(analysis: AutoEnhanceResult['analysisDetails']): AutoEnhanceResult {
  return {
    strategy: 'professional',
    adjustments: {
      exposure: Math.max(-15, Math.min(15, -analysis.brightness * 0.25)),
      contrast: Math.max(0, Math.min(20, -analysis.contrast * 0.5)),
      temperature: Math.max(-5, Math.min(10, -analysis.colorTemp * 0.15)),
      saturation: Math.max(-5, Math.min(10, -analysis.saturation * 0.2)),
      sharpen: analysis.sharpness + 2,
    },
    aiMode: 'professional',
    enhancementLevel: 'subtle',
    confidence: 80,
    analysisDetails: analysis,
  };
}

/**
 * Apply cinematic enhancement strategy
 */
function cinematicStrategy(analysis: AutoEnhanceResult['analysisDetails']): AutoEnhanceResult {
  return {
    strategy: 'cinematic',
    adjustments: {
      exposure: Math.max(-10, Math.min(20, -analysis.brightness * 0.2)),
      contrast: Math.max(10, Math.min(30, -analysis.contrast * 0.7)),
      temperature: Math.max(-20, Math.min(0, -analysis.colorTemp * 0.4)),
      saturation: Math.max(-10, Math.min(15, -analysis.saturation * 0.3)),
      sharpen: analysis.sharpness + 1,
    },
    aiMode: 'cinematic',
    enhancementLevel: 'dramatic',
    confidence: 72,
    analysisDetails: analysis,
  };
}

/**
 * Apply portrait enhancement strategy
 */
function portraitStrategy(analysis: AutoEnhanceResult['analysisDetails']): AutoEnhanceResult {
  return {
    strategy: 'portrait',
    adjustments: {
      exposure: Math.max(-5, Math.min(15, -analysis.brightness * 0.2)),
      contrast: Math.max(5, Math.min(15, -analysis.contrast * 0.3)),
      temperature: Math.max(0, Math.min(15, -analysis.colorTemp * 0.2)), // Slightly warmer for skin
      saturation: Math.max(5, Math.min(20, -analysis.saturation * 0.4)),
      sharpen: analysis.sharpness + 2, // More sharpening for detail
    },
    aiMode: 'portrait',
    enhancementLevel: 'moderate',
    confidence: 78,
    analysisDetails: analysis,
  };
}

/**
 * Load image and analyze for auto-enhance
 */
async function loadAndAnalyzeImage(
  imageSrc: string
): Promise<AutoEnhanceResult['analysisDetails']> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const analysis = analyzeImage(imageData);
      resolve(analysis);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}

/**
 * Auto-enhance image with specified strategy
 */
export async function autoEnhance(
  imageSrc: string,
  strategy?: EnhanceStrategy
): Promise<AutoEnhanceResult> {
  try {
    const analysis = await loadAndAnalyzeImage(imageSrc);

    let result: AutoEnhanceResult;

    switch (strategy || 'balanced') {
      case 'vibrant':
        result = vibrantStrategy(analysis);
        break;
      case 'professional':
        result = professionalStrategy(analysis);
        break;
      case 'cinematic':
        result = cinematicStrategy(analysis);
        break;
      case 'portrait':
        result = portraitStrategy(analysis);
        break;
      case 'balanced':
      default:
        result = balancedStrategy(analysis);
        break;
    }

    return result;
  } catch (error) {
    console.error('Auto-enhance failed:', error);
    // Return default balanced enhancement
    return {
      strategy: 'balanced',
      adjustments: {
        exposure: 0,
        contrast: 5,
        temperature: 0,
        saturation: 5,
        sharpen: 1,
      },
      aiMode: 'professional',
      enhancementLevel: 'moderate',
      confidence: 0,
      analysisDetails: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        colorTemp: 0,
        sharpness: 1,
      },
    };
  }
}

/**
 * Get all available enhancement strategies
 */
export const enhanceStrategies: Array<{
  id: EnhanceStrategy;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Natural, subtle enhancements',
    icon: '⚖️',
  },
  {
    id: 'vibrant',
    label: 'Vibrant',
    description: 'Bold colors and contrast',
    icon: '✨',
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Studio-quality look',
    icon: '👔',
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    description: 'Movie-like atmosphere',
    icon: '🎬',
  },
  {
    id: 'portrait',
    label: 'Portrait',
    description: 'Optimized for faces',
    icon: '👤',
  },
];

/**
 * Get enhancement strategy recommendation based on image analysis
 */
export async function recommendStrategy(imageSrc: string): Promise<EnhanceStrategy> {
  try {
    const analysis = await loadAndAnalyzeImage(imageSrc);

    // If image is a portrait (high saturation, warm colors), recommend portrait mode
    if (Math.abs(analysis.colorTemp) < 10 && analysis.saturation > 5) {
      return 'portrait';
    }

    // If low contrast, recommend vibrant
    if (analysis.contrast < -10) {
      return 'vibrant';
    }

    // If very bright or dark, recommend professional
    if (Math.abs(analysis.brightness) > 20) {
      return 'professional';
    }

    // Default to balanced
    return 'balanced';
  } catch (error) {
    return 'balanced';
  }
}
