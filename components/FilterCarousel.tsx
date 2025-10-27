/**
 * Filter Carousel Component
 * Interactive carousel for browsing and selecting image filter presets
 * Displays thumbnail previews with smooth scrolling and selection
 */

import React, { useRef, useState } from 'react';
import { FILTER_PRESETS, FilterPreset } from '../services/imageEditorService';
import Icon from './common/Icon';

export interface FilterCarouselProps {
  selectedFilter: string;
  onSelectFilter: (filterName: string) => void;
  previewImage: string;
}

export const FilterCarousel: React.FC<FilterCarouselProps> = ({
  selectedFilter,
  onSelectFilter,
  previewImage,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 200;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Filter Presets</h3>
        <span className="text-xs text-neutral-400">
          {FILTER_PRESETS.length} presets available
        </span>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Scroll Button */}
        {showLeftScroll && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-transparent hover:bg-gradient-to-r hover:from-neutral-800 hover:via-neutral-800/80 hover:to-transparent transition-all rounded-r-lg"
            aria-label="Scroll left"
          >
            <Icon type="chevronLeft" className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Filter Items */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {FILTER_PRESETS.map((preset) => (
            <FilterThumbnail
              key={preset.name}
              preset={preset}
              isSelected={selectedFilter === preset.name}
              onSelect={() => onSelectFilter(preset.name)}
              previewImage={previewImage}
            />
          ))}
        </div>

        {/* Right Scroll Button */}
        {showRightScroll && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gradient-to-l from-neutral-900 via-neutral-900/80 to-transparent hover:bg-gradient-to-l hover:from-neutral-800 hover:via-neutral-800/80 hover:to-transparent transition-all rounded-l-lg"
            aria-label="Scroll right"
          >
            <Icon type="chevronRight" className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Scrollbar Hide CSS */}
      <style>{`
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

interface FilterThumbnailProps {
  preset: FilterPreset;
  isSelected: boolean;
  onSelect: () => void;
  previewImage: string;
}

const FilterThumbnail: React.FC<FilterThumbnailProps> = ({
  preset,
  isSelected,
  onSelect,
  previewImage,
}) => {
  return (
    <button
      onClick={onSelect}
      className={`flex-shrink-0 relative group transition-all ${
        isSelected ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-neutral-900' : ''
      }`}
      aria-pressed={isSelected}
      title={preset.label}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-800 hover:bg-neutral-700 transition-colors">
        {/* Preview Image */}
        <img
          src={previewImage}
          alt={preset.label}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          style={{
            filter: `
              brightness(${100 + preset.adjustments.brightness || 0}%)
              contrast(${100 + preset.adjustments.contrast || 0}%)
              saturate(${100 + preset.adjustments.saturation || 0}%)
            `,
          }}
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 transition-all ${
            isSelected
              ? 'bg-primary-500/20'
              : 'bg-black/20 group-hover:bg-black/10'
          }`}
        />

        {/* Checkmark for selected */}
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
              <Icon type="check" className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-xs font-medium text-neutral-300 mt-1.5 text-center truncate">
        {preset.label}
      </p>
    </button>
  );
};

export default FilterCarousel;
