import React from 'react';
import Button from './common/Button';
import Icon from './common/Icon';

interface GalleryViewProps {
  gallery: string[];
  onSelectImage: (url: string, index: number) => void;
  onClearGallery: () => void;
}

const GalleryView: React.FC<GalleryViewProps> = ({ gallery, onSelectImage, onClearGallery }) => {
  const handleClearClick = () => {
    if (window.confirm("Are you sure you want to clear your entire gallery? This action cannot be undone.")) {
      onClearGallery();
    }
  };

  if (gallery.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-3xl font-bold text-gray-400">Your Gallery is Empty</h2>
        <p className="text-gray-500 mt-2">Enhanced images will appear here after you create them.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex-shrink-0 flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-bold text-white/90">My Gallery</h2>
        {gallery.length > 0 && (
            <Button onClick={handleClearClick} variant="danger" className="py-2 px-4 text-sm" icon={<Icon type="trash" className="w-4 h-4" />}>
                Clear All
            </Button>
        )}
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {gallery.map((imageUrl, index) => (
            <div
              key={index}
              className="group aspect-w-1 aspect-h-1 bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 ease-in-out shadow-lg relative"
              onClick={() => onSelectImage(imageUrl, index)}
            >
              <img src={imageUrl} alt={`Gallery item ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryView;
