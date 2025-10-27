import { ImageAdjustments } from '../types';

/**
 * Service for applying real-time image adjustments
 * Uses Canvas 2D API to apply filters without AI processing
 */

interface AdjustmentWorkerTask {
  imageData: ImageData;
  adjustments: ImageAdjustments;
}

/**
 * Apply exposure adjustment to image data
 * Exposure increases/decreases overall brightness
 */
function applyExposure(imageData: ImageData, value: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = 1 + (value / 100); // -50 to 50 → 0.5 to 1.5

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * factor);     // R
    data[i + 1] = Math.min(255, data[i + 1] * factor); // G
    data[i + 2] = Math.min(255, data[i + 2] * factor); // B
    // A (alpha) unchanged
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply contrast adjustment
 * Increases/decreases the difference between light and dark areas
 */
function applyContrast(imageData: ImageData, value: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = (259 * (value + 255)) / (255 * (259 - value));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply temperature (color temperature) adjustment
 * Negative values = cooler (more blue), positive = warmer (more yellow/red)
 */
function applyTemperature(imageData: ImageData, value: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = value / 100;

  for (let i = 0; i < data.length; i += 4) {
    if (factor > 0) {
      // Warm (add red/yellow)
      data[i] = Math.min(255, data[i] * (1 + factor * 0.3));        // R boost
      data[i + 1] = Math.min(255, data[i + 1] * (1 + factor * 0.1)); // G slight boost
    } else {
      // Cool (add blue)
      data[i + 2] = Math.min(255, data[i + 2] * (1 - factor * 0.3)); // B boost
      data[i + 1] = Math.min(255, data[i + 1] * (1 - factor * 0.1)); // G reduce
    }
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply saturation adjustment
 * Increases/decreases color intensity
 */
function applySaturation(imageData: ImageData, value: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = 1 + (value / 100); // -50 to 50 → 0.5 to 1.5

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convert RGB to HSL to adjust saturation
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const l = (max + min) / 2;

    if (max === min) {
      // Gray, no saturation change
      continue;
    }

    const s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
    const newS = Math.min(1, s * factor);

    const c = (1 - Math.abs(2 * l - 1)) * newS;
    const x = c * (1 - Math.abs(((r / 255 - min) / (max - min)) % 2 - 1));
    const m = l - c / 2;

    let newR = 0, newG = 0, newB = 0;

    if (max === r / 255) {
      newR = c;
      newG = x;
    } else if (max === g / 255) {
      newR = x;
      newG = c;
    } else {
      newG = x;
      newB = c;
    }

    data[i] = Math.round((newR + m) * 255);
    data[i + 1] = Math.round((newG + m) * 255);
    data[i + 2] = Math.round((newB + m) * 255);
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Apply sharpen filter
 * Increases edge definition and detail
 */
function applySharpen(imageData: ImageData, value: number): ImageData {
  if (value === 0) return imageData;

  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const kernel = [
    0, -1, 0,
    -1, 4 + value, -1,
    0, -1, 0
  ];

  const result = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let kernelIndex = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[pixelIndex] * kernel[kernelIndex];
            kernelIndex++;
          }
        }

        const pixelIndex = (y * width + x) * 4 + c;
        result[pixelIndex] = Math.min(255, Math.max(0, sum / (4 + value)));
      }
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Apply all adjustments to image data in sequence
 */
export function applyAdjustments(
  imageData: ImageData,
  adjustments: ImageAdjustments
): ImageData {
  let result = imageData;

  if (adjustments.exposure !== 0) {
    result = applyExposure(result, adjustments.exposure);
  }

  if (adjustments.contrast !== 0) {
    result = applyContrast(result, adjustments.contrast);
  }

  if (adjustments.temperature !== 0) {
    result = applyTemperature(result, adjustments.temperature);
  }

  if (adjustments.saturation !== 0) {
    result = applySaturation(result, adjustments.saturation);
  }

  if (adjustments.sharpen !== 0) {
    result = applySharpen(result, adjustments.sharpen);
  }

  return result;
}

/**
 * Load an image from URL/data-url and return as ImageData
 */
export async function loadImageAsImageData(imageSrc: string): Promise<ImageData> {
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
      resolve(imageData);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}

/**
 * Convert ImageData back to data URL for preview
 */
export function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Apply adjustments to image and return as data URL
 */
export async function applyAdjustmentsToImage(
  imageSrc: string,
  adjustments: ImageAdjustments
): Promise<string> {
  try {
    const imageData = await loadImageAsImageData(imageSrc);
    const adjusted = applyAdjustments(imageData, adjustments);
    return imageDataToDataUrl(adjusted);
  } catch (error) {
    console.error('Failed to apply adjustments:', error);
    throw error;
  }
}

/**
 * Create a debounced version of adjustment application
 * Useful for real-time preview to avoid processing every frame
 */
export function createAdjustmentPreviewGenerator(imageSrc: string) {
  let lastImageData: ImageData | null = null;
  let loadingPromise: Promise<ImageData> | null = null;

  return async (adjustments: ImageAdjustments): Promise<string> => {
    // Load image once on first call
    if (!lastImageData && !loadingPromise) {
      loadingPromise = loadImageAsImageData(imageSrc);
      lastImageData = await loadingPromise;
      loadingPromise = null;
    } else if (loadingPromise) {
      lastImageData = await loadingPromise;
      loadingPromise = null;
    }

    if (!lastImageData) {
      throw new Error('Failed to load image');
    }

    const adjusted = applyAdjustments(lastImageData, adjustments);
    return imageDataToDataUrl(adjusted);
  };
}
