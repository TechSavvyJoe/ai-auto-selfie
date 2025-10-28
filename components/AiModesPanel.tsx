import React, { useState, useCallback } from 'react';
import { getAiModesService, AIMode } from '../services/aiModesService';

interface AiModesPanelProps {
  selectedMode: AIMode;
  onChange: (mode: AIMode) => void;
  useCase?: 'selfie' | 'portrait' | 'landscape' | 'product' | 'creative';
}

const AiModesPanel: React.FC<AiModesPanelProps> = ({ selectedMode, onChange, useCase = 'selfie' }) => {
  const service = getAiModesService();
  const [selectedCategory, setSelectedCategory] = useState<AIMode['category'] | 'all' | 'recommended'>('recommended');

  const categories = service.getCategories();
  const allModes = service.getAllModes();
  const recommendedModes = useCase ? service.getRecommended(useCase) : [];

  const handleModeSelect = useCallback(
    (mode: AIMode) => {
      onChange(mode);
    },
    [onChange]
  );

  // Filter modes based on selected category
  let displayedModes: AIMode[] = [];
  if (selectedCategory === 'recommended') {
    displayedModes = recommendedModes.length > 0 ? recommendedModes : allModes;
  } else if (selectedCategory === 'all') {
    displayedModes = allModes;
  } else {
    displayedModes = service.getByCategory(selectedCategory);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-lg">🤖</span> AI Enhancement Mode
          <span className="text-xs bg-primary-600/40 text-primary-200 px-2 py-1 rounded">
            {selectedMode.name}
          </span>
        </h3>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {recommendedModes.length > 0 && (
          <button
            onClick={() => setSelectedCategory('recommended')}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              selectedCategory === 'recommended'
                ? 'bg-primary-600/40 text-primary-200 border border-primary-500/50'
                : 'bg-slate-700/40 text-slate-300 border border-slate-600/30 hover:border-primary-500/30'
            }`}
          >
            ⭐ Recommended
          </button>
        )}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`text-xs px-3 py-1.5 rounded-full transition-all ${
            selectedCategory === 'all'
              ? 'bg-primary-600/40 text-primary-200 border border-primary-500/50'
              : 'bg-slate-700/40 text-slate-300 border border-slate-600/30 hover:border-primary-500/30'
          }`}
        >
          All ({allModes.length})
        </button>
        {categories.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id as AIMode['category'])}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              selectedCategory === id
                ? 'bg-primary-600/40 text-primary-200 border border-primary-500/50'
                : 'bg-slate-700/40 text-slate-300 border border-slate-600/30 hover:border-primary-500/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-3 gap-2">
        {displayedModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeSelect(mode)}
            className={`p-4 rounded-lg transition-all text-center group ${
              selectedMode.id === mode.id
                ? 'bg-primary-600/40 border-2 border-primary-500/60'
                : 'bg-slate-700/40 border border-slate-600/50 hover:border-primary-500/50'
            }`}
            title={mode.description}
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{mode.icon}</div>
            <p className="text-xs font-semibold text-slate-200 mb-1">{mode.name}</p>
            <p className="text-xs text-slate-400 line-clamp-2">{mode.description}</p>
          </button>
        ))}
      </div>

      {/* Mode Details */}
      {selectedMode && (
        <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/30 space-y-3">
          <h4 className="text-xs font-semibold text-slate-200">Enhancement Settings</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Brightness:</span>
              <span className="text-slate-200">
                {selectedMode.settings.brightness > 0 ? '+' : ''}{selectedMode.settings.brightness}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Contrast:</span>
              <span className="text-slate-200">
                {selectedMode.settings.contrast > 0 ? '+' : ''}{selectedMode.settings.contrast}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Saturation:</span>
              <span className="text-slate-200">
                {selectedMode.settings.saturation > 0 ? '+' : ''}{selectedMode.settings.saturation}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sharpness:</span>
              <span className="text-slate-200">
                {selectedMode.settings.sharpness > 0 ? '+' : ''}{selectedMode.settings.sharpness}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Warmth:</span>
              <span className="text-slate-200">
                {selectedMode.settings.warmth > 0 ? '+' : ''}{selectedMode.settings.warmth}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-slate-700/20 rounded-lg p-3 text-xs text-slate-400 border border-slate-600/30">
        <p>
          {selectedCategory === 'recommended'
            ? `Recommended modes for ${useCase} photos. Choose one to enhance your image.`
            : 'Select any AI mode to enhance your photo with optimized settings.'}
        </p>
      </div>
    </div>
  );
};

export default AiModesPanel;
