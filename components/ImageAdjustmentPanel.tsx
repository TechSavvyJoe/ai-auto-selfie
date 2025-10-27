/**
 * Image Adjustment Panel Component
 * Advanced image editing controls with live preview, filters, and adjustments
 * Combines sliders, filter presets, and adjustment controls
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ImageAdjustments, DEFAULT_ADJUSTMENTS, getFilterPreset, buildFilterString } from '../services/imageEditorService';
import Slider from './common/Slider';
import FilterCarousel from './FilterCarousel';
import Button from './common/Button';
import Icon from './common/Icon';

export interface ImageAdjustmentPanelProps {
  imageSrc: string;
  onAdjustmentsChange: (adjustments: ImageAdjustments) => void;
  onClose?: () => void;
  compact?: boolean;
}

export const ImageAdjustmentPanel: React.FC<ImageAdjustmentPanelProps> = ({
  imageSrc,
  onAdjustmentsChange,
  onClose,
  compact = false,
}) => {
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [expandedSection, setExpandedSection] = useState<string | null>(
    compact ? null : 'basic'
  );

  // Build filter string for live preview
  const filterString = useMemo(() => buildFilterString(adjustments), [adjustments]);

  // Handle adjustment changes
  const handleAdjustmentChange = useCallback(
    (key: keyof ImageAdjustments, value: number) => {
      const newAdjustments = { ...adjustments, [key]: value };
      setAdjustments(newAdjustments);
      onAdjustmentsChange(newAdjustments);
    },
    [adjustments, onAdjustmentsChange]
  );

  // Handle filter selection
  const handleFilterSelect = useCallback(
    (filterName: string) => {
      setSelectedFilter(filterName);
      const preset = getFilterPreset(filterName);
      if (preset) {
        const newAdjustments = { ...adjustments, ...preset.adjustments };
        setAdjustments(newAdjustments);
        onAdjustmentsChange(newAdjustments);
      }
    },
    [adjustments, onAdjustmentsChange]
  );

  // Reset all adjustments
  const handleResetAll = useCallback(() => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSelectedFilter('original');
    onAdjustmentsChange(DEFAULT_ADJUSTMENTS);
  }, [onAdjustmentsChange]);

  const isModified =
    adjustments !== DEFAULT_ADJUSTMENTS || selectedFilter !== 'original';

  return (
    <div
      className={`flex flex-col gap-6 ${
        compact
          ? 'max-h-96 overflow-y-auto'
          : 'h-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Adjust Image</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="Close adjustments"
          >
            <Icon type="close" className="w-5 h-5 text-neutral-400" />
          </button>
        )}
      </div>

      {/* Live Preview */}
      <div className="relative bg-neutral-800 rounded-lg overflow-hidden aspect-square">
        <img
          src={imageSrc}
          alt="Preview"
          className="w-full h-full object-cover"
          style={{ filter: filterString }}
        />
        {isModified && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-primary-500/80 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
            Modified
          </div>
        )}
      </div>

      {/* Filter Carousel */}
      <FilterCarousel
        selectedFilter={selectedFilter}
        onSelectFilter={handleFilterSelect}
        previewImage={imageSrc}
      />

      {/* Adjustment Sections */}
      <div className="space-y-4">
        {/* Basic Adjustments */}
        <AdjustmentSection
          title="Tone & Exposure"
          icon="sliders"
          isExpanded={expandedSection === 'basic'}
          onToggle={() =>
            setExpandedSection(expandedSection === 'basic' ? null : 'basic')
          }
        >
          <div className="space-y-4">
            <Slider
              label="Brightness"
              icon="☀️"
              value={adjustments.brightness}
              onChange={(value) => handleAdjustmentChange('brightness', value)}
              onReset={() => handleAdjustmentChange('brightness', 0)}
              unit="%"
            />
            <Slider
              label="Contrast"
              icon="⚖️"
              value={adjustments.contrast}
              onChange={(value) => handleAdjustmentChange('contrast', value)}
              onReset={() => handleAdjustmentChange('contrast', 0)}
              unit="%"
            />
            <Slider
              label="Highlights"
              icon="✨"
              value={adjustments.highlights}
              onChange={(value) => handleAdjustmentChange('highlights', value)}
              onReset={() => handleAdjustmentChange('highlights', 0)}
              unit="%"
            />
            <Slider
              label="Shadows"
              icon="🌑"
              value={adjustments.shadows}
              onChange={(value) => handleAdjustmentChange('shadows', value)}
              onReset={() => handleAdjustmentChange('shadows', 0)}
              unit="%"
            />
          </div>
        </AdjustmentSection>

        {/* Color Adjustments */}
        <AdjustmentSection
          title="Color & Vibrancy"
          icon="palette"
          isExpanded={expandedSection === 'color'}
          onToggle={() =>
            setExpandedSection(expandedSection === 'color' ? null : 'color')
          }
        >
          <div className="space-y-4">
            <Slider
              label="Saturation"
              icon="🎨"
              value={adjustments.saturation}
              onChange={(value) => handleAdjustmentChange('saturation', value)}
              onReset={() => handleAdjustmentChange('saturation', 0)}
              unit="%"
            />
            <Slider
              label="Temperature"
              icon="🔥"
              value={adjustments.temperature}
              onChange={(value) => handleAdjustmentChange('temperature', value)}
              onReset={() => handleAdjustmentChange('temperature', 0)}
              min={-50}
              max={50}
              unit="K"
            />
            <Slider
              label="Hue Shift"
              icon="🌈"
              value={adjustments.hue}
              onChange={(value) => handleAdjustmentChange('hue', value)}
              onReset={() => handleAdjustmentChange('hue', 0)}
              min={0}
              max={360}
              unit="°"
            />
          </div>
        </AdjustmentSection>

        {/* Detail Adjustments */}
        <AdjustmentSection
          title="Detail & Clarity"
          icon="sparkles"
          isExpanded={expandedSection === 'detail'}
          onToggle={() =>
            setExpandedSection(expandedSection === 'detail' ? null : 'detail')
          }
        >
          <div className="space-y-4">
            <Slider
              label="Sharpen"
              icon="🔍"
              value={adjustments.sharpen}
              onChange={(value) => handleAdjustmentChange('sharpen', value)}
              onReset={() => handleAdjustmentChange('sharpen', 0)}
              min={0}
              max={10}
            />
            <Slider
              label="Blur"
              icon="💨"
              value={adjustments.blur}
              onChange={(value) => handleAdjustmentChange('blur', value)}
              onReset={() => handleAdjustmentChange('blur', 0)}
              min={0}
              max={20}
            />
          </div>
        </AdjustmentSection>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-neutral-800">
        {isModified && (
          <Button
            onClick={handleResetAll}
            variant="secondary"
            size="sm"
            icon={<Icon type="redo" />}
            className="flex-1"
          >
            Reset All
          </Button>
        )}
        {onClose && (
          <Button
            onClick={onClose}
            variant="primary"
            size="sm"
            icon={<Icon type="check" />}
            className="flex-1"
          >
            Done
          </Button>
        )}
      </div>
    </div>
  );
};

interface AdjustmentSectionProps {
  title: string;
  icon?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AdjustmentSection: React.FC<AdjustmentSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <span className="font-semibold text-white">{title}</span>
        </div>
        <Icon
          type={isExpanded ? 'chevronUp' : 'chevronDown'}
          className="w-5 h-5 text-neutral-400 transition-transform"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isExpanded && (
        <div className="px-4 py-4 bg-neutral-800/30 space-y-3 border-t border-neutral-800">
          {children}
        </div>
      )}
    </div>
  );
};

export default ImageAdjustmentPanel;
