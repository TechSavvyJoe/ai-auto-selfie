import React, { useCallback, useState } from 'react';
import { PremiumButton } from './common/PremiumButton';
import Icon from './common/Icon';
import BeforeAfterSlider from './BeforeAfterSlider';
import { useToast } from './common/ToastContainer';
import CaptionEditor from './CaptionEditor';
import { useAppContext } from '../context/AppContext';
import ExportDialog from './ExportDialog';
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

  const handleCaptionSave = useCallback((newCaption: string) => {
    updateCaption(newCaption);
    showToast('Caption updated!', 'success');
    trackFeature('edit_caption', { location: 'result_view' });
  }, [updateCaption, showToast, trackFeature]);

  // Consolidated Save/Share handled via ExportDialog

  return (
    <div className="w-full h-full relative flex flex-col bg-gradient-to-b from-slate-900 via-black to-black p-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-slate-800/50 mb-4">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
          ✨ Your Enhanced Photo
        </h1>
        {originalImage && (
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
              showComparison
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
            title={showComparison ? 'Hide comparison' : 'Show before/after comparison'}
          >
            <Icon type="compare" className="w-4 h-4" />
            {showComparison ? 'Hide Comparison' : 'Compare'}
          </button>
        )}
      </div>

      {/* Image Display */}
      <div className="flex-grow flex items-center justify-center w-full overflow-hidden rounded-2xl bg-black/50 border border-slate-700/50 shadow-inner mb-4">
        {showComparison && originalImage ? (
          <BeforeAfterSlider
            beforeImage={originalImage}
            afterImage={imageSrc}
            beforeLabel="Original"
            afterLabel="Enhanced"
          />
        ) : (
          <img
            src={imageSrc}
            alt="AI Enhanced selfie"
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Auto-caption Editor */}
      {autoCaption && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-blue-500/10 border border-primary-500/30 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✏️</span>
            <h3 className="font-semibold text-white">AI-Generated Caption</h3>
          </div>
          <CaptionEditor
            caption={autoCaption}
            onSave={handleCaptionSave}
            compactMode={true}
            className="mb-2"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 pt-4 border-t border-slate-800/50">
        <div className="flex flex-col gap-3 flex-grow sm:flex-row">
          <PremiumButton
            onClick={onStartOver}
            variant="secondary"
            icon={<Icon type="retry" className="w-4 h-4" />}
            size="md"
            className="flex-1"
          >
            <span className="font-semibold">Create New</span>
          </PremiumButton>
          <PremiumButton
            onClick={onViewGallery}
            variant="secondary"
            icon={<Icon type="history" className="w-4 h-4" />}
            size="md"
            className="flex-1"
          >
            <span className="font-semibold">View Gallery</span>
          </PremiumButton>
        </div>
        <PremiumButton
          onClick={() => setShowExport(true)}
          variant="primary"
          icon={<Icon type="share" className="w-5 h-5" />}
          size="md"
          className="sm:w-auto flex-1 sm:flex-none"
        >
          <span className="font-bold">Save & Share</span>
        </PremiumButton>
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
