import React, { useState, useCallback } from 'react';
import { getFaceBeautyService, BeautySettings } from '../services/faceBeautyService';

interface FaceBeautyPanelProps {
  beautySettings: BeautySettings;
  onChange: (settings: BeautySettings) => void;
  onApplyPreset?: (presetName: string) => void;
}

const FaceBeautyPanel: React.FC<FaceBeautyPanelProps> = ({
  beautySettings,
  onChange,
  onApplyPreset,
}) => {
  const service = getFaceBeautyService();
  const presets = service.getAllPresets();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleSettingChange = useCallback(
    (setting: keyof BeautySettings, value: number) => {
      const newSettings = { ...beautySettings, [setting]: value };
      onChange(newSettings);
    },
    [beautySettings, onChange]
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

  const isActive =
    beautySettings.skinSmoothness > 0 ||
    beautySettings.skinBrightness !== 0 ||
    beautySettings.eyeBrightness !== 0 ||
    beautySettings.eyeSharpness > 0 ||
    beautySettings.cheekTint > 0 ||
    beautySettings.lipColor > 0 ||
    beautySettings.faceSharpening > 0;

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-lg">✨</span> Face Beauty Mode
          {isActive && <span className="text-xs bg-primary-600/40 text-primary-200 px-2 py-1 rounded">Active</span>}
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
                beautySettings === preset.settings
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
          {/* Skin Smoothing */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'skin' ? null : 'skin')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">💆 Skin Smoothness</span>
              <span className="text-xs text-slate-400">{beautySettings.skinSmoothness}%</span>
            </button>
            {expandedSection === 'skin' && (
              <div className="mt-2 px-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={beautySettings.skinSmoothness}
                  onChange={(e) => handleSettingChange('skinSmoothness', Number(e.target.value))}
                  className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                />
                <p className="text-xs text-slate-400 mt-1">Reduces blemishes and smooths skin texture</p>
              </div>
            )}
          </div>

          {/* Skin Brightness */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'brightness' ? null : 'brightness')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">☀️ Skin Brightness</span>
              <span className="text-xs text-slate-400">{beautySettings.skinBrightness > 0 ? '+' : ''}{beautySettings.skinBrightness}</span>
            </button>
            {expandedSection === 'brightness' && (
              <div className="mt-2 px-2">
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={beautySettings.skinBrightness}
                  onChange={(e) => handleSettingChange('skinBrightness', Number(e.target.value))}
                  className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                />
                <p className="text-xs text-slate-400 mt-1">Brightens overall skin tone</p>
              </div>
            )}
          </div>

          {/* Eye Brightness */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'eyes' ? null : 'eyes')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">👁️ Eye Brightness</span>
              <span className="text-xs text-slate-400">{beautySettings.eyeBrightness > 0 ? '+' : ''}{beautySettings.eyeBrightness}</span>
            </button>
            {expandedSection === 'eyes' && (
              <div className="mt-2 px-2 space-y-3">
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Brightness</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={beautySettings.eyeBrightness}
                    onChange={(e) => handleSettingChange('eyeBrightness', Number(e.target.value))}
                    className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Sharpness</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={beautySettings.eyeSharpness}
                    onChange={(e) => handleSettingChange('eyeSharpness', Number(e.target.value))}
                    className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                  />
                </div>
                <p className="text-xs text-slate-400">Makes eyes more awake and defined</p>
              </div>
            )}
          </div>

          {/* Face Color Enhancements */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'color' ? null : 'color')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">🎨 Color Enhancements</span>
              <span className="text-xs text-slate-400">
                {beautySettings.cheekTint > 0 || beautySettings.lipColor > 0 ? '✓' : '○'}
              </span>
            </button>
            {expandedSection === 'color' && (
              <div className="mt-2 px-2 space-y-3">
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Cheek Tint</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={beautySettings.cheekTint}
                    onChange={(e) => handleSettingChange('cheekTint', Number(e.target.value))}
                    className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 mb-1 block">Lip Color</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={beautySettings.lipColor}
                    onChange={(e) => handleSettingChange('lipColor', Number(e.target.value))}
                    className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                  />
                </div>
                <p className="text-xs text-slate-400">Adds natural warmth to cheeks and lips</p>
              </div>
            )}
          </div>

          {/* Face Sharpening */}
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'sharp' ? null : 'sharp')}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-200">⚡ Face Sharpening</span>
              <span className="text-xs text-slate-400">{beautySettings.faceSharpening}</span>
            </button>
            {expandedSection === 'sharp' && (
              <div className="mt-2 px-2">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={beautySettings.faceSharpening}
                  onChange={(e) => handleSettingChange('faceSharpening', Number(e.target.value))}
                  className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                />
                <p className="text-xs text-slate-400 mt-1">Enhances facial definition and clarity</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!isActive && (
        <p className="text-xs text-slate-400 text-center py-3">
          Select a preset or adjust settings to enhance your face
        </p>
      )}
    </div>
  );
};

export default FaceBeautyPanel;
