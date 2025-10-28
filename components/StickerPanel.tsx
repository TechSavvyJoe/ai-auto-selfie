import React, { useState, useCallback, useMemo } from 'react';
import { getStickerLibraryService, Sticker } from '../services/stickerLibraryService';

interface StickerPanelProps {
  onSelectSticker: (sticker: Sticker) => void;
  onClose?: () => void;
}

const StickerPanel: React.FC<StickerPanelProps> = ({ onSelectSticker, onClose }) => {
  const service = getStickerLibraryService();
  const [selectedCategory, setSelectedCategory] = useState<Sticker['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrending, setShowTrending] = useState(true);

  const categories = service.getCategories();
  const allStickers = service.getAllStickers();

  // Filter stickers based on category and search
  const filteredStickers = useMemo(() => {
    let filtered = allStickers;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = service.search(searchQuery);
    }

    return filtered;
  }, [selectedCategory, searchQuery, allStickers, service]);

  // Get trending stickers
  const trendingStickers = useMemo(() => {
    return service.getTrendingStickers(15);
  }, [service]);

  const displayedStickers = showTrending && selectedCategory === 'all' && !searchQuery ? trendingStickers : filteredStickers;

  const handleStickerClick = useCallback(
    (sticker: Sticker) => {
      onSelectSticker(sticker);
    },
    [onSelectSticker]
  );

  return (
    <div className="w-full max-w-xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <h2 className="text-xl font-bold text-white">Sticker Library</h2>
          <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">{allStickers.length}+</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close stickers"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search stickers..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowTrending(false);
          }}
          className="w-full px-4 py-2 rounded-lg bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-500 focus:border-primary-500/50 outline-none text-sm"
        />

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setShowTrending(true);
              setSearchQuery('');
            }}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              selectedCategory === 'all' && showTrending
                ? 'bg-primary-600/40 text-primary-200 border border-primary-500/50'
                : 'bg-slate-700/40 text-slate-300 border border-slate-600/30 hover:border-primary-500/30'
            }`}
          >
            🔥 Trending ({trendingStickers.length})
          </button>
          {categories.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => {
                setSelectedCategory(id as Sticker['category']);
                setShowTrending(false);
              }}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                selectedCategory === id
                  ? 'bg-primary-600/40 text-primary-200 border border-primary-500/50'
                  : 'bg-slate-700/40 text-slate-300 border border-slate-600/30 hover:border-primary-500/30'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Sticker Grid */}
        <div className="grid grid-cols-6 gap-2">
          {displayedStickers.length > 0 ? (
            displayedStickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleStickerClick(sticker)}
                className="p-2 rounded-lg bg-slate-700/40 hover:bg-slate-700/60 border border-slate-600/50 hover:border-primary-500/50 transition-all group text-center"
                title={sticker.name}
              >
                <div
                  className={`text-center group-hover:scale-110 transition-transform ${
                    sticker.size === 'small'
                      ? 'text-xl'
                      : sticker.size === 'medium'
                        ? 'text-2xl'
                        : 'text-3xl'
                  }`}
                >
                  {sticker.content}
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-6 text-center py-8">
              <p className="text-sm text-slate-400">No stickers found</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setShowTrending(true);
                }}
                className="text-xs text-primary-400 hover:text-primary-300 mt-2 underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-slate-700/20 rounded-lg p-3 text-xs text-slate-400 border border-slate-600/30">
          <p>Click any sticker to add it to your photo. Stickers can be dragged and resized.</p>
        </div>
      </div>
    </div>
  );
};

export default StickerPanel;
