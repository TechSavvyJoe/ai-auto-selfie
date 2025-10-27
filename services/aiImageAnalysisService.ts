import { GalleryImage, AIMode } from '../types';

export interface ImageAnalysis {
  qualityScore: number; // 0-100
  suggestedCategory: string;
  dominantColors: string[];
  tags: string[];
  faceCount: number;
  isPortrait: boolean;
  brightness: number; // 0-100
  contrast: number; // 0-100
  saturation: number; // 0-100
  sharpness: number; // 0-100
  recommendedMode: AIMode;
  description: string;
}

class AIImageAnalysisService {
  private analysisCache: Map<string, ImageAnalysis> = new Map();

  /**
   * Analyze an image and return insights
   */
  async analyzeImage(image: GalleryImage): Promise<ImageAnalysis> {
    // Check cache first
    if (this.analysisCache.has(image.id)) {
      return this.analysisCache.get(image.id)!;
    }

    try {
      const analysis = await this.performAnalysis(image);
      this.analysisCache.set(image.id, analysis);
      return analysis;
    } catch (error) {
      console.error('Error analyzing image:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Perform actual image analysis
   */
  private async performAnalysis(image: GalleryImage): Promise<ImageAnalysis> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(this.getDefaultAnalysis());
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Analyze pixel data
        const analysis = {
          qualityScore: this.calculateQualityScore(data, canvas.width, canvas.height),
          brightness: this.calculateBrightness(data),
          contrast: this.calculateContrast(data),
          saturation: this.calculateSaturation(data),
          sharpness: this.calculateSharpness(ctx, canvas.width, canvas.height),
          dominantColors: this.extractDominantColors(data),
          isPortrait: canvas.height > canvas.width,
          faceCount: this.estimateFaceCount(data),
          tags: this.generateTags(image, canvas.height > canvas.width),
          suggestedCategory: this.categorizeImage(data, image),
          recommendedMode: this.recommendAIMode(data, canvas.height > canvas.width, image),
          description: this.generateDescription(image),
        };

        resolve(analysis);
      };

      img.onerror = () => {
        resolve(this.getDefaultAnalysis());
      };

      img.src = image.imageDataUrl;
    });
  }

  /**
   * Calculate image quality score based on various metrics
   */
  private calculateQualityScore(data: Uint8ClampedArray, width: number, height: number): number {
    let score = 50;

    // Brightness analysis (50-100 is ideal)
    const brightness = this.calculateBrightness(data);
    score += Math.min(brightness * 0.5, 25);

    // Contrast analysis
    const contrast = this.calculateContrast(data);
    score += Math.min(contrast * 0.3, 15);

    // Sharpness estimation
    if (width > 1000 && height > 1000) {
      score += 10; // High resolution bonus
    }

    // Saturation balance
    const saturation = this.calculateSaturation(data);
    if (saturation > 20 && saturation < 80) {
      score += 5; // Good color balance
    }

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Calculate average brightness (0-100)
   */
  private calculateBrightness(data: Uint8ClampedArray): number {
    let sum = 0;
    const length = Math.min(data.length, 10000);

    for (let i = 0; i < length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      sum += (r + g + b) / 3;
    }

    return Math.round((sum / (length / 4)) * 100) / 255;
  }

  /**
   * Calculate image contrast
   */
  private calculateContrast(data: Uint8ClampedArray): number {
    const brightness = this.calculateBrightness(data);
    let sumDiff = 0;
    const length = Math.min(data.length, 10000);

    for (let i = 0; i < length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const pixelBrightness = (r + g + b) / 3;
      sumDiff += Math.abs(pixelBrightness - brightness * 255);
    }

    return Math.round((sumDiff / (length / 4)) * 100) / 255;
  }

  /**
   * Calculate color saturation (0-100)
   */
  private calculateSaturation(data: Uint8ClampedArray): number {
    let totalSat = 0;
    let count = 0;
    const length = Math.min(data.length, 10000);

    for (let i = 0; i < length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;

      if (l !== 0 && l !== 1) {
        const s = (max - min) / (1 - Math.abs(2 * l - 1));
        totalSat += s;
        count++;
      }
    }

    return count > 0 ? Math.round((totalSat / count) * 100) : 0;
  }

  /**
   * Estimate sharpness using edge detection
   */
  private calculateSharpness(ctx: CanvasRenderingContext2D, width: number, height: number): number {
    // Simple Laplacian edge detection
    const sampledWidth = Math.min(width, 200);
    const sampledHeight = Math.min(height, 200);
    const imageData = ctx.getImageData(0, 0, sampledWidth, sampledHeight);
    const data = imageData.data;

    let edgeCount = 0;
    const sampleSize = Math.min(data.length / 4, 1000);

    for (let i = 0; i < sampleSize; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;

      if (Math.abs(gray - 128) > 50) {
        edgeCount++;
      }
    }

    return Math.min((edgeCount / sampleSize) * 100, 100);
  }

  /**
   * Extract dominant colors from image
   */
  private extractDominantColors(data: Uint8ClampedArray): string[] {
    const colors: Map<string, number> = new Map();
    const step = 4;
    const maxSamples = 5000;

    for (let i = 0; i < Math.min(data.length, maxSamples * 4); i += step * 4) {
      const r = Math.round(data[i] / 50) * 50;
      const g = Math.round(data[i + 1] / 50) * 50;
      const b = Math.round(data[i + 2] / 50) * 50;
      const hex = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;

      colors.set(hex, (colors.get(hex) || 0) + 1);
    }

    return Array.from(colors.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([color]) => color);
  }

  /**
   * Estimate number of faces in image
   */
  private estimateFaceCount(data: Uint8ClampedArray): number {
    // Simple heuristic: look for skin-tone colored pixels
    let skinTonePixels = 0;
    const sampleSize = Math.min(data.length / 4, 2000);

    for (let i = 0; i < sampleSize; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Skin tone detection
      if (
        r > 95 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r > b &&
        Math.abs(r - g) > 15
      ) {
        skinTonePixels++;
      }
    }

    // Rough estimate: every 5% skin tone ≈ 1 face
    return Math.min(Math.floor(skinTonePixels / (sampleSize * 0.05)), 5);
  }

  /**
   * Generate relevant tags for the image
   */
  private generateTags(image: GalleryImage, isPortrait: boolean): string[] {
    const tags: string[] = [];

    // AI mode tag
    if (image.aiMode) {
      tags.push(`#${image.aiMode.toLowerCase()}`);
    }

    // Theme tag
    if (image.theme) {
      tags.push(`#${image.theme.toLowerCase()}`);
    }

    // Format tags
    tags.push(isPortrait ? '#portrait' : '#landscape');

    // Enhancement level
    if (image.enhancementLevel) {
      tags.push(`#${image.enhancementLevel}`);
    }

    // Content tags
    const messageWords = image.message?.split(' ').slice(0, 2) || [];
    messageWords.forEach(word => {
      if (word.length > 3) {
        tags.push(`#${word.toLowerCase()}`);
      }
    });

    return tags.slice(0, 8);
  }

  /**
   * Categorize image based on visual analysis
   */
  private categorizeImage(data: Uint8ClampedArray, image: GalleryImage): string {
    if (image.enhancementLevel === 'dramatic') return 'Creative';
    if (image.aiMode === 'portrait') return 'Portraits';
    if (image.aiMode === 'cinematic') return 'Cinematic';
    if (image.aiMode === 'professional') return 'Professional';
    return 'General';
  }

  /**
   * Recommend the best AI mode for an image
   */
  private recommendAIMode(
    data: Uint8ClampedArray,
    isPortrait: boolean,
    image: GalleryImage
  ): AIMode {
    if (isPortrait) return 'portrait';
    if (this.estimateFaceCount(data) > 0) return 'portrait';
    if (this.calculateSaturation(data) > 60) return 'cinematic';
    if (this.calculateContrast(data) > 60) return 'professional';
    return 'creative';
  }

  /**
   * Generate AI description of the image
   */
  private generateDescription(image: GalleryImage): string {
    const parts: string[] = [];

    if (image.message) {
      parts.push(image.message);
    }

    if (image.aiMode) {
      parts.push(`Enhanced with ${image.aiMode} mode`);
    }

    if (image.theme) {
      parts.push(`${image.theme} theme applied`);
    }

    if (image.processingTime) {
      const seconds = (image.processingTime / 1000).toFixed(1);
      parts.push(`Processed in ${seconds}s`);
    }

    return parts.length > 0
      ? parts.join(' • ')
      : 'Enhanced image from your gallery';
  }

  /**
   * Get default analysis when actual analysis fails
   */
  private getDefaultAnalysis(): ImageAnalysis {
    return {
      qualityScore: 65,
      brightness: 50,
      contrast: 45,
      saturation: 55,
      sharpness: 60,
      dominantColors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      isPortrait: false,
      faceCount: 0,
      tags: ['#enhanced', '#gallery'],
      suggestedCategory: 'General',
      recommendedMode: 'professional',
      description: 'Enhanced image from your gallery',
    };
  }

  /**
   * Find similar images in gallery
   */
  findSimilarImages(
    targetImage: GalleryImage,
    gallery: GalleryImage[],
    threshold: number = 0.7
  ): GalleryImage[] {
    // Simple similarity based on AI mode and theme
    return gallery.filter(img => {
      if (img.id === targetImage.id) return false;

      const modeMatch = img.aiMode === targetImage.aiMode ? 1 : 0;
      const themeMatch = img.theme === targetImage.theme ? 1 : 0;
      const similarityScore = (modeMatch + themeMatch) / 2;

      return similarityScore >= threshold;
    });
  }

  /**
   * Get image recommendations
   */
  getRecommendations(gallery: GalleryImage[]): GalleryImage[] {
    if (gallery.length === 0) return [];

    // Recommend highest quality images
    return gallery
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  }

  /**
   * Batch analyze images
   */
  async batchAnalyze(images: GalleryImage[]): Promise<Map<string, ImageAnalysis>> {
    const results = new Map<string, ImageAnalysis>();

    for (const image of images) {
      const analysis = await this.analyzeImage(image);
      results.set(image.id, analysis);
    }

    return results;
  }

  /**
   * Clear analysis cache
   */
  clearCache(): void {
    this.analysisCache.clear();
  }

  /**
   * Clear specific image from cache
   */
  clearImageCache(imageId: string): void {
    this.analysisCache.delete(imageId);
  }
}

export const getAIImageAnalysisService = (): AIImageAnalysisService => {
  if (!(window as any).__aiImageAnalysisService) {
    (window as any).__aiImageAnalysisService = new AIImageAnalysisService();
  }
  return (window as any).__aiImageAnalysisService;
};

export default AIImageAnalysisService;
