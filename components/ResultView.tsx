import React, { useCallback, useState, lazy } from 'react';
import { PremiumButton } from './common/PremiumButton';
import Icon from './common/Icon';
import BeforeAfterSlider from './BeforeAfterSlider';
import { useToast } from './common/ToastContainer';
import CaptionEditor from './CaptionEditor';
import { useAppContext } from '../context/AppContext';
import { shareViaWebShare } from '../services/exportService';
import { useAnalytics } from '../services/analyticsService';
import { getSmartDownloadService } from '../services/smartDownloadService';

const PremiumExportDialog = lazy(() => import('./PremiumExportDialog'));

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

  const handleSave = useCallback(async () => {
    try {
      const downloadService = getSmartDownloadService();
      const result = await downloadService.smartDownload(imageSrc, 'enhanced-photo');

      if (result.success) {
        showToast(result.message, 'success');
        trackFeature('download_image', { method: result.method, platform: result.platform });
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      showToast('Failed to save image. Please try again.', 'error');
      console.error('Save error:', error);
    }
  }, [imageSrc, showToast, trackFeature]);

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
            <PremiumButton
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
              size="sm"
              icon={<Icon type="copy" className="w-3 h-3" />}
            >
              Copy
            </PremiumButton>
            {'share' in navigator && (
              <PremiumButton onClick={handleQuickShare} variant="primary" size="sm" disabled={isQuickSharing} icon={<span>✨</span>}>
                {isQuickSharing ? 'Sharing…' : 'Quick Share'}
              </PremiumButton>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-md flex flex-col sm:flex-row justify-center items-center gap-4">
        {originalImage && (
          <PremiumButton
            onClick={() => setShowComparison(!showComparison)}
            variant={showComparison ? 'primary' : 'secondary'}
            icon={<Icon type="compare" className="w-4 h-4" />}
            size="md"
            className="w-full sm:w-auto"
          >
            {showComparison ? '✓ Compare' : 'Compare'}
          </PremiumButton>
        )}
        <PremiumButton onClick={onStartOver} variant="secondary" size="md" icon={<Icon type="retry" className="w-4 h-4" />} className="w-full sm:w-auto">
          Create New
        </PremiumButton>
        <PremiumButton onClick={onViewGallery} variant="secondary" size="md" icon={<Icon type="history" className="w-4 h-4" />} className="w-full sm:w-auto">
          Gallery
        </PremiumButton>
        <PremiumButton onClick={handleSave} variant="primary" size="md" icon={<Icon type="download" className="w-4 h-4" />} className="w-full sm:w-auto">
          Download
        </PremiumButton>
        <PremiumButton onClick={() => setShowExport(true)} variant="success" size="md" icon={<Icon type="share" className="w-4 h-4" />} className="w-full sm:w-auto">
          Share
        </PremiumButton>
      </div>

      <PremiumExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        imageDataUrl={imageSrc}
        defaultCaption={autoCaption || ''}
      />
    </div>
  );
};

export default React.memo(ResultView);
