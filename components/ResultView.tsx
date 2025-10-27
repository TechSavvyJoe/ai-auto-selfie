import React, { useCallback } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';

interface ResultViewProps {
  imageSrc: string;
  onStartOver: () => void;
  onViewGallery: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ imageSrc, onStartOver, onViewGallery }) => {

  const handleSave = useCallback(() => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `dealership-social-${new Date().toISOString().slice(0, 19)}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageSrc]);

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center bg-black p-4">
      <div className="flex-grow flex items-center justify-center w-full h-full overflow-hidden my-16">
        <img src={imageSrc} alt="AI Enhanced selfie" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button onClick={onStartOver} variant="secondary" icon={<Icon type="retry" />} className="w-full sm:w-auto">
          Create New
        </Button>
        <Button onClick={onViewGallery} variant="secondary" icon={<Icon type="history" />} className="w-full sm:w-auto">
          Open Gallery
        </Button>
        <Button onClick={handleSave} variant="primary" icon={<Icon type="save" />} className="w-full sm:w-auto">
          Save to Device
        </Button>
      </div>
    </div>
  );
};

export default ResultView;
