import React, { useCallback } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';

interface GalleryDetailViewProps {
  image: { url: string; index: number };
  onDelete: (index: number) => void;
}

const GalleryDetailView: React.FC<GalleryDetailViewProps> = ({ image, onDelete }) => {

  const handleSave = useCallback(() => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `dealership-social-gallery-${image.index}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [image]);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this image from your gallery?")) {
        onDelete(image.index);
    }
  }

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center bg-black p-4">
      <div className="flex-grow flex items-center justify-center w-full h-full overflow-hidden my-16">
        <img src={image.url} alt={`Gallery image ${image.index}`} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center space-x-4">
        <Button onClick={handleDelete} variant="danger" icon={<Icon type="trash" />}>
          Delete
        </Button>
        <Button onClick={handleSave} variant="primary" icon={<Icon type="save" />}>
          Save Image
        </Button>
      </div>
    </div>
  );
};

export default GalleryDetailView;
