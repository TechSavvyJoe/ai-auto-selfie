/**
 * Export Dialog Component
 * Advanced export and sharing interface with multiple format and platform options
 */

import React, { useState, useCallback } from 'react';
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

export interface ExportDialogProps {
  isOpen: boolean;
  imageDataUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type ExportTab = 'download' | 'share';

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  imageDataUrl,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('download');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('jpeg');
  const [selectedPlatform, setSelectedPlatform] = useState<
    'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'whatsapp'
  >('instagram');
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');

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
      const shareUrl = generateShareLink(selectedPlatform, imageDataUrl, {
        message: `Check out this amazing vehicle delivery! 🚗✨`,
      });

      if (selectedPlatform === 'instagram') {
        setMessage('Open Instagram app and post the image manually');
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        setMessage('Opening share dialog...');
      }
    } catch (error) {
      setMessage(
        `Share failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsExporting(false);
    }
  }, [selectedPlatform, imageDataUrl]);

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

            {/* Share Actions */}
            <Button
              onClick={handleShare}
              variant="primary"
              size="lg"
              icon={<Icon type="share" />}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? 'Opening...' : 'Open Share Dialog'}
            </Button>

            {/* Alternative Share Methods */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-400">More Options:</p>
              <Button
                onClick={() => {
                  // Copy share link
                  navigator.clipboard.writeText(window.location.href);
                  setMessage('Share link copied!');
                }}
                variant="secondary"
                size="sm"
                icon={<Icon type="link" />}
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
