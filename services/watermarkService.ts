/**
 * Watermarking Service
 * Add dealership branding to images automatically
 * Position, sizing, opacity controls
 */

export interface WatermarkConfig {
  imageUrl?: string; // Logo image
  text?: string; // Text watermark
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size: number; // 0-100 (percentage of image)
  opacity: number; // 0-1
  padding: number; // pixels from edge
  rotation?: number; // degrees
  format?: 'contain' | 'cover' | 'fill';
}

export const DEFAULT_WATERMARK: WatermarkConfig = {
  position: 'bottom-right',
  size: 20,
  opacity: 0.8,
  padding: 20,
  format: 'contain',
};

/**
 * Apply watermark to image
 */
export const applyWatermark = async (
  sourceImageUrl: string,
  config: WatermarkConfig
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const sourceImg = new Image();
    sourceImg.crossOrigin = 'anonymous';

    sourceImg.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = sourceImg.width;
      canvas.height = sourceImg.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw source image
      ctx.drawImage(sourceImg, 0, 0);

      // Save current state
      ctx.save();
      ctx.globalAlpha = config.opacity;

      if (config.imageUrl) {
        // Draw image watermark
        const watermarkImg = new Image();
        watermarkImg.crossOrigin = 'anonymous';

        watermarkImg.onload = () => {
          drawWatermark(ctx, watermarkImg, sourceImg.width, sourceImg.height, config);
          ctx.restore();
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        };

        watermarkImg.onerror = () => {
          reject(new Error('Failed to load watermark image'));
        };

        watermarkImg.src = config.imageUrl;
      } else if (config.text) {
        // Draw text watermark
        drawTextWatermark(ctx, config.text, sourceImg.width, sourceImg.height, config);
        ctx.restore();
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } else {
        ctx.restore();
        resolve(sourceImageUrl);
      }
    };

    sourceImg.onerror = () => {
      reject(new Error('Failed to load source image'));
    };

    sourceImg.src = sourceImageUrl;
  });
};

/**
 * Batch apply watermark to multiple images
 */
export const batchApplyWatermark = async (
  imageUrls: string[],
  config: WatermarkConfig
): Promise<string[]> => {
  return Promise.all(
    imageUrls.map((url) =>
      applyWatermark(url, config).catch((error) => {
        console.error('Failed to watermark image:', error);
        return url; // Return original if watermarking fails
      })
    )
  );
};

/**
 * Calculate watermark dimensions
 */
const calculateWatermarkDimensions = (
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  config: WatermarkConfig
): { width: number; height: number; x: number; y: number } => {
  // Calculate size based on percentage
  const maxSize = Math.min(canvasWidth, canvasHeight) * (config.size / 100);

  let width = maxSize;
  let height = maxSize;

  // Maintain aspect ratio
  const aspectRatio = watermarkWidth / watermarkHeight;
  if (aspectRatio > 1) {
    // Wider image
    width = maxSize;
    height = maxSize / aspectRatio;
  } else {
    // Taller image
    height = maxSize;
    width = maxSize * aspectRatio;
  }

  // Calculate position
  let x = config.padding;
  let y = config.padding;

  switch (config.position) {
    case 'top-left':
      x = config.padding;
      y = config.padding;
      break;
    case 'top-right':
      x = canvasWidth - width - config.padding;
      y = config.padding;
      break;
    case 'bottom-left':
      x = config.padding;
      y = canvasHeight - height - config.padding;
      break;
    case 'bottom-right':
      x = canvasWidth - width - config.padding;
      y = canvasHeight - height - config.padding;
      break;
    case 'center':
      x = (canvasWidth - width) / 2;
      y = (canvasHeight - height) / 2;
      break;
  }

  return { width, height, x, y };
};

/**
 * Draw image watermark on canvas
 */
const drawWatermark = (
  ctx: CanvasRenderingContext2D,
  watermarkImg: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  config: WatermarkConfig
): void => {
  const dims = calculateWatermarkDimensions(
    canvasWidth,
    canvasHeight,
    watermarkImg.width,
    watermarkImg.height,
    config
  );

  if (config.rotation) {
    ctx.save();
    ctx.translate(dims.x + dims.width / 2, dims.y + dims.height / 2);
    ctx.rotate((config.rotation * Math.PI) / 180);
    ctx.drawImage(watermarkImg, -dims.width / 2, -dims.height / 2, dims.width, dims.height);
    ctx.restore();
  } else {
    ctx.drawImage(watermarkImg, dims.x, dims.y, dims.width, dims.height);
  }
};

/**
 * Draw text watermark on canvas
 */
const drawTextWatermark = (
  ctx: CanvasRenderingContext2D,
  text: string,
  canvasWidth: number,
  canvasHeight: number,
  config: WatermarkConfig
): void => {
  const fontSize = Math.max(20, Math.min(100, (canvasWidth * config.size) / 200));

  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Add text stroke for better visibility
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = fontSize / 10;

  let x = canvasWidth / 2;
  let y = canvasHeight / 2;

  switch (config.position) {
    case 'top-left':
      x = canvasWidth * 0.15;
      y = canvasHeight * 0.1;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      break;
    case 'top-right':
      x = canvasWidth * 0.85;
      y = canvasHeight * 0.1;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      break;
    case 'bottom-left':
      x = canvasWidth * 0.15;
      y = canvasHeight * 0.9;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      break;
    case 'bottom-right':
      x = canvasWidth * 0.85;
      y = canvasHeight * 0.9;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      break;
  }

  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
};

/**
 * Generate preview of watermark
 */
export const generateWatermarkPreview = async (
  sourceImageUrl: string,
  config: WatermarkConfig,
  previewSize: number = 300
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = previewSize;
      canvas.height = (img.height / img.width) * previewSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = config.opacity;

      // Draw simple watermark preview
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const text = config.text || 'WATERMARK';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = sourceImageUrl;
  });
};

/**
 * React hook for watermarking
 */
export const useWatermark = () => {
  const [config, setConfig] = React.useState<WatermarkConfig>(DEFAULT_WATERMARK);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isApplying, setIsApplying] = React.useState(false);

  const apply = React.useCallback(
    async (imageUrl: string) => {
      try {
        setIsApplying(true);
        const result = await applyWatermark(imageUrl, config);
        return result;
      } finally {
        setIsApplying(false);
      }
    },
    [config]
  );

  const generatePreview = React.useCallback(
    async (imageUrl: string) => {
      try {
        const previewUrl = await generateWatermarkPreview(imageUrl, config);
        setPreview(previewUrl);
      } catch (error) {
        console.error('Failed to generate preview:', error);
      }
    },
    [config]
  );

  return {
    config,
    setConfig,
    preview,
    isApplying,
    apply,
    generatePreview,
  };
};

import React from 'react';
