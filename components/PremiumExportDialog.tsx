import React, { useState, useCallback, useEffect } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import {
  ExportFormat,
  EXPORT_FORMATS,
  downloadImage,
  copyImageToClipboard,
  generateShareLink,
} from '../services/exportService';
import { uploadImage, isUploadConfigured } from '../services/uploadService';
import { getAnalyticsService } from '../services/analyticsService';

interface PremiumExportDialogProps {
  isOpen: boolean;
  imageDataUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCaption?: string;
}

type ExportTab = 'download' | 'share';

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📷', color: 'from-pink-500 to-purple-500' },
  { id: 'facebook', name: 'Facebook', icon: '👥', color: 'from-blue-600 to-blue-400' },
  { id: 'twitter', name: 'Twitter', icon: '𝕏', color: 'from-gray-700 to-gray-900' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'from-blue-600 to-blue-700' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '🟢', color: 'from-green-500 to-green-600' },
] as const;

export const PremiumExportDialog: React.FC<PremiumExportDialogProps> = ({
  isOpen,
  imageDataUrl,
  onClose,
  onSuccess,
  defaultCaption = '',
}) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('download');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('jpeg');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
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

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleDownload = useCallback(async () => {
    try {
      setIsExporting(true);
      await downloadImage(imageDataUrl, {
        format: selectedFormat,
        quality: selectedFormat === 'jpeg' ? 95 : undefined,
      });
      showMessage('✓ Image downloaded successfully!', 'success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error) {
      showMessage(
        `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsExporting(false);
    }
  }, [imageDataUrl, selectedFormat, onClose, onSuccess]);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      setIsExporting(true);
      await copyImageToClipboard(imageDataUrl);
      showMessage('✓ Image copied to clipboard!', 'success');
      setTimeout(() => {
        setMessage('');
      }, 2000);
    } catch (error) {
      showMessage(
        `Copy failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsExporting(false);
    }
  }, [imageDataUrl]);

  const handleUploadForShare = useCallback(async () => {
    if (!uploadAvailable) {
      showMessage('No upload provider configured.', 'error');
      return;
    }

    try {
      setIsUploading(true);
      showMessage('⏳ Uploading image...', 'info');
      const { url } = await uploadImage(imageDataUrl, {
        fileName: `ai-auto-selfie-${Date.now()}.jpg`,
      });
      setUploadedUrl(url);
      showMessage('✓ Image uploaded. Share link ready!', 'success');
    } catch (err) {
      showMessage(
        `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsUploading(false);
    }
  }, [imageDataUrl, uploadAvailable]);

  const handleShare = useCallback(async () => {
    try {
      setIsExporting(true);
      const targetImage = uploadedUrl || imageDataUrl;
      const platform = selectedPlatform as any;
      const shareUrl = generateShareLink(platform, targetImage, {
        message: caption || `Check out this amazing photo!`,
      });

      if (selectedPlatform === 'instagram') {
        showMessage('Open Instagram and post the image manually', 'info');
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        showMessage('Opening share dialog...', 'info');
      }
    } catch (error) {
      showMessage(
        `Share failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsExporting(false);
    }
  }, [selectedPlatform, imageDataUrl, caption, uploadedUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-gradient-to-br from-gray-900 via-neutral-900 to-black rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-8 py-6 border-b border-gray-800/50 bg-gradient-to-r from-primary-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Icon type="share" className="w-6 h-6 text-primary-500" />
                Export & Share
              </h2>
              <p className="text-sm text-white/60 mt-1">Choose your preferred format and platform</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
            >
              <Icon type="close" className="w-6 h-6 text-white/60 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-0 px-8 pt-6">
          {(['download', 'share'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-3 font-semibold text-sm capitalize transition-all duration-300 ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  type={tab === 'download' ? 'download' : 'share'}
                  className="w-4 h-4"
                />
                {tab}
              </div>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-400 rounded-t" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Download Tab */}
          {activeTab === 'download' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Format Selection */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Choose Format
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {(Object.entries(EXPORT_FORMATS) as Array<
                    [ExportFormat, typeof EXPORT_FORMATS['jpeg']]
                  >).map(([format, config]) => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`group relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                        selectedFormat === format
                          ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/20'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-900/50 hover:bg-gray-900'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className="text-2xl font-bold text-white mb-1">
                          {config.extension}
                        </div>
                        <p className="text-xs text-white/60">
                          {format === 'jpeg' && 'Best compatibility'}
                          {format === 'png' && 'Lossless'}
                          {format === 'webp' && 'Modern format'}
                        </p>
                      </div>
                      {selectedFormat === format && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/10 group-hover:to-primary-500/20 transition-all" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Info Card */}
              <div className="p-4 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent rounded-xl border border-blue-500/20">
                <div className="flex gap-3">
                  <Icon type="info" className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-white mb-2">Format Guide</p>
                    <ul className="space-y-1 text-xs text-white/80">
                      <li>• <strong>JPEG:</strong> Web & social media (universal)</li>
                      <li>• <strong>PNG:</strong> Transparency & printing quality</li>
                      <li>• <strong>WebP:</strong> Modern web format (smaller size)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="group relative px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 group-hover:from-primary-600 group-hover:to-primary-700 transition-all duration-300" />
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <Icon type="download" className="w-5 h-5" />
                    {isExporting ? 'Downloading...' : 'Download'}
                  </div>
                </button>

                <button
                  onClick={handleCopyToClipboard}
                  disabled={isExporting}
                  className="group relative px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 group-hover:from-gray-600 group-hover:to-gray-700 transition-all duration-300" />
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <Icon type="copy" className="w-5 h-5" />
                    {isExporting ? 'Copying...' : 'Copy'}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Caption Input */}
              <div>
                <label className="text-sm font-bold text-white uppercase tracking-wider mb-3 block">
                  Caption
                </label>
                <div className="relative">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    placeholder="Share your story... Add hashtags like #amazing #enhanced"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-white/40 focus:border-primary-500 focus:outline-none transition-all duration-300 resize-none"
                  />
                  <div className="absolute bottom-2 right-3 text-xs text-white/40">
                    {caption.length} characters
                  </div>
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Share to Platform
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {SOCIAL_PLATFORMS.map(({ id, name, icon, color }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedPlatform(id)}
                      className={`group relative p-4 rounded-xl transition-all duration-300 text-center overflow-hidden ${
                        selectedPlatform === id
                          ? 'ring-2 ring-offset-2 ring-offset-neutral-950 ring-primary-500'
                          : 'hover:scale-105'
                      }`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                      />
                      <div className="relative z-10">
                        <div className="text-3xl mb-2">{icon}</div>
                        <div className="text-xs font-semibold text-white">{name}</div>
                      </div>
                      {selectedPlatform === id && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-30`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Section */}
              {uploadAvailable && (
                <div className="p-4 bg-gradient-to-br from-green-500/10 via-transparent to-transparent rounded-xl border border-green-500/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Icon type="cloud" className="w-5 h-5 text-green-400" />
                    Create Share Link
                  </h4>
                  <button
                    onClick={handleUploadForShare}
                    disabled={isUploading}
                    className="group relative w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 overflow-hidden disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 group-hover:from-green-700 group-hover:to-emerald-700 transition-all duration-300" />
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <Icon type="upload" className="w-4 h-4" />
                      {isUploading ? 'Uploading...' : uploadedUrl ? 'Re-upload' : 'Upload & Share'}
                    </div>
                  </button>

                  {uploadedUrl && (
                    <div className="mt-3 flex gap-2">
                      <input
                        readOnly
                        value={uploadedUrl}
                        className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-white/80 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(uploadedUrl);
                          setCopied('link');
                          setTimeout(() => setCopied(null), 2000);
                        }}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-xs font-semibold text-white transition-colors"
                      >
                        {copied === 'link' ? '✓' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleShare}
                  disabled={isExporting}
                  className="group relative px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 group-hover:from-primary-600 group-hover:to-primary-700 transition-all duration-300" />
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <Icon type="share" className="w-5 h-5" />
                    {isExporting ? 'Opening...' : 'Share'}
                  </div>
                </button>

                <button
                  onClick={() => {
                    const link = uploadedUrl || window.location.href;
                    navigator.clipboard.writeText(link);
                    setCopied('link');
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className="group relative px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 group-hover:from-gray-600 group-hover:to-gray-700 transition-all duration-300" />
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <Icon type="link" className="w-5 h-5" />
                    {copied === 'link' ? 'Copied!' : 'Copy Link'}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`mx-8 mb-6 p-4 rounded-xl border flex gap-3 animate-slideDown ${
              messageType === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : messageType === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}
          >
            <Icon
              type={messageType === 'success' ? 'check' : messageType === 'error' ? 'alert' : 'info'}
              className="w-5 h-5 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-800/50 bg-gray-900/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold text-white/80 hover:text-white hover:bg-gray-800 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PremiumExportDialog;
