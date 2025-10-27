/**
 * Advanced Effects Library
 * High-quality image effects beyond basic adjustments
 */

import { imageDataToDataUrl } from './adjustmentService';

export type EffectName =
  | 'sepia'
  | 'grayscale'
  | 'vintage'
  | 'blur'
  | 'vignette'
  | 'mosaic'
  | 'emboss'
  | 'sketch'
  | 'cool'
  | 'warm'
  | 'retro'
  | 'noir';

export interface EffectConfig {
  intensity: number; // 0-100
}

/**
 * Apply sepia tone effect
 */
function applySepia(imageData: ImageData, intensity: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = r * 0.299 + g * 0.587 + b * 0.114;

    data[i] = Math.min(255, gray + 100 * factor);
    data[i + 1] = gray + 50 * factor;
    data[i + 2] = gray - 100 * factor;
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply grayscale effect
 */
function applyGrayscale(imageData: ImageData, intensity: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = r * 0.299 + g * 0.587 + b * 0.114;

    data[i] = Math.round(r + (gray - r) * factor);
    data[i + 1] = Math.round(g + (gray - g) * factor);
    data[i + 2] = Math.round(b + (gray - b) * factor);
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply vintage film effect
 */
function applyVintage(imageData: ImageData, intensity: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    // Fade colors
    data[i] = Math.min(255, data[i] + 30 * factor);
    data[i + 1] = Math.min(255, data[i + 1] + 15 * factor);
    data[i + 2] = Math.max(0, data[i + 2] - 20 * factor);

    // Reduce contrast
    if (i % 100 === 0) {
      const noise = (Math.random() - 0.5) * 10 * factor;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
    }
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply vignette effect
 */
function applyVignette(imageData: ImageData, intensity: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const factor = intensity / 100;

  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const vignette = 1 - (distance / maxDistance) * factor;

      const idx = (y * width + x) * 4;
      data[idx] = Math.round(data[idx] * Math.max(0.3, vignette));
      data[idx + 1] = Math.round(data[idx + 1] * Math.max(0.3, vignette));
      data[idx + 2] = Math.round(data[idx + 2] * Math.max(0.3, vignette));
    }
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply mosaic/pixelate effect
 */
function applyMosaic(imageData: ImageData, intensity: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const blockSize = Math.max(1, Math.round((intensity / 100) * 20));

  for (let y = 0; y < imageData.height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      let r = 0, g = 0, b = 0, count = 0;

      // Calculate average color in block
      for (let by = 0; by < blockSize; by++) {
        for (let bx = 0; bx < blockSize; bx++) {
          const yy = Math.min(y + by, imageData.height - 1);
          const xx = Math.min(x + bx, width - 1);
          const idx = (yy * width + xx) * 4;

          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          count++;
        }
      }

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      // Apply average color to block
      for (let by = 0; by < blockSize; by++) {
        for (let bx = 0; bx < blockSize; bx++) {
          const yy = Math.min(y + by, imageData.height - 1);
          const xx = Math.min(x + bx, width - 1);
          const idx = (yy * width + xx) * 4;

          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }
    }
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply emboss effect
 */
function applyEmboss(imageData: ImageData, intensity: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
  const factor = intensity / 50;

  const result = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let kernelIdx = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = (y + ky) * width + (x + kx);
            sum += data[px * 4 + c] * kernel[kernelIdx];
            kernelIdx++;
          }
        }

        const idx = (y * width + x) * 4 + c;
        result[idx] = Math.max(0, Math.min(255, 128 + sum * factor));
      }
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Apply noir/black & white effect
 */
function applyNoir(imageData: ImageData, intensity: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let gray = r * 0.299 + g * 0.587 + b * 0.114;

    // Increase contrast
    gray = gray < 128 ? gray * (1 - factor * 0.5) : gray + (255 - gray) * factor * 0.5;

    data[i] = Math.round(gray);
    data[i + 1] = Math.round(gray);
    data[i + 2] = Math.round(gray);
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply cool tone effect
 */
function applyCool(imageData: ImageData, intensity: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, data[i] - 20 * factor);      // Reduce red
    data[i + 1] = Math.min(255, data[i + 1] + 10 * factor); // Boost green
    data[i + 2] = Math.min(255, data[i + 2] + 30 * factor); // Boost blue
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply warm tone effect
 */
function applyWarm(imageData: ImageData, intensity: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] + 30 * factor);      // Boost red
    data[i + 1] = Math.min(255, data[i + 1] + 15 * factor); // Boost green
    data[i + 2] = Math.max(0, data[i + 2] - 20 * factor);   // Reduce blue
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply sketch effect
 */
function applySketch(imageData: ImageData, intensity: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const factor = intensity / 100;

  // Simple edge detection
  const edges = new Uint8ClampedArray(data.length);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      let gx = 0, gy = 0;
      for (let c = 0; c < 3; c++) {
        const a = data[((y - 1) * width + (x - 1)) * 4 + c];
        const b = data[((y - 1) * width + x) * 4 + c];
        const c1 = data[((y - 1) * width + (x + 1)) * 4 + c];
        const d = data[(y * width + (x - 1)) * 4 + c];
        const f = data[(y * width + (x + 1)) * 4 + c];
        const g = data[((y + 1) * width + (x - 1)) * 4 + c];
        const h = data[((y + 1) * width + x) * 4 + c];
        const i = data[((y + 1) * width + (x + 1)) * 4 + c];

        gx += -a + c1 - 2 * d + 2 * f - g + i;
        gy += -a - 2 * b - c1 + g + 2 * h + i;
      }

      const edge = Math.sqrt(gx * gx + gy * gy);
      const value = 255 - Math.min(255, edge * factor);

      edges[idx] = value;
      edges[idx + 1] = value;
      edges[idx + 2] = value;
      edges[idx + 3] = data[idx + 3];
    }
  }

  return new ImageData(edges, width, height);
}

/**
 * Apply retro effect
 */
function applyRetro(imageData: ImageData, intensity: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = intensity / 100;

  // Reduce color palette and add vintage look
  const posterizeLevels = Math.max(2, Math.round(8 * (1 - factor * 0.5)));

  for (let i = 0; i < data.length; i += 4) {
    const step = 256 / posterizeLevels;

    data[i] = Math.round(data[i] / step) * step + 20 * factor;
    data[i + 1] = Math.round(data[i + 1] / step) * step + 10 * factor;
    data[i + 2] = Math.round(data[i + 2] / step) * step;

    // Clamp values
    data[i] = Math.min(255, Math.max(0, data[i]));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Get effect configuration with defaults
 */
function getEffectConfig(intensity?: number): EffectConfig {
  return {
    intensity: intensity ?? 50,
  };
}

/**
 * Apply effect to image
 */
export async function applyEffect(
  imageSrc: string,
  effectName: EffectName,
  config: Partial<EffectConfig> = {}
): Promise<string> {
  const finalConfig = { ...getEffectConfig(), ...config };

  // Load image as ImageData
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

      let result: ImageData;

      switch (effectName) {
        case 'sepia':
          result = applySepia(imageData, finalConfig.intensity);
          break;
        case 'grayscale':
          result = applyGrayscale(imageData, finalConfig.intensity);
          break;
        case 'vintage':
          result = applyVintage(imageData, finalConfig.intensity);
          break;
        case 'blur':
          result = applyMosaic(imageData, finalConfig.intensity);
          break;
        case 'vignette':
          result = applyVignette(imageData, finalConfig.intensity);
          break;
        case 'mosaic':
          result = applyMosaic(imageData, finalConfig.intensity);
          break;
        case 'emboss':
          result = applyEmboss(imageData, finalConfig.intensity);
          break;
        case 'sketch':
          result = applySketch(imageData, finalConfig.intensity);
          break;
        case 'cool':
          result = applyCool(imageData, finalConfig.intensity);
          break;
        case 'warm':
          result = applyWarm(imageData, finalConfig.intensity);
          break;
        case 'noir':
          result = applyNoir(imageData, finalConfig.intensity);
          break;
        case 'retro':
          result = applyRetro(imageData, finalConfig.intensity);
          break;
        default:
          result = imageData;
      }

      try {
        const dataUrl = imageDataToDataUrl(result);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}

/**
 * Get list of all available effects with descriptions
 */
export const effectsLibrary = [
  { name: 'sepia' as EffectName, label: 'Sepia', description: 'Classic sepia tone' },
  { name: 'grayscale' as EffectName, label: 'Grayscale', description: 'Black and white' },
  { name: 'vintage' as EffectName, label: 'Vintage', description: 'Faded vintage look' },
  { name: 'cool' as EffectName, label: 'Cool', description: 'Cool blue tones' },
  { name: 'warm' as EffectName, label: 'Warm', description: 'Warm orange tones' },
  { name: 'noir' as EffectName, label: 'Noir', description: 'High contrast B&W' },
  { name: 'retro' as EffectName, label: 'Retro', description: '80s posterized look' },
  { name: 'vignette' as EffectName, label: 'Vignette', description: 'Darkened edges' },
  { name: 'emboss' as EffectName, label: 'Emboss', description: '3D emboss effect' },
  { name: 'sketch' as EffectName, label: 'Sketch', description: 'Pencil sketch' },
  { name: 'mosaic' as EffectName, label: 'Mosaic', description: 'Pixelated effect' },
];
