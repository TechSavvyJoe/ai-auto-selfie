/**
 * Export Dialog Component
 * Simplified one-button share with AI-generated caption
 */

import React, { useState, useCallback, useEffect } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import Icon from './common/Icon';
import { downloadImage } from '../services/exportService';
import { generateCaptionFromImage } from '../services/geminiService';
import { useAnalytics } from '../services/analyticsService';

export interface ExportDialogProps {
  isOpen: boolean;
  imageDataUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCaption?: string;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  imageDataUrl,
  onClose,
  onSuccess,
  defaultCaption = '',
}) => {
  const { trackFeature } = useAnalytics();
  const [caption, setCaption] = useState(defaultCaption);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [message, setMessage] = useState('');
  const [captionGenerated, setCaptionGenerated] = useState(false);

  // Auto-generate AI caption when dialog opens
  useEffect(() => {
    if (isOpen && !captionGenerated) {
      generateAICaption();
    }
  }, [isOpen]);

  const generateAICaption = useCallback(async () => {
    try {
      setIsGeneratingCaption(true);
      setMessage('AI is writing your caption...');
      
      // Extract base64 data from data URL
      const base64Match = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) {
        throw new Error('Invalid image data');
      }
      
      const mimeType = base64Match[1];
      const base64Data = base64Match[2];
      
      const aiCaption = await generateCaptionFromImage(base64Data, mimeType, {
        includeHashtags: true,
        maxWords: 25, // Longer for dealership celebration posts
      });
      
      setCaption(aiCaption);
      setCaptionGenerated(true);
      setMessage('Caption ready! Edit if you like, then share.');
      trackFeature('ai_caption_generated', { location: 'export_dialog' });
    } catch (error) {
      console.error('Caption generation failed:', error);
      setCaption(defaultCaption || 'Check out this amazing photo! 📸');
      setMessage('Using default caption');
    } finally {
      setIsGeneratingCaption(false);
    }
  }, [imageDataUrl, defaultCaption, trackFeature]);

  const handleSharePhoto = useCallback(async () => {
    try {
      setIsSharing(true);
      setMessage('Preparing to share...');

      // Copy caption to clipboard first so user can paste it
      try {
        await navigator.clipboard.writeText(caption);
        trackFeature('caption_copied_auto', { location: 'export_dialog' });
      } catch (clipboardError) {
        console.warn('Could not copy caption to clipboard:', clipboardError);
      }

      // Convert data URL to blob for Web Share API
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'AI Auto Selfie',
          text: caption,
          files: [file],
        });
        setMessage('Shared! Caption is in your clipboard - paste it in your post.');
        trackFeature('web_share_success', { location: 'export_dialog' });
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        // Fallback: just download the image
        setMessage('Share not supported. Downloading image instead. Caption is copied - paste it manually.');
        await downloadImage(imageDataUrl, { format: 'jpeg', quality: 95 });
        trackFeature('share_fallback_download', { location: 'export_dialog' });
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled share sheet
        setMessage('Share cancelled');
        setIsSharing(false);
        return;
      }
      console.error('Share failed:', error);
      setMessage(`Share failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSharing(false);
    }
  }, [imageDataUrl, caption, onClose, onSuccess, trackFeature]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Photo"
      size="md"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* AI-Generated Caption */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-white">
              AI-Generated Caption
            </label>
            <Button
              onClick={generateAICaption}
              variant="secondary"
              size="sm"
              disabled={isGeneratingCaption}
              className="text-xs"
            >
              {isGeneratingCaption ? (
                <>
                  <Icon type="spinner" className="w-3 h-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Icon type="refresh" className="w-3 h-3 mr-1" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
          
          {isGeneratingCaption ? (
            <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
              <div className="flex items-center gap-3">
                <Icon type="spinner" className="w-5 h-5 text-primary-400 animate-spin" />
                <p className="text-sm text-neutral-300">AI is analyzing your photo and writing the perfect caption...</p>
              </div>
            </div>
          ) : (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              placeholder="Your AI-generated caption will appear here..."
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500 resize-none"
            />
          )}
          
          <div className="flex items-start gap-2 mt-2">
            <Icon type="info" className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-neutral-400">
              Caption will be copied to your clipboard. After sharing the photo, paste it into your social media post!
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="p-4 bg-gradient-to-r from-primary-500/10 to-pink-500/10 border border-primary-500/30 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Icon type="share" className="w-4 h-4" />
            How This Works
          </h3>
          <ol className="text-xs text-neutral-300 space-y-1 list-decimal list-inside">
            <li>Click "Share Photo" below</li>
            <li>Choose where to share (Instagram, Messages, etc.)</li>
            <li>Photo attaches automatically</li>
            <li>Paste the caption from your clipboard</li>
            <li>Post and engage! 🚀</li>
          </ol>
        </div>

        {/* Main Share Button */}
        <Button
          onClick={handleSharePhoto}
          variant="primary"
          size="lg"
          icon={<Icon type="share" />}
          disabled={isSharing || isGeneratingCaption}
          className="w-full text-lg py-4"
        >
          {isSharing ? (
            <>
              <Icon type="spinner" className="w-5 h-5 mr-2 animate-spin" />
              Opening Share Sheet...
            </>
          ) : (
            'Share Photo'
          )}
        </Button>

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-lg border ${
            message.includes('failed') || message.includes('error')
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-primary-500/10 border-primary-500/30'
          }`}>
            <p className={`text-sm font-medium ${
              message.includes('failed') || message.includes('error')
                ? 'text-red-300'
                : 'text-primary-300'
            }`}>
              {message}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t border-neutral-800 space-y-2">
          <p className="text-xs font-semibold text-neutral-400 mb-2">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(caption);
                  setMessage('Caption copied! ✓');
                  trackFeature('copy_caption_manual', { location: 'export_dialog' });
                  setTimeout(() => setMessage(''), 2000);
                } catch (e) {
                  setMessage('Failed to copy caption');
                }
              }}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <Icon type="copy" className="w-4 h-4 mr-2" />
              Copy Caption
            </Button>
            
            <Button
              onClick={async () => {
                try {
                  await downloadImage(imageDataUrl, { format: 'jpeg', quality: 95 });
                  setMessage('Photo saved to camera roll!');
                  trackFeature('download_from_share_dialog', { location: 'export_dialog' });
                  setTimeout(() => setMessage(''), 2000);
                } catch (e) {
                  setMessage('Download failed');
                }
              }}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <Icon type="download" className="w-4 h-4 mr-2" />
              Save Photo
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-4 border-t border-neutral-800">
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportDialog;
