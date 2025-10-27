
export const dataUrlToBase64 = (dataUrl: string): string => {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid data URL format');
  }
  return parts[1];
};

export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      if (!data) {
        reject(new Error('Invalid file format'));
        return;
      }
      const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
      resolve({ base64: data, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Compress an image to a target quality
 */
export const compressImage = async (
  dataUrl: string,
  quality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};

/**
 * Generate a thumbnail from an image
 */
export const generateThumbnail = async (dataUrl: string, maxSize = 200): Promise<string> => {
  return compressImage(dataUrl, 0.7, maxSize, maxSize);
};

/**
 * Preload an image
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};
