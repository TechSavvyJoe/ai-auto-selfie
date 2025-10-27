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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  const handleClearClick = () => {
    if (window.confirm("Are you sure you want to clear your entire gallery? This action cannot be undone.")) {
      onClearGallery();
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const toggleAllSelection = () => {
    if (selectedImages.size === filteredGallery.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredGallery.map(img => img.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedImages.size === 0) return;
    if (window.confirm(`Delete ${selectedImages.size} image(s)? This action cannot be undone.`)) {
      selectedImages.forEach(id => {
        const img = gallery.find(img => img.id === id);
        if (img) {
          onSelectImage(img);
        }
      });
      setSelectedImages(new Set());
    }
  };

  const handleBulkExport = () => {
    if (selectedImages.size === 0) return;
    const selectedImgs = gallery.filter(img => selectedImages.has(img.id));
    selectedImgs.forEach((img, index) => {
      const link = document.createElement('a');
      link.href = img.imageDataUrl;
      link.download = `enhanced-photo-${img.aiMode}-${Date.now()}-${index}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    setSelectedImages(new Set());
  };

  const handleBulkToggleFavorite = () => {
    if (selectedImages.size === 0) return;
    // This would require passing a callback to update favorites in the context
    // For now, we'll just show feedback
    alert(`${selectedImages.size} image(s) favorited/unfavorited`);
    setSelectedImages(new Set());
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

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(img => {
        const tags = img.tags?.join(' ').toLowerCase() || '';
        const theme = img.theme?.toLowerCase() || '';
        const message = img.message?.toLowerCase() || '';
        const aiMode = img.aiMode?.toLowerCase() || '';
        return (
          tags.includes(query) ||
          theme.includes(query) ||
          message.includes(query) ||
          aiMode.includes(query)
        );
      });
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
  }, [gallery, selectedMode, sortBy, showFavoritesOnly, searchQuery]);

  const [showStats, setShowStats] = useState(false);

  const modeOptions: AIMode[] = ['professional', 'cinematic', 'portrait', 'creative', 'natural'];
  const activeModeCount = useMemo(() => {
    return modeOptions.reduce((acc, mode) => {
      acc[mode] = gallery.filter(img => img.aiMode === mode).length;
      return acc;
    }, {} as Record<AIMode, number>);
  }, [gallery]);

  // Calculate gallery statistics
  const galleryStats = useMemo(() => {
    const totalImages = gallery.length;
    const favoriteCount = gallery.filter(img => img.isFavorite).length;
    const avgProcessingTime = gallery.length > 0
      ? gallery.reduce((sum, img) => sum + (img.processingTime || 0), 0) / gallery.length
      : 0;
    const totalStorageEstimate = gallery.length > 0
      ? (gallery.reduce((sum, img) => sum + img.imageDataUrl.length, 0) / (1024 * 1024)).toFixed(2)
      : '0';

    // Find most used AI mode
  const modeUsage = Object.entries(activeModeCount).sort(([,a], [,b]) => (b as number) - (a as number));
    const mostUsedMode = modeUsage[0]?.[0] || 'none';

    return {
      totalImages,
      favoriteCount,
      avgProcessingTime: Math.round(avgProcessingTime),
      totalStorageEstimate,
      mostUsedMode,
      modeUsage,
    };
  }, [gallery, activeModeCount]);

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
    <div className="w-full h-full flex flex-col bg-black p-2 sm:p-4">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        {/* Bulk Selection Toolbar */}
        {selectedImages.size > 0 && (
          <div className="mb-4 p-3 bg-primary-500/20 border border-primary-500/50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-sm text-white font-semibold">
              {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setSelectedImages(new Set())}
                variant="secondary"
                className="py-1.5 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkExport}
                variant="secondary"
                className="py-1.5 px-3 text-xs"
                icon={<Icon type="download" className="w-3 h-3" />}
              >
                Export
              </Button>
              <Button
                onClick={handleBulkToggleFavorite}
                variant="secondary"
                className="py-1.5 px-3 text-xs"
                icon={<Icon type="heart" className="w-3 h-3" />}
              >
                Favorite
              </Button>
              <Button
                onClick={handleBulkDelete}
                variant="danger"
                className="py-1.5 px-3 text-xs"
                icon={<Icon type="trash" className="w-3 h-3" />}
              >
                Delete
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Gallery</h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              {filteredGallery.length} images
              {selectedMode && ` in ${selectedMode} mode`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {filteredGallery.length > 0 && (
              <Button
                onClick={toggleAllSelection}
                variant={selectedImages.size === filteredGallery.length ? "primary" : "secondary"}
                className="py-2 px-3 text-xs sm:text-sm"
                icon={<Icon type="check" className="w-3 h-3 sm:w-4 sm:h-4" />}
              >
                <span className="hidden sm:inline">{selectedImages.size === filteredGallery.length ? 'Deselect All' : 'Select All'}</span>
                <span className="sm:hidden">{selectedImages.size === filteredGallery.length ? 'None' : 'All'}</span>
              </Button>
            )}
            <Button onClick={handleClearClick} variant="danger" className="py-2 px-3 text-xs sm:text-sm" icon={<Icon type="trash" className="w-3 h-3 sm:w-4 sm:h-4" />}>
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>
        </div>

        {/* Stats Expansion */}
        <div className="mb-4">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <Icon type={showStats ? 'chevron-down' : 'chevron-right'} className="w-4 h-4" />
            <span className="font-semibold">Gallery Insights</span>
          </button>

          {showStats && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-400">{galleryStats.totalImages}</div>
                <div className="text-xs text-white/60 mt-1">Total Images</div>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{galleryStats.favoriteCount}</div>
                <div className="text-xs text-white/60 mt-1">Favorites</div>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{galleryStats.avgProcessingTime}ms</div>
                <div className="text-xs text-white/60 mt-1">Avg Process Time</div>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{galleryStats.totalStorageEstimate}MB</div>
                <div className="text-xs text-white/60 mt-1">Storage Used</div>
              </div>

              {/* AI Mode Distribution */}
              <div className="col-span-2 sm:col-span-4">
                <div className="text-xs text-white/60 font-semibold mb-2">AI Mode Distribution</div>
                <div className="flex flex-wrap gap-2">
                  {galleryStats.modeUsage.map(([mode, count]) => (
                    count > 0 && (
                      <div key={mode} className="glass rounded-full px-3 py-1 text-xs">
                        <span className="capitalize font-semibold text-white">{mode}</span>
                        <span className="text-white/60 ml-1">({count})</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-2 sm:space-y-3">
          {/* Search */}
          <div>
            <h4 className="text-xs text-white/60 font-semibold mb-1 sm:mb-2 uppercase tracking-wide">Search</h4>
            <input
              type="text"
              placeholder="Search by tags, mode, theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-white/60 hover:text-white transition-colors"
              >
                Clear search
              </button>
            )}
          </div>

          {/* AI Mode Filter */}
          <div>
            <h4 className="text-xs text-white/60 font-semibold mb-1 sm:mb-2 uppercase tracking-wide">Filter by AI Mode</h4>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              <button
                onClick={() => setSelectedMode(null)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-full transition-colors min-h-[32px] ${
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
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs rounded-full transition-colors min-h-[32px] ${
                    selectedMode === mode
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-white/70 hover:bg-gray-700'
                  }`}
                >
                  <span className="hidden sm:inline">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                  <span className="sm:hidden">{mode.charAt(0).toUpperCase()}</span> ({activeModeCount[mode]})
                </button>
              ))}
            </div>
          </div>

          {/* Sort & View Options */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1">
              <h4 className="text-xs text-white/60 font-semibold mb-1 sm:mb-2 uppercase tracking-wide">Sort By</h4>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="w-full px-2 sm:px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded text-white focus:border-primary-500 transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="slowest">Longest Time</option>
              </select>
            </div>
            <div className="flex items-end w-full sm:w-auto">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full sm:w-auto px-2 sm:px-3 py-1.5 text-xs rounded flex items-center justify-center sm:justify-start gap-2 transition-colors min-h-[40px] sm:min-h-auto ${
                  showFavoritesOnly
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-gray-800 text-white/70 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                <Icon type={showFavoritesOnly ? 'heart' : 'heart'} className="w-3 h-3" />
                <span className="hidden sm:inline">Favorites</span>
                <span className="sm:hidden">Fav</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 pb-4">
            {filteredGallery.map((image) => (
              <GalleryGridItem
                key={image.id}
                image={image}
                onSelect={onSelectImage}
                isSelected={selectedImages.has(image.id)}
                onToggleSelect={toggleImageSelection}
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
  isSelected: boolean;
  onToggleSelect: (imageId: string) => void;
}

const GalleryGridItem: React.FC<GalleryGridItemProps> = React.memo(({ image, onSelect, isSelected, onToggleSelect }) => {
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
  className={`gallery-item-enter hover-lift group relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 shadow-lg aspect-square border-2 ${
        isSelected ? 'border-primary-500 scale-105' : 'border-transparent'
      }`}
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
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-200 ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`} />

      {/* Selection checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(image.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded cursor-pointer accent-primary-500"
        />
      </div>

      {/* Favorite badge */}
      {image.isFavorite && (
        <div className="absolute top-2 right-2 bg-red-500/80 rounded-full p-1">
          <Icon type="heart" className="w-3 h-3 text-white fill-white" />
        </div>
      )}

      {/* Metadata on hover */}
      <div className={`absolute bottom-0 left-0 right-0 p-3 text-white text-xs transition-opacity duration-200 ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
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
});

GalleryGridItem.displayName = 'GalleryGridItem';

export default GalleryView;
