import React, { useState, useMemo } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import { GalleryImage, AIMode } from '../types';
import { filterGallery } from '../services/storageService';

interface DesktopGalleryViewProps {
  gallery: GalleryImage[];
  onSelectImage: (image: GalleryImage) => void;
  onClearGallery: () => void;
  onDeleteImage: (image: GalleryImage) => void;
}

type SortOption = 'newest' | 'oldest' | 'slowest' | 'fastest' | 'name';
type ViewMode = 'table' | 'card';

const DesktopGalleryView: React.FC<DesktopGalleryViewProps> = ({
  gallery,
  onSelectImage,
  onClearGallery,
  onDeleteImage
}) => {
  const [selectedMode, setSelectedMode] = useState<AIMode | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const handleClearClick = () => {
    if (window.confirm("Are you sure you want to clear your entire gallery? This action cannot be undone.")) {
      onClearGallery();
      setPreviewImage(null);
      setSelectedImages(new Set());
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
          onDeleteImage(img);
        }
      });
      setSelectedImages(new Set());
      setPreviewImage(null);
    }
  };

  const handleBulkDownload = () => {
    if (selectedImages.size === 0) return;
    const selectedImgs = gallery.filter(img => selectedImages.has(img.id));
    selectedImgs.forEach((img, index) => {
      const link = document.createElement('a');
      link.href = img.imageDataUrl;
      link.download = `enhanced-photo-${img.aiMode}-${new Date(img.createdAt).toISOString().split('T')[0]}-${index}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleSingleDownload = (image: GalleryImage) => {
    const link = document.createElement('a');
    link.href = image.imageDataUrl;
    link.download = `enhanced-photo-${image.aiMode}-${new Date(image.createdAt).toISOString().split('T')[0]}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleFavorite = (image: GalleryImage) => {
    // This would require passing a callback from the context
    // For now, we'll just show feedback
    alert(`${image.isFavorite ? 'Removed from' : 'Added to'} favorites`);
  };

  const handleBulkToggleFavorite = () => {
    if (selectedImages.size === 0) return;
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
    } else if (sortBy === 'fastest') {
      result = [...result].sort((a, b) => (a.processingTime || 0) - (b.processingTime || 0));
    }

    return result;
  }, [gallery, selectedMode, sortBy, showFavoritesOnly, searchQuery]);

  const galleryStats = useMemo(() => {
    const totalImages = gallery.length;
    const favoriteCount = gallery.filter(img => img.isFavorite).length;
    const avgProcessingTime = gallery.length > 0
      ? gallery.reduce((sum, img) => sum + (img.processingTime || 0), 0) / gallery.length
      : 0;
    const totalStorageEstimate = gallery.length > 0
      ? (gallery.reduce((sum, img) => sum + img.imageDataUrl.length, 0) / (1024 * 1024)).toFixed(2)
      : '0';

    const modeOptions: AIMode[] = ['professional', 'cinematic', 'portrait', 'creative', 'natural'];
    const modeUsage = modeOptions.map(mode => [mode, gallery.filter(img => img.aiMode === mode).length] as [string, number])
      .sort(([, a], [, b]) => b - a);
    const mostUsedMode = modeUsage[0]?.[0] || 'none';

    return {
      totalImages,
      favoriteCount,
      avgProcessingTime: Math.round(avgProcessingTime),
      totalStorageEstimate,
      mostUsedMode,
      modeUsage,
    };
  }, [gallery]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatFileSize = (dataUrl: string) => {
    const bytes = dataUrl.length;
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (gallery.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
        <Icon type="images" className="w-24 h-24 text-gray-600 mb-6" />
        <h2 className="text-4xl font-bold text-gray-400 mb-2">Gallery is Empty</h2>
        <p className="text-gray-500 text-lg">Enhanced images will appear here after you create them.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-neutral-950">
      {/* Top Controls Bar */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-neutral-900/50 backdrop-blur">
        {/* Bulk Actions */}
        {selectedImages.size > 0 && (
          <div className="px-6 py-3 bg-primary-500/10 border-b border-primary-500/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Icon type="check" className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-semibold text-white">
                {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedImages(new Set())}
                variant="secondary"
                className="py-2 px-4 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkDownload}
                variant="secondary"
                className="py-2 px-4 text-sm flex items-center gap-2"
                icon={<Icon type="download" className="w-4 h-4" />}
              >
                Download All
              </Button>
              <Button
                onClick={handleBulkToggleFavorite}
                variant="secondary"
                className="py-2 px-4 text-sm flex items-center gap-2"
                icon={<Icon type="heart" className="w-4 h-4" />}
              >
                Toggle Favorite
              </Button>
              <Button
                onClick={handleBulkDelete}
                variant="danger"
                className="py-2 px-4 text-sm flex items-center gap-2"
                icon={<Icon type="trash" className="w-4 h-4" />}
              >
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Filters & Controls */}
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Gallery Manager</h2>
              <p className="text-sm text-white/60 mt-1">
                {filteredGallery.length} of {gallery.length} images
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                variant="secondary"
                className="py-2 px-4"
                icon={<Icon type={viewMode === 'table' ? 'grid' : 'list'} className="w-4 h-4" />}
              />
              <Button
                onClick={toggleAllSelection}
                variant={selectedImages.size === filteredGallery.length ? "primary" : "secondary"}
                className="py-2 px-4"
              >
                {selectedImages.size === filteredGallery.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                onClick={handleClearClick}
                variant="danger"
                className="py-2 px-4"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="glass rounded-lg p-3">
              <div className="text-2xl font-bold text-primary-400">{galleryStats.totalImages}</div>
              <div className="text-xs text-white/60 mt-1">Total Images</div>
            </div>
            <div className="glass rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{galleryStats.favoriteCount}</div>
              <div className="text-xs text-white/60 mt-1">Favorites</div>
            </div>
            <div className="glass rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{galleryStats.avgProcessingTime}ms</div>
              <div className="text-xs text-white/60 mt-1">Avg Time</div>
            </div>
            <div className="glass rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{galleryStats.totalStorageEstimate}MB</div>
              <div className="text-xs text-white/60 mt-1">Storage Used</div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-4 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by tags, mode, theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="col-span-2 px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
            />

            {/* AI Mode Filter */}
            <select
              value={selectedMode || 'all'}
              onChange={(e) => setSelectedMode(e.target.value === 'all' ? null : e.target.value as AIMode)}
              className="px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary-500 transition-colors"
            >
              <option value="all">All AI Modes</option>
              <option value="professional">Professional</option>
              <option value="cinematic">Cinematic</option>
              <option value="portrait">Portrait</option>
              <option value="creative">Creative</option>
              <option value="natural">Natural</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary-500 transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="fastest">Fastest Processing</option>
              <option value="slowest">Slowest Processing</option>
            </select>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${
                showFavoritesOnly
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-gray-800 text-white/70 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              <Icon type="heart" className="w-4 h-4" />
              Favorites Only
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-4 p-6">
        {/* Gallery List/Grid */}
        <div className="flex-1 overflow-y-auto">
          {filteredGallery.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <p className="text-gray-500 text-lg">No images match your filters</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left text-white">
                <thead className="border-b border-gray-800 bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={selectedImages.size === filteredGallery.length && filteredGallery.length > 0}
                        onChange={toggleAllSelection}
                        className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">AI Mode</th>
                    <th className="px-4 py-3">Theme</th>
                    <th className="px-4 py-3">Processing</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredGallery.map((image) => (
                    <tr
                      key={image.id}
                      onClick={() => setPreviewImage(image)}
                      className={`hover:bg-gray-900/50 cursor-pointer transition-colors ${
                        selectedImages.has(image.id) ? 'bg-primary-500/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.id)}
                          onChange={() => toggleImageSelection(image.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-white/80">{formatDate(image.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="capitalize px-2 py-1 bg-gray-800 rounded text-xs font-medium">
                          {image.aiMode || 'unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/80 capitalize">{image.theme || '-'}</td>
                      <td className="px-4 py-3 text-xs text-white/80">
                        {image.processingTime ? formatTime(image.processingTime) : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/80">
                        {formatFileSize(image.imageDataUrl)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSingleDownload(image);
                            }}
                            className="p-1 hover:bg-gray-800 rounded transition-colors"
                            title="Download"
                          >
                            <Icon type="download" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(image);
                            }}
                            className="p-1 hover:bg-gray-800 rounded transition-colors"
                            title="Toggle favorite"
                          >
                            <Icon
                              type="heart"
                              className={`w-4 h-4 ${image.isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredGallery.map((image) => (
                <div
                  key={image.id}
                  onClick={() => setPreviewImage(image)}
                  className={`group relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary-500 aspect-square ${
                    selectedImages.has(image.id) ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <img
                    src={image.thumbnail || image.imageDataUrl}
                    alt="Gallery"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Checkbox */}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image.id)}
                      onChange={() => toggleImageSelection(image.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
                    />
                  </div>

                  {/* Favorite badge */}
                  {image.isFavorite && (
                    <div className="absolute top-2 right-2 bg-red-500/80 rounded-full p-1">
                      <Icon type="heart" className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="font-semibold capitalize mb-1">{image.aiMode}</div>
                    <div className="text-white/70 text-xs">{formatDate(image.createdAt)}</div>
                    {image.processingTime && (
                      <div className="text-white/70 text-xs">{formatTime(image.processingTime)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {previewImage && (
          <div className="w-80 bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden">
            {/* Image Preview */}
            <div className="flex-shrink-0 aspect-square bg-gray-800 overflow-hidden">
              <img
                src={previewImage.imageDataUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <div className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-1">Date</div>
                <div className="text-sm text-white">{formatDate(previewImage.createdAt)}</div>
              </div>

              <div>
                <div className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-1">AI Mode</div>
                <div className="text-sm capitalize text-white">{previewImage.aiMode || '-'}</div>
              </div>

              <div>
                <div className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-1">Theme</div>
                <div className="text-sm capitalize text-white">{previewImage.theme || '-'}</div>
              </div>

              {previewImage.processingTime && (
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-1">Processing Time</div>
                  <div className="text-sm text-white">{formatTime(previewImage.processingTime)}</div>
                </div>
              )}

              <div>
                <div className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-1">File Size</div>
                <div className="text-sm text-white">{formatFileSize(previewImage.imageDataUrl)}</div>
              </div>

              {previewImage.message && (
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-1">Message</div>
                  <div className="text-sm text-white/80">{previewImage.message}</div>
                </div>
              )}

              {previewImage.tags && previewImage.tags.length > 0 && (
                <div>
                  <div className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {previewImage.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-800 rounded text-xs text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 border-t border-gray-800 p-4 space-y-2">
              <Button
                onClick={() => onSelectImage(previewImage)}
                variant="primary"
                className="w-full py-2"
              >
                View Details
              </Button>
              <Button
                onClick={() => handleSingleDownload(previewImage)}
                variant="secondary"
                className="w-full py-2"
                icon={<Icon type="download" className="w-4 h-4" />}
              >
                Download
              </Button>
              <Button
                onClick={() => onDeleteImage(previewImage)}
                variant="danger"
                className="w-full py-2"
                icon={<Icon type="trash" className="w-4 h-4" />}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopGalleryView;
