import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import Button from './common/Button';
import { PremiumButton } from './common/PremiumButton';
import Icon from './common/Icon';
import GalleryCard from './GalleryCard';
import EnhancedImagePreview from './EnhancedImagePreview';
import SmartRecommendations from './SmartRecommendations';
import { GalleryImage, AIMode } from '../types';
import { filterGallery } from '../services/storageService';
import { getAIImageAnalysisService } from '../services/aiImageAnalysisService';

const GalleryAnalytics = lazy(() => import('./GalleryAnalytics'));

interface EnhancedDesktopGalleryViewProps {
  gallery: GalleryImage[];
  onSelectImage: (image: GalleryImage) => void;
  onClearGallery: () => void;
  onDeleteImage: (image: GalleryImage) => void;
}

type SortOption = 'newest' | 'oldest' | 'slowest' | 'fastest' | 'quality' | 'name';
type ViewMode = 'grid' | 'table' | 'list' | 'compact';
type TimelineView = 'all' | 'today' | 'week' | 'month';

const EnhancedDesktopGalleryView: React.FC<EnhancedDesktopGalleryViewProps> = ({
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
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [timelineFilter, setTimelineFilter] = useState<TimelineView>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const handleClearClick = () => {
    if (window.confirm("Are you sure you want to clear your entire gallery? This action cannot be undone.")) {
      onClearGallery();
      setPreviewImage(null);
      setSelectedImages(new Set());
    }
  };

  const toggleImageSelection = useCallback((imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  }, []);

  const toggleAllSelection = useCallback(() => {
    if (selectedImages.size === filteredGallery.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredGallery.map(img => img.id)));
    }
  }, [selectedImages.size]);

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
      const date = new Date(img.createdAt).toISOString().split('T')[0];
      link.download = `enhanced-${img.aiMode}-${date}-${index}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleSingleDownload = (image: GalleryImage) => {
    const link = document.createElement('a');
    link.href = image.imageDataUrl;
    const date = new Date(image.createdAt).toISOString().split('T')[0];
    link.download = `enhanced-${image.aiMode}-${date}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter by timeline
  const getTimelineFilteredGallery = (imgs: GalleryImage[]): GalleryImage[] => {
    if (timelineFilter === 'all') return imgs;

    const now = new Date();
    const filterDate = new Date();

    if (timelineFilter === 'today') {
      filterDate.setHours(0, 0, 0, 0);
    } else if (timelineFilter === 'week') {
      filterDate.setDate(now.getDate() - 7);
    } else if (timelineFilter === 'month') {
      filterDate.setMonth(now.getMonth() - 1);
    }

    return imgs.filter(img => new Date(img.createdAt) >= filterDate);
  };

  // Apply filters
  const filteredGallery = useMemo(() => {
    let result = gallery;

    // AI Mode filter
    if (selectedMode) {
      result = result.filter(img => img.aiMode === selectedMode);
    }

    // Theme filter
    if (selectedTheme) {
      result = result.filter(img => img.theme === selectedTheme);
    }

    // Favorites filter
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

    // Timeline filter
    result = getTimelineFilteredGallery(result);

    // Sort
    const sorted = [...result];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === 'slowest') {
      sorted.sort((a, b) => (b.processingTime || 0) - (a.processingTime || 0));
    } else if (sortBy === 'fastest') {
      sorted.sort((a, b) => (a.processingTime || 0) - (b.processingTime || 0));
    }

    return sorted;
  }, [gallery, selectedMode, selectedTheme, sortBy, showFavoritesOnly, searchQuery, timelineFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalImages = gallery.length;
    const favoriteCount = gallery.filter(img => img.isFavorite).length;
    const avgProcessingTime = totalImages > 0
      ? gallery.reduce((sum, img) => sum + (img.processingTime || 0), 0) / totalImages
      : 0;
    const totalStorage = totalImages > 0
      ? gallery.reduce((sum, img) => sum + img.imageDataUrl.length, 0) / (1024 * 1024)
      : 0;

    const modeOptions: AIMode[] = ['professional', 'cinematic', 'portrait', 'creative', 'natural'];
    const modeUsage = modeOptions.map(mode => ({
      mode,
      count: gallery.filter(img => img.aiMode === mode).length
    }));

    const themes = [...new Set(gallery.map(img => img.theme).filter(Boolean))];

    return {
      totalImages,
      favoriteCount,
      avgProcessingTime: Math.round(avgProcessingTime),
      totalStorage: totalStorage.toFixed(2),
      modeUsage,
      themes: themes as string[],
      filteredCount: filteredGallery.length,
    };
  }, [gallery, filteredGallery.length]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (gallery.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-10 blur-3xl bg-gradient-aurora" />
        </div>
        <div className="relative z-10">
          <Icon type="images" className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-400 mb-2">Gallery is Empty</h2>
          <p className="text-gray-500 text-lg">Create your first enhanced photo to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-neutral-950 overflow-hidden">
      {/* Header with Stats */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gradient-to-r from-neutral-900 via-neutral-900 to-gray-900">
        {/* Bulk Actions Bar */}
        {selectedImages.size > 0 && (
          <div className="px-6 py-3 bg-primary-500/10 border-b border-primary-500/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Icon type="check" className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-semibold text-white">
                {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <PremiumButton onClick={() => setSelectedImages(new Set())} variant="secondary" size="sm">
                Cancel
              </PremiumButton>
              <PremiumButton
                onClick={handleBulkDownload}
                variant="secondary"
                size="sm"
                icon={<Icon type="download" className="w-4 h-4" />}
              >
                Download All
              </PremiumButton>
              <PremiumButton
                onClick={handleBulkDelete}
                variant="danger"
                size="sm"
                icon={<Icon type="trash" className="w-4 h-4" />}
              >
                Delete
              </PremiumButton>
            </div>
          </div>
        )}

        {/* Title and Controls */}
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Gallery Manager
              </h2>
              <p className="text-sm text-white/60 mt-1">
                {stats.filteredCount} of {stats.totalImages} images
              </p>
            </div>
            <div className="flex gap-2">
              <PremiumButton
                onClick={() => setShowAnalytics(!showAnalytics)}
                variant="secondary"
                size="sm"
                icon={<Icon type="bar-chart" className="w-4 h-4" />}
              >
                Analytics
              </PremiumButton>
              <PremiumButton
                onClick={toggleAllSelection}
                variant={selectedImages.size === filteredGallery.length ? "primary" : "secondary"}
                size="sm"
              >
                {selectedImages.size === filteredGallery.length ? 'Deselect' : 'Select All'}
              </PremiumButton>
              <PremiumButton
                onClick={handleClearClick}
                variant="danger"
                size="sm"
                icon={<Icon type="trash" className="w-4 h-4" />}
              >
                Clear All
              </PremiumButton>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { icon: '🖼️', label: 'Total', value: stats.totalImages },
              { icon: '❤️', label: 'Favorites', value: stats.favoriteCount },
              { icon: '⚡', label: 'Avg Time', value: `${stats.avgProcessingTime}ms` },
              { icon: '💾', label: 'Storage', value: `${stats.totalStorage}MB` },
              { icon: '🎯', label: 'Filtered', value: stats.filteredCount },
            ].map((stat, idx) => (
              <div key={idx} className="glass rounded-lg px-3 py-2 text-center hover:bg-white/15 transition-colors">
                <div className="text-lg mb-0.5">{stat.icon}</div>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-6 gap-3">
            {/* Search */}
            <div className="col-span-2">
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            {/* AI Mode */}
            <select
              value={selectedMode || 'all'}
              onChange={(e) => setSelectedMode(e.target.value === 'all' ? null : e.target.value as AIMode)}
              className="px-4 py-2.5 text-sm bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-primary-500 transition-colors"
            >
              <option value="all">All AI Modes</option>
              <option value="professional">Professional</option>
              <option value="cinematic">Cinematic</option>
              <option value="portrait">Portrait</option>
              <option value="creative">Creative</option>
              <option value="natural">Natural</option>
            </select>

            {/* Theme */}
            {stats.themes.length > 0 && (
              <select
                value={selectedTheme || 'all'}
                onChange={(e) => setSelectedTheme(e.target.value === 'all' ? null : e.target.value)}
                className="px-4 py-2.5 text-sm bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-primary-500 transition-colors"
              >
                <option value="all">All Themes</option>
                {stats.themes.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            )}

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 text-sm bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-primary-500 transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="fastest">Fastest Processing</option>
              <option value="slowest">Slowest Processing</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-800/50 border border-gray-700 rounded-lg p-1">
              {(['grid', 'list', 'compact'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    viewMode === mode
                      ? 'bg-primary-500 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title={mode}
                >
                  {mode === 'grid' && <Icon type="grid" className="w-4 h-4 mx-auto" />}
                  {mode === 'list' && <Icon type="list" className="w-4 h-4 mx-auto" />}
                  {mode === 'compact' && <Icon type="grid" className="w-4 h-4 mx-auto" />}
                </button>
              ))}
            </div>

            {/* Favorites */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2.5 text-sm rounded-lg font-semibold transition-colors ${
                showFavoritesOnly
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-gray-800/50 text-white/70 border border-gray-700 hover:bg-gray-800'
              }`}
            >
              <Icon type="heart" className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline Filter */}
          <div className="flex gap-2">
            {(['all', 'today', 'week', 'month'] as TimelineView[]).map(timeline => (
              <button
                key={timeline}
                onClick={() => setTimelineFilter(timeline)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  timelineFilter === timeline
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-800/50 text-white/70 hover:bg-gray-800'
                }`}
              >
                {timeline === 'all' ? 'All Time' : `Last ${timeline}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-4 p-6">
        {/* Gallery */}
        <div className="flex-1 overflow-y-auto">
          {filteredGallery.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Icon type="search" className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No images match your filters</p>
              </div>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-3 gap-4'
                  : viewMode === 'compact'
                  ? 'grid grid-cols-5 gap-3'
                  : 'space-y-3'
              }
            >
              {filteredGallery.map((image) => (
                <GalleryCard
                  key={image.id}
                  image={image}
                  isSelected={selectedImages.has(image.id)}
                  onSelect={() => setPreviewImage(image)}
                  onToggleSelect={(e) => {
                    e.stopPropagation();
                    toggleImageSelection(image.id);
                  }}
                  onPreview={() => setPreviewImage(image)}
                  onDownload={() => handleSingleDownload(image)}
                  onDelete={() => onDeleteImage(image)}
                  variant={viewMode === 'list' ? 'list' : viewMode === 'compact' ? 'compact' : 'grid'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="w-96 flex flex-col gap-4">
          {previewImage && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col overflow-hidden shadow-2xl flex-1">
              <EnhancedImagePreview
                image={previewImage}
                onClose={() => setPreviewImage(null)}
                onDownload={() => handleSingleDownload(previewImage)}
                onDelete={() => {
                  onDeleteImage(previewImage);
                  setPreviewImage(null);
                }}
                similarImages={[]}
              />
            </div>
          )}

          {!previewImage && gallery.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-800 p-4 shadow-2xl flex-1 overflow-y-auto">
              <SmartRecommendations
                gallery={gallery}
                onImageSelect={(image) => setPreviewImage(image)}
              />
            </div>
          )}
        </div>

        {/* Analytics Modal */}
        {showAnalytics && (
          <Suspense fallback={<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center"><div className="animate-spin"><Icon type="loader" className="w-8 h-8 text-white" /></div></div>}>
            <GalleryAnalytics
              gallery={gallery}
              onClose={() => setShowAnalytics(false)}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default EnhancedDesktopGalleryView;
