import React, { useState, useMemo } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import { GalleryImage, AIMode } from '../types';
import { filterGallery } from '../services/storageService';

interface GalleryViewProps {
  gallery: GalleryImage[];
  onSelectImage: (image: GalleryImage) => void;
  onClearGallery: () => void;
}

type SortOption = 'newest' | 'oldest' | 'slowest';

const GalleryView: React.FC<GalleryViewProps> = ({ gallery, onSelectImage, onClearGallery }) => {
  const [selectedMode, setSelectedMode] = useState<AIMode | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const handleClearClick = () => {
    if (window.confirm("Are you sure you want to clear your entire gallery? This action cannot be undone.")) {
      onClearGallery();
    }
  };

  // Apply filters
  const filteredGallery = useMemo(() => {
    let result = gallery;

    if (selectedMode) {
      result = filterGallery({ aiMode: selectedMode });
    }

    if (showFavoritesOnly) {
      result = result.filter(img => img.isFavorite);
    }

    // Sort
    if (sortBy === 'newest') {
      result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'oldest') {
      result = [...result].sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === 'slowest') {
      result = [...result].sort((a, b) => (b.processingTime || 0) - (a.processingTime || 0));
    }

    return result;
  }, [gallery, selectedMode, sortBy, showFavoritesOnly]);

  const modeOptions: AIMode[] = ['professional', 'cinematic', 'portrait', 'creative', 'natural'];
  const activeModeCount = useMemo(() => {
    return modeOptions.reduce((acc, mode) => {
      acc[mode] = gallery.filter(img => img.aiMode === mode).length;
      return acc;
    }, {} as Record<AIMode, number>);
  }, [gallery]);

  if (gallery.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
        <Icon type="images" className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-3xl font-bold text-gray-400">Your Gallery is Empty</h2>
        <p className="text-gray-500 mt-2">Enhanced images will appear here after you create them.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black p-4">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Gallery</h2>
            <p className="text-sm text-white/60 mt-1">{filteredGallery.length} images {selectedMode ? `in ${selectedMode} mode` : ''}</p>
          </div>
          <Button onClick={handleClearClick} variant="danger" className="py-2 px-4 text-sm" icon={<Icon type="trash" className="w-4 h-4" />}>
            Clear All
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* AI Mode Filter */}
          <div>
            <h4 className="text-xs text-white/60 font-semibold mb-2 uppercase tracking-wide">Filter by AI Mode</h4>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedMode(null)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  selectedMode === null
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800 text-white/70 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {modeOptions.map(mode => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    selectedMode === mode
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-white/70 hover:bg-gray-700'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)} ({activeModeCount[mode]})
                </button>
              ))}
            </div>
          </div>

          {/* Sort & View Options */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <h4 className="text-xs text-white/60 font-semibold mb-2 uppercase tracking-wide">Sort By</h4>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded text-white focus:border-primary-500 transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="slowest">Longest Processing Time</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-3 py-1.5 text-xs rounded flex items-center gap-2 transition-colors ${
                  showFavoritesOnly
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-gray-800 text-white/70 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <Icon type={showFavoritesOnly ? 'heart' : 'heart'} className="w-3 h-3" />
                Favorites
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-grow overflow-y-auto">
        {filteredGallery.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-gray-500">No images match your filters</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-4">
            {filteredGallery.map((image) => (
              <GalleryGridItem
                key={image.id}
                image={image}
                onSelect={onSelectImage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface GalleryGridItemProps {
  image: GalleryImage;
  onSelect: (image: GalleryImage) => void;
}

const GalleryGridItem: React.FC<GalleryGridItemProps> = ({ image, onSelect }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div
      className="group relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 shadow-lg aspect-square"
      onClick={() => onSelect(image)}
    >
      {/* Image */}
      <img
        src={image.thumbnail || image.imageDataUrl}
        alt="Gallery"
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Favorite badge */}
      {image.isFavorite && (
        <div className="absolute top-2 right-2 bg-red-500/80 rounded-full p-1">
          <Icon type="heart" className="w-3 h-3 text-white fill-white" />
        </div>
      )}

      {/* Metadata on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold capitalize">{image.aiMode || 'unknown'}</span>
          {image.processingTime && (
            <span className="text-white/60">{formatTime(image.processingTime)}</span>
          )}
        </div>
        <div className="text-white/70">{formatDate(image.createdAt)}</div>
      </div>
    </div>
  );
};

export default GalleryView;
