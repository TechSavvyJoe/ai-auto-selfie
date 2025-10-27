import React, { useCallback, useState } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import BeforeAfterSlider from './BeforeAfterSlider';
import { useToast } from './common/ToastContainer';

interface ResultViewProps {
  imageSrc: string;
  originalImage?: string;
  onStartOver: () => void;
  onViewGallery: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ imageSrc, originalImage, onStartOver, onViewGallery }) => {
  const { showToast } = useToast();
  const [showComparison, setShowComparison] = useState(false);

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
      </div>
    </div>
  );
};

export default ResultView;
