import React, { useCallback, useState } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import { GalleryImage } from '../types';
import * as storage from '../services/storageService';
import { uploadImage, isUploadConfigured } from '../services/uploadService';
import { useAnalytics } from '../services/analyticsService';

interface GalleryDetailViewProps {
  image: GalleryImage;
  onDelete: (imageId: string) => void;
}

const GalleryDetailView: React.FC<GalleryDetailViewProps> = ({ image, onDelete }) => {
  const [isFavorited, setIsFavorited] = useState(image.isFavorite || false);
  const [showMetadata, setShowMetadata] = useState(true);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploadAvailable = isUploadConfigured();
  const { trackFeature } = useAnalytics();

  const handleSave = useCallback(() => {
    const link = document.createElement('a');
    link.href = image.imageDataUrl;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `enhanced-photo-${image.aiMode || 'custom'}-${timestamp}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [image]);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this image from your gallery?")) {
      onDelete(image.id);
    }
  };

  const handleToggleFavorite = () => {
    const newFavorite = !isFavorited;
    setIsFavorited(newFavorite);
    storage.updateImageMetadata(image.id, { isFavorite: newFavorite });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center bg-black p-4">
      {/* Header with back button and title */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-10">
        <h2 className="text-xl font-bold text-white">Image Details</h2>
        <button
          onClick={() => setShowMetadata(!showMetadata)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Toggle metadata"
        >
          <Icon type="info" className="w-5 h-5 text-white/70 hover:text-white" />
        </button>
      </div>

      {/* Image Display */}
      <div className="flex-grow flex items-center justify-center w-full h-full overflow-hidden my-16">
        <img
          src={image.imageDataUrl}
          alt="Gallery detail"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Metadata Panel (Left Side) */}
      {showMetadata && (
        <div className="absolute left-0 top-0 bottom-0 w-64 bg-black/90 border-r border-white/10 overflow-y-auto p-4 hidden md:flex flex-col gap-4 pt-20">
          <div>
            <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">AI Enhancements</h3>
            <div className="space-y-2 text-sm">
              {image.aiMode && (
                <div className="flex justify-between">
                  <span className="text-white/70">Mode:</span>
                  <span className="text-white font-medium capitalize">{image.aiMode}</span>
                </div>
              )}
              {image.enhancementLevel && (
                <div className="flex justify-between">
                  <span className="text-white/70">Level:</span>
                  <span className="text-white font-medium capitalize">{image.enhancementLevel}</span>
                </div>
              )}
              {image.theme && (
                <div className="flex justify-between">
                  <span className="text-white/70">Theme:</span>
                  <span className="text-white font-medium capitalize">{image.theme}</span>
                </div>
              )}
            </div>
          </div>

          {image.adjustments && Object.values(image.adjustments).some(v => v !== 0) && (
            <div>
              <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">Adjustments</h3>
              <div className="space-y-1 text-xs">
                {image.adjustments.exposure !== 0 && (
                  <div className="flex justify-between text-white/70">
                    <span>Exposure:</span>
                    <span className="text-white">{image.adjustments.exposure > 0 ? '+' : ''}{image.adjustments.exposure}%</span>
                  </div>
                )}
                {image.adjustments.contrast !== 0 && (
                  <div className="flex justify-between text-white/70">
                    <span>Contrast:</span>
                    <span className="text-white">{image.adjustments.contrast > 0 ? '+' : ''}{image.adjustments.contrast}%</span>
                  </div>
                )}
                {image.adjustments.temperature !== 0 && (
                  <div className="flex justify-between text-white/70">
                    <span>Temperature:</span>
                    <span className="text-white">{image.adjustments.temperature > 0 ? '+' : ''}{image.adjustments.temperature}K</span>
                  </div>
                )}
                {image.adjustments.saturation !== 0 && (
                  <div className="flex justify-between text-white/70">
                    <span>Saturation:</span>
                    <span className="text-white">{image.adjustments.saturation > 0 ? '+' : ''}{image.adjustments.saturation}%</span>
                  </div>
                )}
                {image.adjustments.sharpen !== 0 && (
                  <div className="flex justify-between text-white/70">
                    <span>Sharpen:</span>
                    <span className="text-white">{image.adjustments.sharpen}/10</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Created:</span>
                <span className="text-white text-xs">{formatDate(image.createdAt)}</span>
              </div>
              {image.processingTime && (
                <div className="flex justify-between">
                  <span className="text-white/70">Processing:</span>
                  <span className="text-white">{formatTime(image.processingTime)}</span>
                </div>
              )}
            </div>
          </div>

          {image.message && (
            <div>
              <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">Message</h3>
              <p className="text-sm text-white/80 break-words">{image.message}</p>
            </div>
          )}

          {image.autoCaption && (
            <div>
              <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">Auto-Caption</h3>
              <p className="text-sm text-white/80 break-words mb-2">{image.autoCaption}</p>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(image.autoCaption || '');
                      trackFeature('copy_caption', { location: 'history_detail' });
                    } catch (e) {
                      // ignore
                    }
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Copy Caption
                </Button>

                {uploadAvailable && (
                  <Button
                    onClick={async () => {
                      if (!uploadAvailable) return;
                      try {
                        setIsUploading(true);
                        const { url } = await uploadImage(image.imageDataUrl, { fileName: `ai-auto-selfie-${image.id}.jpg` });
                        setUploadedUrl(url);
                        trackFeature('history_upload_share', { id: image.id });
                        // open share links by default
                        window.open(url, '_blank');
                      } catch (err) {
                        // ignore
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                    variant="primary"
                    size="sm"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload & Open Link'}
                  </Button>
                )}
              </div>
              {uploadedUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <input readOnly aria-label="uploaded link" title="uploaded link" value={uploadedUrl} className="flex-1 p-2 bg-neutral-900 rounded text-xs text-white" />
                  <Button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(uploadedUrl);
                        trackFeature('copy_uploaded_link', { location: 'history_detail' });
                      } catch (e) {}
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Copy Link
                  </Button>
                </div>
              )}
            </div>
          )}

          {image.ctaText && (
            <div>
              <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">CTA</h3>
              <p className="text-sm text-white/80 break-words">{image.ctaText}</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 to-transparent flex justify-center items-center gap-3 flex-wrap">
        <Button
          onClick={handleToggleFavorite}
          variant={isFavorited ? 'primary' : 'secondary'}
          icon={<Icon type="heart" className={isFavorited ? 'fill-current' : ''} />}
          className="flex-1 min-w-[120px]"
        >
          {isFavorited ? 'Favorited' : 'Favorite'}
        </Button>
        <Button
          onClick={handleDelete}
          variant="danger"
          icon={<Icon type="trash" />}
          className="flex-1 min-w-[120px]"
        >
          Delete
        </Button>
        <Button
          onClick={handleSave}
          variant="primary"
          icon={<Icon type="download" />}
          className="flex-1 min-w-[120px]"
        >
          Download
        </Button>
      </div>
    </div>
  );
};

export default GalleryDetailView;
