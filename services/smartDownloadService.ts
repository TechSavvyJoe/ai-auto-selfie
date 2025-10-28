/**
 * Smart Download Service
 * Intelligently handles downloads across different platforms and devices
 * iOS Camera Roll, Android Photos, Desktop - all handled seamlessly
 */

export interface DownloadResult {
  success: boolean;
  message: string;
  method: 'share-api' | 'camera-roll' | 'download' | 'clipboard';
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

class SmartDownloadService {
  /**
   * Detect current platform/device
   */
  private detectPlatform(): 'ios' | 'android' | 'desktop' | 'unknown' {
    const ua = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) {
      return 'ios';
    } else if (/android/.test(ua)) {
      return 'android';
    } else if (/windows|mac|linux/.test(ua)) {
      return 'desktop';
    }

    return 'unknown';
  }

  /**
   * Check if Share API is available
   */
  private canUseShareAPI(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }

  /**
   * Smart download - uses best available method for platform
   */
  async smartDownload(
    imageDataUrl: string,
    fileName: string = 'enhanced-photo'
  ): Promise<DownloadResult> {
    const platform = this.detectPlatform();
    const timestamp = new Date().getTime();
    const fullFileName = fileName + '-' + timestamp;

    try {
      if (this.canUseShareAPI()) {
        return await this.downloadViaShareAPI(imageDataUrl, fullFileName, platform);
      }

      if (platform === 'ios') {
        return await this.downloadToIOSCameraRoll(imageDataUrl, fullFileName);
      }

      if (platform === 'android') {
        return await this.downloadToAndroidPhotos(imageDataUrl, fullFileName);
      }

      return this.downloadViaStandardMethod(imageDataUrl, fullFileName, platform);
    } catch (error) {
      console.error('Download error:', error);
      return {
        success: false,
        message: 'Failed to download. Please try again.',
        method: 'download',
        platform,
      };
    }
  }

  /**
   * Download using Share API (most native-like experience)
   */
  private async downloadViaShareAPI(
    imageDataUrl: string,
    fileName: string,
    platform: string
  ): Promise<DownloadResult> {
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName + '.jpg', { type: 'image/jpeg' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Enhanced Photo',
          text: 'Check out my enhanced photo!',
        });

        return {
          success: true,
          message: 'Photo shared! You can save it to your camera roll from the share menu.',
          method: 'share-api',
          platform: platform as any,
        };
      }

      throw new Error('Share API not available');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download to iOS Camera Roll
   */
  private async downloadToIOSCameraRoll(
    imageDataUrl: string,
    fileName: string
  ): Promise<DownloadResult> {
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      if (navigator.clipboard && navigator.clipboard.write) {
        const item = new ClipboardItem({ 'image/jpeg': blob });
        await navigator.clipboard.write([item]);

        return {
          success: true,
          message: 'Photo copied! Open Photos app and paste, or use the share button.',
          method: 'clipboard',
          platform: 'ios',
        };
      }

      return this.downloadViaStandardMethod(imageDataUrl, fileName, 'ios');
    } catch (error) {
      return this.downloadViaStandardMethod(imageDataUrl, fileName, 'ios');
    }
  }

  /**
   * Download to Android Photos
   */
  private async downloadToAndroidPhotos(
    imageDataUrl: string,
    fileName: string
  ): Promise<DownloadResult> {
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      if (this.canUseShareAPI()) {
        const file = new File([blob], fileName + '.jpg', { type: 'image/jpeg' });
        await navigator.share({
          files: [file],
          title: 'Save Photo',
          text: 'Save this enhanced photo to your gallery',
        });

        return {
          success: true,
          message: 'Select "Save to Photos" from the share menu to save to your gallery.',
          method: 'share-api',
          platform: 'android',
        };
      }

      return this.downloadViaStandardMethod(imageDataUrl, fileName, 'android');
    } catch (error) {
      return this.downloadViaStandardMethod(imageDataUrl, fileName, 'android');
    }
  }

  /**
   * Standard browser download (desktop fallback)
   */
  private downloadViaStandardMethod(
    imageDataUrl: string,
    fileName: string,
    platform: string
  ): DownloadResult {
    try {
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = fileName + '.jpg';
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(imageDataUrl);

      return {
        success: true,
        message: platform === 'desktop' 
          ? 'Photo downloaded to Downloads folder!'
          : 'Photo saved! Check your Downloads folder.',
        method: 'download',
        platform: platform as any,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get appropriate instruction message for platform
   */
  getInstructionMessage(platform: string = 'unknown'): string {
    const instructions: Record<string, string> = {
      ios: 'iOS: Tap the share button to save to Photos app',
      android: 'Android: Select Save to Photos from the share menu',
      desktop: 'Desktop: Your photo will be saved to Downloads',
      unknown: 'Your photo is ready to download!',
    };

    return instructions[platform] || instructions.unknown;
  }
}

let instance: SmartDownloadService | null = null;

export const getSmartDownloadService = (): SmartDownloadService => {
  if (!instance) {
    instance = new SmartDownloadService();
  }
  return instance;
};

export default SmartDownloadService;
