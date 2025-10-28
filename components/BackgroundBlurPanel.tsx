import React, { useState, useCallback } from 'react';
import { getBackgroundBlurService, BlurSettings } from '../services/backgroundBlurService';

interface BackgroundBlurPanelProps {
  blurSettings: BlurSettings;
  onChange: (settings: BlurSettings) => void;
  onApplyPreset?: (presetName: string) => void;
}

const BackgroundBlurPanel: React.FC<BackgroundBlurPanelProps> = ({
  blurSettings,
  onChange,
  onApplyPreset,
}) => {
  const service = getBackgroundBlurService();
  const presets = service.getAllPresets();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleSettingChange = useCallback(
    (setting: keyof BlurSettings, value: number | boolean) => {
      const newSettings = { ...blurSettings, [setting]: value };
      onChange(newSettings);
    },
    [blurSettings, onChange]
  );

  const handlePresetApply = useCallback(
    (presetName: string) => {
      const preset = service.getPreset(presetName);
      if (preset) {
        onChange(preset.settings);
        onApplyPreset?.(presetName);
      }
    },
    [service, onChange, onApplyPreset]
  );

  const handleReset = useCallback(() => {
    onChange(service.getDefaultSettings());
  }, [service, onChange]);

  const isActive = blurSettings.blurAmount > 0 || blurSettings.bokehIntensity > 0;

  const blurStrength = service.describeBlurStrength(blurSettings.blurAmount);

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-lg">🌫️</span> Background Blur
          {isActive && (
            <span className="text-xs bg-primary-600/40 text-primary-200 px-2 py-1 rounded">
              {blurStrength}
            </span>
          )}
        </h3>
        {isActive && (
          <button
            onClick={handleReset}
            className="text-xs px-2 py-1 rounded bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 transition-all"
          >
            Reset
          </button>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handlePresetApply(preset.name)}
            className="p-3 rounded-lg text-center transition-all group text-sm"
            title={preset.description}
          >
            <div
              className={`rounded-lg p-3 mb-2 transition-all ${
                blurSettings.blurAmount === preset.settings.blurAmount
                  ? 'bg-primary-600/40 border border-primary-500/50'
                  : 'bg-slate-700/40 border border-slate-600/50 group-hover:border-primary-500/30'
              }`}
            >
              <span className="text-xl">{preset.icon}</span>
            </div>
            <p className="text-xs font-medium text-slate-200">{preset.name}</p>
          </button>
        ))}
      </div>

      {/* Detailed Controls */}
      {isActive && (
        <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/30 space-y-4">
          {/* Blur Amount */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'blur' ? null : 'blur')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">💨 Blur Strength</span>
              <span className="text-xs text-slate-400">{blurSettings.blurAmount}%</span>
            </button>
            {expandedSection === 'blur' && (
              <div className="mt-2 px-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={blurSettings.blurAmount}
                  onChange={(e) => handleSettingChange('blurAmount', Number(e.target.value))}
                  className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                />
                <p className="text-xs text-slate-400 mt-1">0 = no blur, 100 = maximum blur</p>
              </div>
            )}
          </div>

          {/* Bokeh Settings */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'bokeh' ? null : 'bokeh')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">✨ Bokeh Effect</span>
              <span className="text-xs text-slate-400">
                {blurSettings.bokehIntensity > 0 ? '✓' : '○'}
              </span>
            </button>
            {expandedSection === 'bokeh' && (
              <div className="mt-2 px-2 space-y-3">
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Intensity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={blurSettings.bokehIntensity}
                    onChange={(e) => handleSettingChange('bokehIntensity', Number(e.target.value))}
                    className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Bokeh Size</label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={blurSettings.bokehSize}
                    onChange={(e) => handleSettingChange('bokehSize', Number(e.target.value))}
                    className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                  />
                </div>
                <p className="text-xs text-slate-400">Creates beautiful light orb effects in background</p>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'advanced' ? null : 'advanced')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">⚙️ Advanced</span>
              <span className="text-xs text-slate-400">
                {blurSettings.depthDetection || blurSettings.preserveEdges ? '✓' : '○'}
              </span>
            </button>
            {expandedSection === 'advanced' && (
              <div className="mt-2 px-2 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={blurSettings.depthDetection}
                    onChange={(e) => handleSettingChange('depthDetection', e.target.checked)}
                    className="w-4 h-4 rounded accent-primary-500"
                  />
                  <span className="text-xs text-slate-300">Smart Depth Detection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-700/30">
                  <input
                    type="checkbox"
                    checked={blurSettings.preserveEdges}
                    onChange={(e) => handleSettingChange('preserveEdges', e.target.checked)}
                    className="w-4 h-4 rounded accent-primary-500"
                  />
                  <span className="text-xs text-slate-300">Preserve Edge Details</span>
                </label>
                <p className="text-xs text-slate-400">
                  Depth detection separates subject from background. Preserve edges keeps face sharp.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!isActive && (
        <p className="text-xs text-slate-400 text-center py-3">
          Select a preset to blur background and create portrait mode effect
        </p>
      )}
    </div>
  );
};

export default BackgroundBlurPanel;
