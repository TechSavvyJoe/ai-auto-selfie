import React, { useState, useCallback } from 'react';
import { getColorGradingService, ColorGrade } from '../services/colorGradingService';

interface ColorGradingPanelProps {
  colorGrade: ColorGrade;
  onChange: (grade: ColorGrade) => void;
  previewElement?: HTMLImageElement;
}

const ColorGradingPanel: React.FC<ColorGradingPanelProps> = ({ colorGrade, onChange }) => {
  const service = getColorGradingService();
  const allPresets = service.getAllPresets();
  const [selectedMood, setSelectedMood] = useState<'all' | 'warm' | 'cool' | 'neutral' | 'artistic' | 'dramatic'>('all');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handlePresetApply = useCallback(
    (preset: ColorGrade) => {
      onChange(preset);
    },
    [onChange]
  );

  const handleFilterChange = useCallback(
    (filterName: keyof ColorGrade['filters'], value: number) => {
      onChange({
        ...colorGrade,
        filters: {
          ...colorGrade.filters,
          [filterName]: value,
        },
      });
    },
    [colorGrade, onChange]
  );

  const handleReset = useCallback(() => {
    onChange(service.getDefault());
  }, [service, onChange]);

  const filteredPresets =
    selectedMood === 'all'
      ? allPresets
      : service.getByMood(selectedMood);

  const isCustom =
    colorGrade.name !== 'Normal' &&
    !allPresets.find(
      (p) =>
        p.name === colorGrade.name &&
        JSON.stringify(p.filters) === JSON.stringify(colorGrade.filters)
    );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-lg">🎨</span> Color Grading
          {colorGrade.name !== 'Normal' && (
            <span className="text-xs bg-primary-600/40 text-primary-200 px-2 py-1 rounded">
              {colorGrade.name}
            </span>
          )}
        </h3>
        {colorGrade.name !== 'Normal' && (
          <button
            onClick={handleReset}
            className="text-xs px-2 py-1 rounded bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 transition-all"
          >
            Reset
          </button>
        )}
      </div>

      {/* Mood Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'warm', 'cool', 'neutral', 'artistic', 'dramatic'].map((mood) => (
          <button
            key={mood}
            onClick={() => setSelectedMood(mood as typeof selectedMood)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              selectedMood === mood
                ? 'bg-primary-600/40 text-primary-200 border border-primary-500/50'
                : 'bg-slate-700/40 text-slate-300 border border-slate-600/30 hover:border-primary-500/30'
            }`}
          >
            {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </button>
        ))}
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Normal/Default option */}
        <button
          onClick={() => handlePresetApply(service.getDefault())}
          className={`p-3 rounded-lg text-center transition-all group text-xs ${
            colorGrade.name === 'Normal'
              ? 'bg-primary-600/40 border border-primary-500/50'
              : 'bg-slate-700/40 border border-slate-600/50 hover:border-primary-500/30'
          }`}
        >
          <div className="text-2xl mb-1">⭕</div>
          <p className="font-medium text-slate-200">Normal</p>
        </button>

        {/* All other presets */}
        {filteredPresets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handlePresetApply(preset)}
            className={`p-3 rounded-lg text-center transition-all group text-xs ${
              colorGrade.name === preset.name && !isCustom
                ? 'bg-primary-600/40 border border-primary-500/50'
                : 'bg-slate-700/40 border border-slate-600/50 hover:border-primary-500/30'
            }`}
            title={preset.description}
          >
            <div className="text-2xl mb-1">{preset.icon}</div>
            <p className="font-medium text-slate-200 truncate">{preset.name}</p>
            <p className="text-xs text-slate-400 truncate">{preset.description}</p>
          </button>
        ))}
      </div>

      {/* Detailed Controls */}
      {isCustom && (
        <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/30 space-y-3">
          <p className="text-xs text-slate-400 mb-3">Custom Grade Adjustments</p>

          {/* Brightness */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'brightness' ? null : 'brightness')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">☀️ Brightness</span>
              <span className="text-xs text-slate-400">{colorGrade.filters.brightness > 0 ? '+' : ''}{colorGrade.filters.brightness}</span>
            </button>
            {expandedSection === 'brightness' && (
              <div className="mt-2 px-2">
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={colorGrade.filters.brightness}
                  onChange={(e) => handleFilterChange('brightness', Number(e.target.value))}
                  className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                />
              </div>
            )}
          </div>

          {/* Contrast */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'contrast' ? null : 'contrast')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">⚫ Contrast</span>
              <span className="text-xs text-slate-400">{colorGrade.filters.contrast > 0 ? '+' : ''}{colorGrade.filters.contrast}</span>
            </button>
            {expandedSection === 'contrast' && (
              <div className="mt-2 px-2">
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={colorGrade.filters.contrast}
                  onChange={(e) => handleFilterChange('contrast', Number(e.target.value))}
                  className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                />
              </div>
            )}
          </div>

          {/* Saturation */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'saturation' ? null : 'saturation')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">🌈 Saturation</span>
              <span className="text-xs text-slate-400">{colorGrade.filters.saturation > 0 ? '+' : ''}{colorGrade.filters.saturation}</span>
            </button>
            {expandedSection === 'saturation' && (
              <div className="mt-2 px-2">
                <input
                  type="range"
                  min="-50"
                  max="100"
                  value={colorGrade.filters.saturation}
                  onChange={(e) => handleFilterChange('saturation', Number(e.target.value))}
                  className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                />
              </div>
            )}
          </div>

          {/* Hue Rotate */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'hue' ? null : 'hue')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">🎨 Hue Rotate</span>
              <span className="text-xs text-slate-400">{colorGrade.filters.hueRotate}°</span>
            </button>
            {expandedSection === 'hue' && (
              <div className="mt-2 px-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={colorGrade.filters.hueRotate}
                  onChange={(e) => handleFilterChange('hueRotate', Number(e.target.value))}
                  className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                />
              </div>
            )}
          </div>

          {/* Sepia */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'sepia' ? null : 'sepia')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">📽️ Sepia</span>
              <span className="text-xs text-slate-400">{colorGrade.filters.sepia}%</span>
            </button>
            {expandedSection === 'sepia' && (
              <div className="mt-2 px-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={colorGrade.filters.sepia}
                  onChange={(e) => handleFilterChange('sepia', Number(e.target.value))}
                  className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorGradingPanel;
