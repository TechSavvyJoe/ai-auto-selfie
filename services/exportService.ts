/**
 * Export & Sharing Service
 * Handle image exports in multiple formats and social media sharing
 */

export type ExportFormat = 'jpeg' | 'png' | 'webp';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number; // 0-100, applies to JPEG/WebP
  filename?: string;
}

export interface ShareOptions {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'whatsapp';
  title?: string;
  message?: string;
}

export const EXPORT_FORMATS = {
  jpeg: {
    mimeType: 'image/jpeg',
    extension: 'jpg',
    quality: 0.95,
  },
  png: {
    mimeType: 'image/png',
    extension: 'png',
    quality: undefined, // PNG doesn't use quality setting
  },
  webp: {
    mimeType: 'image/webp',
    extension: 'webp',
    quality: 0.85,
  },
};

/**
 * Convert image to desired format
 */
export const exportImage = async (
  imageDataUrl: string,
  options: ExportOptions
): Promise<Blob> => {
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

      const format = EXPORT_FORMATS[options.format];
      const quality = options.quality ?? format.quality ?? 0.95;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        format.mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
};

/**
 * Download image to device
 */
export const downloadImage = async (
  imageDataUrl: string,
  options: ExportOptions
): Promise<void> => {
  try {
    const blob = await exportImage(imageDataUrl, options);
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename =
      options.filename || `dealership-post-${timestamp}.${EXPORT_FORMATS[options.format].extension}`;

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get optimized dimensions for different social platforms
 */
export const getSocialMediaDimensions = (
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
): { width: number; height: number; aspectRatio: string } => {
  const dimensions = {
    instagram: { width: 1080, height: 1080, aspectRatio: '1:1' }, // Feed post
    facebook: { width: 1200, height: 630, aspectRatio: '1.91:1' },
    twitter: { width: 1024, height: 512, aspectRatio: '2:1' },
    linkedin: { width: 1200, height: 627, aspectRatio: '1.91:1' },
  };

  return dimensions[platform];
};

/**
 * Resize image for social platform
 */
export const resizeForSocialPlatform = async (
  imageDataUrl: string,
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const dims = getSocialMediaDimensions(platform);
      const canvas = document.createElement('canvas');
      canvas.width = dims.width;
      canvas.height = dims.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate centered crop
      const imgAspect = img.width / img.height;
      const canvasAspect = dims.width / dims.height;

      let srcX = 0;
      let srcY = 0;
      let srcWidth = img.width;
      let srcHeight = img.height;

      if (imgAspect > canvasAspect) {
        // Image is wider, crop sides
        srcWidth = img.height * canvasAspect;
        srcX = (img.width - srcWidth) / 2;
      } else {
        // Image is taller, crop top/bottom
        srcHeight = img.width / canvasAspect;
        srcY = (img.height - srcHeight) / 2;
      }

      ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, dims.width, dims.height);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
};

/**
 * Copy image to clipboard
 */
export const copyImageToClipboard = async (imageDataUrl: string): Promise<void> => {
  try {
    const blob = await exportImage(imageDataUrl, {
      format: 'png',
    });

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
  } catch (error) {
    throw new Error(
      `Failed to copy to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Share via Web Share API (mobile)
 */
export const shareViaWebShare = async (
  imageDataUrl: string,
  options: ShareOptions
): Promise<void> => {
  if (!navigator.share) {
    throw new Error('Web Share API is not supported on this device');
  }

  try {
    const blob = await exportImage(imageDataUrl, {
      format: 'jpeg',
      quality: 0.9,
    });

    const file = new File([blob], 'dealership-post.jpg', { type: 'image/jpeg' });

    await navigator.share({
      files: [file],
      title: options.title || 'Dealership Social Studio',
      text: options.message || 'Check out this amazing vehicle delivery!',
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // User cancelled share
      return;
    }
    throw error;
  }
};

/**
 * Generate social media share links
 */
export const generateShareLink = (
  platform: ShareOptions['platform'],
  imageUrl: string,
  options?: { title?: string; message?: string }
): string => {
  const encodedTitle = encodeURIComponent(options?.title || 'Check out this post!');
  const encodedMessage = encodeURIComponent(options?.message || '');
  const encodedUrl = encodeURIComponent(imageUrl);

  const links = {
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing via URL
    facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodedMessage}&u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`,
  };

  return links[platform];
};

/**
 * Batch export multiple images
 */
export const batchExport = async (
  images: string[],
  format: ExportFormat
): Promise<{ filename: string; blob: Blob }[]> => {
  const results = await Promise.all(
    images.map(async (image, index) => {
      const blob = await exportImage(image, { format });
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `post-${timestamp}-${index + 1}.${EXPORT_FORMATS[format].extension}`;
      return { filename, blob };
    })
  );

  return results;
};

/**
 * Create shareable link with image metadata
 */
export const createShareableLink = (
  imageDataUrl: string,
  metadata?: {
    title?: string;
    description?: string;
    dealership?: string;
  }
): Promise<string> => {
  return new Promise((resolve) => {
    // This would typically upload to a server and return a short link
    // For now, returning a data URL encoded version
    const metaString = metadata ? `?meta=${btoa(JSON.stringify(metadata))}` : '';
    resolve(
      `${window.location.origin}${window.location.pathname}${metaString}`
    );
  });
};

/**
 * Get file size estimate for format
 */
export const estimateFileSize = (
  originalSize: number,
  format: ExportFormat
): { formatted: string; bytes: number } => {
  const compressionRatios = {
    jpeg: 0.3, // JPEG is ~30% of original
    png: 0.8, // PNG is ~80% of original
    webp: 0.25, // WebP is ~25% of original
  };

  const bytes = originalSize * compressionRatios[format];
  const formatted =
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return { formatted, bytes };
};
