import React, { useState, useCallback } from 'react';

export interface TextEffect {
  glowIntensity: number; // 0-100
  outlineWidth: number; // 0-10px
  outlineColor: string; // hex color
  shadowX: number; // -20 to 20px
  shadowY: number; // -20 to 20px
  shadowBlur: number; // 0-50px
  shadowColor: string; // hex color with alpha
  effectType: 'none' | 'glow' | 'outline' | 'shadow' | 'neon' | 'dramatic';
}

interface TextEffectsPanelProps {
  effect: TextEffect;
  onChange: (effect: TextEffect) => void;
  previewText: string;
  baseColor: string;
}

const EFFECT_PRESETS = {
  none: { label: '✨ None', description: 'No extra effects' },
  glow: { label: '🌟 Glow', description: 'Soft glowing effect' },
  outline: { label: '📐 Outline', description: 'Bold outline stroke' },
  shadow: { label: '🌑 Shadow', description: 'Deep shadow depth' },
  neon: { label: '⚡ Neon', description: 'Bright neon glow' },
  dramatic: { label: '🎭 Dramatic', description: 'High contrast effect' },
};

const TextEffectsPanel: React.FC<TextEffectsPanelProps> = ({
  effect,
  onChange,
  previewText,
  baseColor,
}) => {
  const [expandedSection, setExpandedSection] = useState<'glow' | 'outline' | 'shadow' | null>(null);

  const handleEffectTypeChange = useCallback((effectType: TextEffect['effectType']) => {
    const newEffect = { ...effect, effectType };

    // Set default values based on effect type
    if (effectType === 'glow') {
      newEffect.glowIntensity = 50;
      newEffect.shadowBlur = 25;
      newEffect.shadowColor = `${baseColor}80`;
    } else if (effectType === 'outline') {
      newEffect.outlineWidth = 3;
      newEffect.outlineColor = '#000000';
    } else if (effectType === 'shadow') {
      newEffect.shadowX = 4;
      newEffect.shadowY = 4;
      newEffect.shadowBlur = 15;
      newEffect.shadowColor = '#00000080';
    } else if (effectType === 'neon') {
      newEffect.glowIntensity = 80;
      newEffect.shadowBlur = 35;
      newEffect.shadowColor = `${baseColor}B3`;
    } else if (effectType === 'dramatic') {
      newEffect.shadowX = 6;
      newEffect.shadowY = 6;
      newEffect.shadowBlur = 20;
      newEffect.shadowColor = '#00000099';
      newEffect.outlineWidth = 2;
      newEffect.outlineColor = '#000000';
    }

    onChange(newEffect);
  }, [effect, baseColor, onChange]);

  const handleGlowChange = useCallback((intensity: number) => {
    onChange({
      ...effect,
      glowIntensity: intensity,
      shadowBlur: Math.max(10, intensity * 0.5), // Scale shadow blur with glow
      shadowColor: `${baseColor}${Math.round(intensity * 2.55).toString(16).padStart(2, '0')}`,
    });
  }, [effect, baseColor, onChange]);

  const handleOutlineChange = useCallback((width: number, color: string = effect.outlineColor) => {
    onChange({
      ...effect,
      outlineWidth: width,
      outlineColor: color,
    });
  }, [effect, onChange]);

  const handleShadowChange = useCallback((x: number, y: number, blur: number, color: string) => {
    onChange({
      ...effect,
      shadowX: x,
      shadowY: y,
      shadowBlur: blur,
      shadowColor: color,
    });
  }, [effect, onChange]);

  // Calculate text shadow CSS based on effect
  const getTextShadowStyle = (): string => {
    const shadows: string[] = [];

    if (effect.effectType === 'glow' || effect.effectType === 'neon') {
      // Multiple layers for glow effect
      for (let i = 1; i <= 3; i++) {
        const blur = effect.shadowBlur * i;
        shadows.push(`0 0 ${blur}px ${effect.shadowColor}`);
      }
    } else if (effect.effectType === 'outline') {
      // Outline effect using multiple shadows
      const directions = [
        [-effect.outlineWidth, -effect.outlineWidth],
        [-effect.outlineWidth, 0],
        [-effect.outlineWidth, effect.outlineWidth],
        [0, -effect.outlineWidth],
        [0, effect.outlineWidth],
        [effect.outlineWidth, -effect.outlineWidth],
        [effect.outlineWidth, 0],
        [effect.outlineWidth, effect.outlineWidth],
      ];
      directions.forEach(([dx, dy]) => {
        shadows.push(`${dx}px ${dy}px 0 ${effect.outlineColor}`);
      });
    } else if (effect.effectType === 'shadow' || effect.effectType === 'dramatic') {
      shadows.push(`${effect.shadowX}px ${effect.shadowY}px ${effect.shadowBlur}px ${effect.shadowColor}`);
    }

    // Add outline shadow if dramatic effect
    if (effect.effectType === 'dramatic' && effect.outlineWidth > 0) {
      const directions = [
        [-effect.outlineWidth, -effect.outlineWidth],
        [-effect.outlineWidth, 0],
        [-effect.outlineWidth, effect.outlineWidth],
        [0, -effect.outlineWidth],
        [0, effect.outlineWidth],
        [effect.outlineWidth, -effect.outlineWidth],
        [effect.outlineWidth, 0],
        [effect.outlineWidth, effect.outlineWidth],
      ];
      directions.forEach(([dx, dy]) => {
        shadows.push(`${dx}px ${dy}px 0 ${effect.outlineColor}`);
      });
    }

    return shadows.join(', ');
  };

  return (
    <div className="space-y-4">
      {/* Effect Type Selector */}
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">
          Text Effects
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(EFFECT_PRESETS).map(([type, { label, description }]) => (
            <button
              key={type}
              onClick={() => handleEffectTypeChange(type as TextEffect['effectType'])}
              className={`p-3 rounded-lg transition-all text-center text-xs font-medium ${
                effect.effectType === type
                  ? 'bg-primary-600/40 border border-primary-500/60 text-primary-200'
                  : 'bg-slate-700/40 border border-slate-600/50 text-slate-300 hover:border-primary-500/50'
              }`}
              title={description}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Effect Controls */}
      {effect.effectType !== 'none' && (
        <div className="space-y-3 bg-slate-700/20 rounded-lg p-4 border border-slate-600/30">
          {/* Glow Controls */}
          {(effect.effectType === 'glow' || effect.effectType === 'neon' || effect.effectType === 'dramatic') && (
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'glow' ? null : 'glow')}
                className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
              >
                <span className="text-xs font-semibold text-slate-200">🌟 Glow Intensity</span>
                <span className="text-xs text-slate-400">{effect.glowIntensity}%</span>
              </button>
              {expandedSection === 'glow' && (
                <div className="mt-2 px-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={effect.glowIntensity}
                    onChange={(e) => handleGlowChange(Number(e.target.value))}
                    className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Outline Controls */}
          {(effect.effectType === 'outline' || effect.effectType === 'dramatic') && (
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'outline' ? null : 'outline')}
                className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
              >
                <span className="text-xs font-semibold text-slate-200">📐 Outline</span>
                <span className="text-xs text-slate-400">{effect.outlineWidth}px</span>
              </button>
              {expandedSection === 'outline' && (
                <div className="mt-2 space-y-2 px-2">
                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Width</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={effect.outlineWidth}
                      onChange={(e) => handleOutlineChange(Number(e.target.value))}
                      className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Color</label>
                    <input
                      type="color"
                      value={effect.outlineColor}
                      onChange={(e) => handleOutlineChange(effect.outlineWidth, e.target.value)}
                      className="w-full h-8 rounded cursor-pointer border border-slate-600/50"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shadow Controls */}
          {(effect.effectType === 'shadow' || effect.effectType === 'dramatic') && (
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'shadow' ? null : 'shadow')}
                className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/30 transition-colors"
              >
                <span className="text-xs font-semibold text-slate-200">🌑 Shadow</span>
                <span className="text-xs text-slate-400">{effect.shadowBlur}px</span>
              </button>
              {expandedSection === 'shadow' && (
                <div className="mt-2 space-y-2 px-2">
                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Blur</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={effect.shadowBlur}
                      onChange={(e) =>
                        handleShadowChange(
                          effect.shadowX,
                          effect.shadowY,
                          Number(e.target.value),
                          effect.shadowColor
                        )
                      }
                      className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-300 mb-1 block">Offset X</label>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={effect.shadowX}
                        onChange={(e) =>
                          handleShadowChange(
                            Number(e.target.value),
                            effect.shadowY,
                            effect.shadowBlur,
                            effect.shadowColor
                          )
                        }
                        className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 mb-1 block">Offset Y</label>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={effect.shadowY}
                        onChange={(e) =>
                          handleShadowChange(
                            effect.shadowX,
                            Number(e.target.value),
                            effect.shadowBlur,
                            effect.shadowColor
                          )
                        }
                        className="w-full h-1 bg-slate-600 rounded cursor-pointer accent-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Effect Preview */}
      {effect.effectType !== 'none' && previewText && (
        <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/30">
          <p className="text-xs text-slate-400 mb-3">Preview</p>
          <div
            className="p-4 rounded bg-slate-900/50 text-center min-h-16 flex items-center justify-center"
            style={{
              textShadow: getTextShadowStyle(),
            }}
          >
            <p className={`text-lg font-semibold ${effect.effectType === 'neon' ? 'text-green-400' : 'text-white'}`}>
              {previewText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEffectsPanel;
