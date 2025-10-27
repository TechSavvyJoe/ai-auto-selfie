import React, { useCallback, useState } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import BeforeAfterSlider from './BeforeAfterSlider';
import { useToast } from './common/ToastContainer';
import ExportDialog from './ExportDialog';
import CaptionEditor from './CaptionEditor';
import { useAppContext } from '../context/AppContext';
import { shareViaWebShare } from '../services/exportService';
import { useAnalytics } from '../services/analyticsService';

interface ResultViewProps {
  imageSrc: string;
  originalImage?: string;
  onStartOver: () => void;
  onViewGallery: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ imageSrc, originalImage, onStartOver, onViewGallery }) => {
  const { showToast } = useToast();
  const { autoCaption, updateCaption } = useAppContext();
  const { trackFeature } = useAnalytics();
  const [showComparison, setShowComparison] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isQuickSharing, setIsQuickSharing] = useState(false);

  const handleCaptionSave = useCallback((newCaption: string) => {
    updateCaption(newCaption);
    showToast('Caption updated!', 'success');
    trackFeature('edit_caption', { location: 'result_view' });
  }, [updateCaption, showToast, trackFeature]);

  const handleSave = useCallback(() => {
    try {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = `enhanced-photo-${new Date().toISOString().slice(0, 10)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Image downloaded successfully!', 'success');
    } catch (error) {
      showToast('Failed to download image', 'error');
      console.error('Download error:', error);
    }
  }, [imageSrc, showToast]);

  const handleQuickShare = useCallback(async () => {
    if (!('share' in navigator)) {
      showToast('Device sharing not supported here', 'warning');
      setShowExport(true);
      return;
    }
    try {
      setIsQuickSharing(true);
      await shareViaWebShare(imageSrc, {
        platform: 'facebook',
        title: 'AI Auto Selfie',
        message: autoCaption || undefined,
      });
      showToast('Opening device share…', 'success');
    } catch (error) {
      showToast('Quick share failed, opening dialog', 'warning');
      setShowExport(true);
    } finally {
      setIsQuickSharing(false);
    }
  }, [imageSrc, autoCaption, showToast]);

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center bg-black p-4">
      <div className="flex-grow flex items-center justify-center w-full h-full overflow-hidden my-16">
        {showComparison && originalImage ? (
          <BeforeAfterSlider
            beforeImage={originalImage}
            afterImage={imageSrc}
            beforeLabel="Original"
            afterLabel="Enhanced"
          />
        ) : (
          <img src={imageSrc} alt="AI Enhanced selfie" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        )}
      </div>
      
      {/* Auto-caption bubble */}
      {autoCaption && (
        <div className="absolute bottom-24 left-4 right-4 sm:left-auto sm:right-4 max-w-2xl p-4 rounded-xl bg-neutral-900/80 border border-neutral-700 shadow-lg backdrop-blur-md">
          <CaptionEditor
            caption={autoCaption}
            onSave={handleCaptionSave}
            compactMode={true}
            className="mb-2"
          />
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(autoCaption);
                  trackFeature('copy_caption', { location: 'result_view' });
                  showToast('Caption copied', 'success');
                } catch {
                  showToast('Copy failed', 'error');
                }
              }}
              variant="secondary"
              size="xs"
            >
              Copy Caption
            </Button>
            {'share' in navigator && (
              <Button onClick={handleQuickShare} variant="primary" size="xs" disabled={isQuickSharing}>
                {isQuickSharing ? 'Sharing…' : 'Quick Share'}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col sm:flex-row justify-center items-center gap-4">
        {originalImage && (
          <Button
            onClick={() => setShowComparison(!showComparison)}
            variant={showComparison ? 'primary' : 'secondary'}
            icon={<Icon type="compare" />}
            className="w-full sm:w-auto"
            title="Toggle before/after comparison"
          >
            {showComparison ? 'Hide' : 'Compare'}
          </Button>
        )}
        <Button onClick={onStartOver} variant="secondary" icon={<Icon type="retry" />} className="w-full sm:w-auto">
          Create New
        </Button>
        <Button onClick={onViewGallery} variant="secondary" icon={<Icon type="history" />} className="w-full sm:w-auto">
          Open Gallery
        </Button>
        <Button onClick={handleSave} variant="primary" icon={<Icon type="download" />} className="w-full sm:w-auto">
          Download
        </Button>
        <Button onClick={() => setShowExport(true)} variant="primary" icon={<Icon type="share" />} className="w-full sm:w-auto">
          Share
        </Button>
      </div>

      <ExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        imageDataUrl={imageSrc}
        defaultCaption={autoCaption || ''}
      />
    </div>
  );
};

export default React.memo(ResultView);
