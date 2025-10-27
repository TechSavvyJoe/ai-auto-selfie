/**
 * Export Dialog Component
 * Advanced export and sharing interface with multiple format and platform options
 */

import React, { useState, useCallback, useEffect } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import Icon from './common/Icon';
import {
  ExportFormat,
  EXPORT_FORMATS,
  downloadImage,
  copyImageToClipboard,
  generateShareLink,
  resizeForSocialPlatform,
} from '../services/exportService';
import { uploadImage, isUploadConfigured } from '../services/uploadService';
import { useAnalytics } from '../services/analyticsService';

export interface ExportDialogProps {
  isOpen: boolean;
  imageDataUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCaption?: string;
}

type ExportTab = 'download' | 'share';

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  imageDataUrl,
  onClose,
  onSuccess,
  defaultCaption = '',
}) => {
  const { trackFeature } = useAnalytics();
  const [activeTab, setActiveTab] = useState<ExportTab>('download');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('jpeg');
  const [selectedPlatform, setSelectedPlatform] = useState<
    'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'whatsapp'
  >('instagram');
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [caption, setCaption] = useState(defaultCaption);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadAvailable] = useState<boolean>(() => isUploadConfigured());
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCaption(defaultCaption);
    }
  }, [defaultCaption, isOpen]);

  const handleDownload = useCallback(async () => {
    try {
      setIsExporting(true);
      await downloadImage(imageDataUrl, {
        format: selectedFormat,
        quality: selectedFormat === 'jpeg' ? 95 : undefined,
      });
      setMessage('Image downloaded successfully!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error) {
      setMessage(
        `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsExporting(false);
    }
  }, [imageDataUrl, selectedFormat, onClose, onSuccess]);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      setIsExporting(true);
      await copyImageToClipboard(imageDataUrl);
      setMessage('Image copied to clipboard!');
      setTimeout(() => {
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage(
        `Copy failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsExporting(false);
    }
  }, [imageDataUrl]);

  const handleShare = useCallback(async () => {
    try {
      setIsExporting(true);
      const targetImage = uploadedUrl || imageDataUrl;
      const shareUrl = generateShareLink(selectedPlatform, targetImage, {
        message: caption || `Check out this!`,
      });

      if (selectedPlatform === 'instagram') {
        setMessage('Open Instagram app and post the image manually');
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        setMessage('Opening share dialog...');
      }
      trackFeature('open_share_link', { platform: selectedPlatform });
    } catch (error) {
      setMessage(
        `Share failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsExporting(false);
    }
  }, [selectedPlatform, imageDataUrl, caption, uploadedUrl, trackFeature]);

  const handleWebShare = useCallback(async () => {
    try {
      setIsExporting(true);
      const { shareViaWebShare } = await import('../services/exportService');
      // Prefer sharing the file itself via Web Share when possible.
      // If an uploaded public URL exists, fall back to sharing the URL as text.
      if (uploadedUrl) {
        await navigator.share?.({
          title: 'AI Auto Selfie',
          text: caption || undefined,
          url: uploadedUrl,
        } as any);
      } else {
        await shareViaWebShare(imageDataUrl, {
          platform: selectedPlatform,
          title: 'AI Auto Selfie',
          message: caption || undefined,
        });
      }
      setMessage('Opening device share...');
      trackFeature('device_web_share', { platform: selectedPlatform });
    } catch (error) {
      setMessage(`Device share failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  }, [imageDataUrl, caption, selectedPlatform, uploadedUrl, trackFeature]);

  const handleUploadForShare = useCallback(async () => {
    if (!uploadAvailable) {
      setMessage('No upload provider configured.');
      return;
    }

    try {
      setIsUploading(true);
      setMessage('Uploading image...');
      const { url } = await uploadImage(imageDataUrl, { fileName: `ai-auto-selfie-${Date.now()}.jpg` });
      setUploadedUrl(url);
      setMessage('Image uploaded. Public link ready.');
      trackFeature('upload_create_share_link', { provider: 'auto' });
    } catch (err) {
      setMessage(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  }, [imageDataUrl, trackFeature, uploadAvailable]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export & Share"
      size="md"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('download')}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'download'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Icon type="download" className="w-4 h-4 inline mr-2" />
            Download
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'share'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Icon type="share" className="w-4 h-4 inline mr-2" />
            Share
          </button>
        </div>

        {/* Download Tab */}
        {activeTab === 'download' && (
          <div className="space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                File Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.entries(EXPORT_FORMATS) as Array<
                  [ExportFormat, typeof EXPORT_FORMATS['jpeg']]
                >).map(([format, config]) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedFormat === format
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    <p className="font-semibold text-white uppercase text-sm">
                      {config.extension}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {format === 'jpeg' && 'Best compatibility'}
                      {format === 'png' && 'Lossless quality'}
                      {format === 'webp' && 'Smallest size'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleDownload}
                variant="primary"
                size="lg"
                icon={<Icon type="download" />}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? 'Exporting...' : 'Download Image'}
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                variant="secondary"
                size="lg"
                icon={<Icon type="copy" />}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? 'Copying...' : 'Copy to Clipboard'}
              </Button>
            </div>

            {/* Format Info */}
            <div className="p-3 bg-neutral-800/50 rounded-lg text-xs text-neutral-400">
              <p className="font-semibold text-white mb-1">Format Recommendations:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>
                  <strong>JPEG:</strong> Best for social media, universal compatibility
                </li>
                <li>
                  <strong>PNG:</strong> For transparency, professional printing
                </li>
                <li>
                  <strong>WebP:</strong> Modern format, better compression
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Share Tab */}
        {activeTab === 'share' && (
          <div className="space-y-4">
            {/* Caption Composer */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Say something about this photo..."
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-primary-500"
              />
              <div className="text-[11px] text-neutral-400 mt-1">Tip: Add hashtags like #car #delivery</div>
            </div>
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Share to Platform
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { id: 'instagram', name: 'Instagram', icon: '📷' },
                    { id: 'facebook', name: 'Facebook', icon: '👥' },
                    { id: 'twitter', name: 'Twitter', icon: '𝕏' },
                    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
                    { id: 'whatsapp', name: 'WhatsApp', icon: '🟢' },
                  ] as const
                ).map(({ id, name, icon }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedPlatform(id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      selectedPlatform === id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    <p className="text-xl mb-1">{icon}</p>
                    <p className="font-semibold text-white text-sm">{name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Copy helpers */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(caption || '');
                    trackFeature('copy_caption', { location: 'export_dialog' });
                    setCopied('caption');
                    setTimeout(() => setCopied(null), 1500);
                  } catch (e) {
                    setMessage('Failed to copy caption');
                  }
                }}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                {copied === 'caption' ? 'Copied Caption ✓' : 'Copy Caption'}
              </Button>

              <Button
                onClick={async () => {
                  const tags = (caption || '')
                    .split(/\s+/)
                    .filter((w) => w.startsWith('#'))
                    .join(' ');
                  if (!tags) {
                    setMessage('No hashtags detected in caption');
                    return;
                  }
                  try {
                    await navigator.clipboard.writeText(tags);
                    trackFeature('copy_hashtags', { location: 'export_dialog' });
                    setCopied('hashtags');
                    setTimeout(() => setCopied(null), 1500);
                  } catch (e) {
                    setMessage('Failed to copy hashtags');
                  }
                }}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                {copied === 'hashtags' ? 'Copied Hashtags ✓' : 'Copy Hashtags'}
              </Button>
            </div>

            {/* Upload / Create public share link (optional) */}
            {uploadAvailable && (
              <div className="space-y-2">
                <Button
                  onClick={handleUploadForShare}
                  variant="secondary"
                  size="lg"
                  disabled={isUploading || isExporting}
                  className="w-full"
                >
                  {isUploading ? 'Uploading...' : uploadedUrl ? 'Re-upload / Refresh Link' : 'Create Share Link (Upload)'}
                </Button>

                {uploadedUrl && (
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      aria-label="Uploaded share link"
                      title="Uploaded share link"
                      value={uploadedUrl}
                      className="flex-1 p-2 bg-neutral-900 rounded text-xs text-white"
                    />
                    <Button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(uploadedUrl);
                          setMessage('Uploaded link copied!');
                          trackFeature('copy_uploaded_link', { location: 'export_dialog' });
                        } catch (e) {
                          setMessage('Failed to copy link');
                        }
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      Copy
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Share Actions */}
            <Button
              onClick={handleShare}
              variant="primary"
              size="lg"
              icon={<span className="text-lg">↗</span>}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? 'Opening...' : 'Open Share Dialog'}
            </Button>

            <Button
              onClick={handleWebShare}
              variant="secondary"
              size="lg"
              icon={<span className="text-lg">📲</span>}
              disabled={isExporting}
              className="w-full"
            >
              Share via Device (Web Share)
            </Button>

            {/* Alternative Share Methods */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-400">More Options:</p>
              <Button
                onClick={() => {
                  // Copy share link (prefer uploaded public URL)
                  const link = uploadedUrl || window.location.href;
                  navigator.clipboard.writeText(link);
                  setMessage('Share link copied!');
                }}
                variant="secondary"
                size="sm"
                icon={<span className="text-sm">🔗</span>}
                className="w-full"
              >
                Copy Share Link
              </Button>
            </div>

            {/* Platform Info */}
            <div className="p-3 bg-neutral-800/50 rounded-lg text-xs text-neutral-400">
              <p className="font-semibold text-white mb-1">Platform Tips:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Instagram: Best for 1:1 aspect ratio posts</li>
                <li>Facebook: Supports 1.91:1 landscape format</li>
                <li>Twitter: Optimized for 2:1 widescreen</li>
                <li>LinkedIn: Professional network, great for B2B</li>
              </ul>
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
            <p className="text-sm text-primary-300 font-medium">{message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-neutral-800">
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportDialog;
