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

  // Auto-generate AI caption when dialog opens (only if we don't already have one)
  useEffect(() => {
    if (isOpen && !captionGenerated && !defaultCaption) {
      generateAICaption();
    }
  }, [isOpen, captionGenerated, defaultCaption]);

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
      setMessage('Preparing to save and share...');

      // Step 1: Copy caption to clipboard first
      try {
        await navigator.clipboard.writeText(caption);
        setMessage('Caption copied to clipboard ✓');
        trackFeature('caption_copied_auto', { location: 'export_dialog' });
      } catch (clipboardError) {
        console.warn('Could not copy caption to clipboard:', clipboardError);
        setMessage('Warning: Could not copy caption');
      }

      // Step 2: Convert data URL to blob for saving/sharing
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Step 3: Try to save to camera roll first (iOS/Android)
      let savedToCameraRoll = false;
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          // On iOS, sharing an image gives option to "Save to Photos"
          // We'll open share sheet which includes save option
          setMessage('Opening share options (includes Save to Photos)...');
          await navigator.share({
            title: 'AI Auto Selfie',
            text: caption,
            files: [file],
          });
          setMessage('Shared! Caption is in your clipboard.');
          savedToCameraRoll = true;
          trackFeature('web_share_success', { location: 'export_dialog' });
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 2000);
        } catch (shareError) {
          if ((shareError as Error).name === 'AbortError') {
            // User cancelled share sheet
            setMessage('Share cancelled. Caption is still copied.');
            setIsSharing(false);
            return;
          }
          // Share failed, fall through to download
          console.warn('Share failed, trying download:', shareError);
        }
      }
      
      // Step 4: Fallback to direct download if share not available or failed
      if (!savedToCameraRoll) {
        setMessage('Downloading image... Caption is copied - paste it in your post.');
        await downloadImage(imageDataUrl, { format: 'jpeg', quality: 95 });
        trackFeature('share_fallback_download', { location: 'export_dialog' });
        setMessage('Downloaded! Caption is in your clipboard - paste it when sharing.');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2500);
      }
    } catch (error) {
      console.error('Save/Share failed:', error);
      setMessage(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSharing(false);
    }
  }, [imageDataUrl, caption, onClose, onSuccess, trackFeature]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎉 Share Your Enhanced Photo"
      size="md"
      showCloseButton={true}
    >
      <div className="space-y-5">
        {/* AI-Generated Caption */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-white flex items-center gap-2">
              <span>✨</span> AI-Generated Caption
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
            <div className="p-4 bg-primary-500/10 rounded-lg border border-primary-500/30 flex items-center gap-3">
              <Icon type="spinner" className="w-5 h-5 text-primary-400 animate-spin flex-shrink-0" />
              <p className="text-sm text-primary-200">Writing the perfect caption for your photo...</p>
            </div>
          ) : (
            <>
              <textarea
                value={caption}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCaption(e.target.value)}
                rows={4}
                placeholder="Your AI-generated caption will appear here..."
                className="w-full p-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 resize-none transition-all"
              />
              <div className="text-xs text-slate-400 mt-2">
                {caption.length} characters
              </div>
            </>
          )}

          <div className="flex items-start gap-2 mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Icon type="info" className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-300">
              Caption will be copied to your clipboard. After sharing, paste it into your social media post!
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="p-4 bg-gradient-to-r from-primary-500/5 to-cyan-500/5 border border-primary-500/20 rounded-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span>📤</span> How This Works
          </h3>
          <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
            <li>Click "Save & Share" button below</li>
            <li>Choose where to save/share (Instagram, Messages, etc.)</li>
            <li>Photo saves automatically</li>
            <li>Paste the caption from your clipboard</li>
            <li>Post and watch the engagement! 🚀</li>
          </ol>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-lg border transition-all ${
            message.includes('failed') || message.includes('error')
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-primary-500/10 border-primary-500/30 text-primary-300'
          }`}>
            <p className="text-sm font-medium flex items-center gap-2">
              {message.includes('failed') || message.includes('error') ? '❌' : '✓'}
              {message}
            </p>
          </div>
        )}

        {/* Main Share Button */}
        <Button
          onClick={handleSharePhoto}
          variant="primary"
          size="lg"
          icon={<Icon type="share" />}
          disabled={isSharing || isGeneratingCaption}
          className="w-full text-base font-bold py-4"
        >
          {isSharing ? (
            <>
              <Icon type="spinner" className="w-5 h-5 mr-2 animate-spin" />
              Opening Share Sheet...
            </>
          ) : (
            '💾 Save & Share Photo'
          )}
        </Button>

        {/* Quick Actions */}
        <div className="pt-3 border-t border-slate-700 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</p>
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
                  setMessage('Photo saved! ✓');
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
        <Button
          onClick={onClose}
          variant="secondary"
          size="sm"
          className="w-full border-slate-700"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default ExportDialog;
