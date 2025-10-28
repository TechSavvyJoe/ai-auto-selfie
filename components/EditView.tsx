import React, { useState, useCallback, useEffect } from 'react';
import { PremiumButton, IconButton } from './common/PremiumButton';
import Icon from './common/Icon';
import { EditOptions, Theme, AspectRatio, AIMode, EnhancementLevel, ImageAdjustments, DEFAULT_IMAGE_ADJUSTMENTS, OverlayItem } from '../types';
import { generateInspirationalMessage } from '../services/geminiService';
import * as storage from '../services/storageService';
import { getPresetService } from '../services/presetService';
import Spinner from './common/Spinner';
import SegmentedControl from './common/SegmentedControl';
import Slider from './common/Slider';
import AdjustmentPreview from './AdjustmentPreview';
import OverlaysPanel from './OverlaysPanel';
import AutoEnhancePanel from './AutoEnhancePanel';
import FaceBeautyPanel from './FaceBeautyPanel';
import BackgroundBlurPanel from './BackgroundBlurPanel';
import ColorGradingPanel from './ColorGradingPanel';
import StickerPanel from './StickerPanel';
import AiModesPanel from './AiModesPanel';
import PresetManagerPanel from './PresetManagerPanel';
import { getFaceBeautyService, BeautySettings } from '../services/faceBeautyService';
import { getBackgroundBlurService, BlurSettings } from '../services/backgroundBlurService';
import { getColorGradingService, ColorGrade } from '../services/colorGradingService';

interface EditViewProps {
  imageSrc: string;
  onEnhance: (options: EditOptions) => void;
  onRetake: () => void;
}

const themes: { id: Theme; label: string; description: string; icon: React.ReactNode }[] = [
  { id: 'modern', label: 'Modern', description: 'Clean & crisp', icon: <Icon type='sparkles'/> },
  { id: 'luxury', label: 'Luxury', description: 'Cinematic & bold', icon: <Icon type='sparkles'/> },
  { id: 'dynamic', label: 'Dynamic', description: 'Energetic & vibrant', icon: <Icon type='sparkles'/> },
  { id: 'family', label: 'Family', description: 'Warm & inviting', icon: <Icon type='sparkles'/>}
];

const EditView: React.FC<EditViewProps> = ({ imageSrc, onEnhance }) => {
  const presets = getPresetService();

  // ===== PRIMARY CAPTION STATE (THE STAR OF THIS COMPONENT) =====
  const [primaryCaption, setPrimaryCaption] = useState('Elevate Your Vision');
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionEditValue, setCaptionEditValue] = useState('Elevate Your Vision');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  // ===== IMAGE ENHANCEMENT STATE =====
  const [theme, setTheme] = useState<Theme>('modern');
  const [aiMode, setAiMode] = useState<AIMode>('professional');
  const [enhancementLevel, setEnhancementLevel] = useState<EnhancementLevel>('moderate');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');

  // ===== FINE-TUNING STATE =====
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_IMAGE_ADJUSTMENTS);
  const [compareMode, setCompareMode] = useState(false);
  const [expandAdjustments, setExpandAdjustments] = useState(false);

  // ===== PRESETS & OVERLAYS =====
  const [showPresets, setShowPresets] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);

  // ===== PHASE 2: VISUAL ENHANCEMENTS =====
  const beautyService = getFaceBeautyService();
  const blurService = getBackgroundBlurService();
  const colorService = getColorGradingService();

  const [beautySettings, setBeautySettings] = useState<BeautySettings>(beautyService.getDefaultSettings());
  const [blurSettings, setBlurSettings] = useState<BlurSettings>(blurService.getDefaultSettings());
  const [colorGrade, setColorGrade] = useState<ColorGrade>(colorService.getDefault());
  const [selectedAiMode, setSelectedAiMode] = useState<any>({ id: 'professional', name: 'Professional' });
  const [showBeautyPanel, setShowBeautyPanel] = useState(false);
  const [showBlurPanel, setShowBlurPanel] = useState(false);
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [showAiModesPanel, setShowAiModesPanel] = useState(false);
  const [showPresetManager, setShowPresetManager] = useState(false);

  // Auto-generate caption when theme changes
  useEffect(() => {
    const generateCaption = async () => {
      try {
        setIsGeneratingCaption(true);
        const newCaption = await generateInspirationalMessage(theme);
        setPrimaryCaption(newCaption);
        setCaptionEditValue(newCaption);
      } catch (error) {
        console.error("Failed to auto-generate caption for theme", error);
      } finally {
        setIsGeneratingCaption(false);
      }
    };

    generateCaption();
  }, [theme]);

  const handleCaptionSaveClick = useCallback(() => {
    setPrimaryCaption(captionEditValue);
    setIsEditingCaption(false);
  }, [captionEditValue]);

  const handleCaptionCancel = useCallback(() => {
    setCaptionEditValue(primaryCaption);
    setIsEditingCaption(false);
  }, [primaryCaption]);

  const handleAdjustmentChange = useCallback((key: keyof ImageAdjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleResetAdjustments = useCallback(() => {
    setAdjustments(DEFAULT_IMAGE_ADJUSTMENTS);
  }, []);

  const handleSavePreset = useCallback(() => {
    if (presetName.trim()) {
      presets.createPreset(presetName, adjustments, {
        description: `${theme} theme with ${aiMode} mode`,
        category: 'custom',
        editOptions: {
          theme,
          aiMode,
          enhancementLevel,
        },
        tags: [theme, aiMode],
      });
      setPresetName('');
      setShowSavePresetDialog(false);
    }
  }, [presetName, adjustments, theme, aiMode, enhancementLevel, presets]);

  const handleLoadPreset = useCallback((presetId: string) => {
    const preset = presets.getPreset(presetId);
    if (preset) {
      setAdjustments(preset.adjustments);
      if (preset.editOptions) {
        if (preset.editOptions.theme) setTheme(preset.editOptions.theme);
        if (preset.editOptions.aiMode) setAiMode(preset.editOptions.aiMode);
        if (preset.editOptions.enhancementLevel) setEnhancementLevel(preset.editOptions.enhancementLevel);
      }
      presets.recordUsage(presetId);
      setShowPresets(false);
    }
  }, [presets]);

  const isAdjusted = Object.values(adjustments).some(v => v !== 0);

  const handleEnhanceClick = useCallback(() => {
    onEnhance({
      theme,
      message: primaryCaption,
      ctaText: '',
      logoBase64: null,
      logoMimeType: null,
      aspectRatio,
      logoPosition: 'bottom-right',
      aiMode,
      enhancementLevel,
      adjustments: isAdjusted ? adjustments : undefined,
      compareMode: compareMode ? true : undefined,
      overlays: overlays.length > 0 ? overlays : undefined,
    });
  }, [onEnhance, theme, primaryCaption, aspectRatio, aiMode, enhancementLevel, adjustments, compareMode, isAdjusted, overlays]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-black overflow-hidden">
      {/* LEFT SIDE: IMAGE PREVIEW */}
      <div className="w-full md:w-2/3 h-1/2 md:h-full flex items-center justify-center bg-black p-4">
        {isAdjusted || overlays.length > 0 ? (
          <AdjustmentPreview
            originalImage={imageSrc}
            adjustments={adjustments}
            overlays={overlays}
            maxHeight="h-full"
          />
        ) : (
          <img src={imageSrc} alt="Captured selfie" className="max-w-full max-h-full object-contain rounded-lg" />
        )}
      </div>

      {/* RIGHT SIDE: CONTROLS & OPTIONS */}
      <div className="w-full md:w-1/3 h-1/2 md:h-full bg-gray-900 overflow-y-auto p-4 flex flex-col gap-3">

        {/* ============================================ */}
        {/* 🌟 PRIMARY CAPTION SECTION - THE HERO! 🌟 */}
        {/* ============================================ */}
        <div className="bg-gradient-to-br from-primary-600/20 to-primary-700/10 rounded-2xl p-6 border-2 border-primary-500/50 shadow-lg shadow-primary-500/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">✨</span>
            <h2 className="text-xl font-bold text-white">Your Caption</h2>
          </div>

          {!isEditingCaption ? (
            <div className="space-y-3">
              <div className="bg-gray-800/60 rounded-xl p-4 border border-primary-500/30 min-h-20 flex items-center">
                <p className="text-lg font-semibold text-primary-100 break-words">{primaryCaption}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCaptionEditValue(primaryCaption);
                    setIsEditingCaption(true);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Icon type="edit" className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={async () => {
                    try {
                      setIsGeneratingCaption(true);
                      const newCaption = await generateInspirationalMessage(theme);
                      setPrimaryCaption(newCaption);
                      setCaptionEditValue(newCaption);
                    } catch (error) {
                      console.error('Failed to generate caption:', error);
                    } finally {
                      setIsGeneratingCaption(false);
                    }
                  }}
                  disabled={isGeneratingCaption}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingCaption ? (
                    <>
                      <Spinner /> Generating...
                    </>
                  ) : (
                    <>
                      <span>✨</span> Auto-Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={captionEditValue}
                onChange={(e) => setCaptionEditValue(e.target.value.slice(0, 200))}
                placeholder="Enter your caption..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-primary-500/50 text-white placeholder-white/40 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
              />
              <p className="text-xs text-white/60">{captionEditValue.length} / 200 characters</p>
              <div className="flex gap-2">
                <button
                  onClick={handleCaptionSaveClick}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all"
                >
                  Save Caption
                </button>
                <button
                  onClick={handleCaptionCancel}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* AI ENHANCEMENT OPTIONS */}
        {/* ============================================ */}
        <div className="glass rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-bold text-white/80 border-b border-white/10 pb-2 mb-3">⚡ AI Enhancement</h3>

          <div>
            <h4 className="text-xs text-white/60 mb-2 font-semibold">AI Mode</h4>
            <SegmentedControl<AIMode>
              options={[
                { value: 'professional', label: 'Pro' },
                { value: 'cinematic', label: 'Cinema' },
                { value: 'portrait', label: 'Portrait' },
                { value: 'creative', label: 'Creative' },
                { value: 'natural', label: 'Natural' },
              ]}
              value={aiMode}
              onChange={setAiMode}
            />
          </div>

          <div>
            <h4 className="text-xs text-white/60 mb-2 font-semibold">Enhancement Level</h4>
            <SegmentedControl<EnhancementLevel>
              options={[
                { value: 'subtle', label: 'Subtle' },
                { value: 'moderate', label: 'Balanced' },
                { value: 'dramatic', label: 'Dramatic' },
              ]}
              value={enhancementLevel}
              onChange={setEnhancementLevel}
            />
          </div>
        </div>

        {/* ============================================ */}
        {/* THEME SELECTION */}
        {/* ============================================ */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-bold text-white/80 border-b border-white/10 pb-2 mb-3">🎨 Theme</h3>
          <div className="grid grid-cols-2 gap-2">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3 rounded-lg text-left transition-all duration-200 border-2 ${
                  theme === t.id
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30'
                    : 'bg-gray-700 border-gray-600 hover:border-primary-500 hover:bg-gray-600'
                }`}
              >
                <h4 className="font-bold text-white text-sm">{t.label}</h4>
                <p className="text-xs text-white/70">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* TEXT OVERLAYS & STICKERS */}
        {/* ============================================ */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-bold text-white/80 border-b border-white/10 pb-2 mb-3">✨ Text & Stickers</h3>
          <OverlaysPanel overlays={overlays} onChange={setOverlays} imageSrc={imageSrc} />
        </div>

        {/* ============================================ */}
        {/* LAYOUT OPTIONS */}
        {/* ============================================ */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-bold text-white/80 border-b border-white/10 pb-2 mb-3">📐 Layout</h3>
          <div>
            <h4 className="text-xs text-white/60 mb-2 font-semibold">Aspect Ratio</h4>
            <div className="flex flex-col gap-1.5">
              {(['original', '1:1', '9:16', '1.91:1'] as AspectRatio[]).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 text-sm rounded-md transition-all duration-200 ${
                    aspectRatio === ratio
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* FINE-TUNING ADJUSTMENTS */}
        {/* ============================================ */}
        <div className="glass rounded-xl p-4">
          <button
            type="button"
            onClick={() => setExpandAdjustments(!expandAdjustments)}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-700/50 rounded-md transition-colors"
          >
            <span className="text-sm font-bold text-white/80">⚙️ Fine-Tune</span>
            <Icon
              type={expandAdjustments ? 'chevronUp' : 'chevronDown'}
              className="w-4 h-4 text-white/50"
            />
          </button>

          {expandAdjustments && (
            <div className="space-y-3 p-2 mt-2 bg-gray-800/30 rounded-md">
              <Slider
                label="Exposure"
                icon="☀️"
                value={adjustments.exposure}
                onChange={(value) => handleAdjustmentChange('exposure', value)}
                onReset={() => handleAdjustmentChange('exposure', 0)}
                min={-50}
                max={50}
                unit="%"
              />
              <Slider
                label="Contrast"
                icon="⚖️"
                value={adjustments.contrast}
                onChange={(value) => handleAdjustmentChange('contrast', value)}
                onReset={() => handleAdjustmentChange('contrast', 0)}
                min={-50}
                max={50}
                unit="%"
              />
              <Slider
                label="Saturation"
                icon="🎨"
                value={adjustments.saturation}
                onChange={(value) => handleAdjustmentChange('saturation', value)}
                onReset={() => handleAdjustmentChange('saturation', 0)}
                min={-50}
                max={50}
                unit="%"
              />
              {isAdjusted && (
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="w-full mt-2 p-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Reset All
                </button>
              )}
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* QUICK PRESETS */}
        {/* ============================================ */}
        {presets.presets.length > 0 && (
          <div className="glass rounded-xl p-4">
            <PremiumButton
              variant={showPresets ? "primary" : "secondary"}
              size="sm"
              icon={<Icon type="sparkles" className="w-4 h-4" />}
              onClick={() => setShowPresets(!showPresets)}
              fullWidth
            >
              Load Preset ({presets.presets.length})
            </PremiumButton>

            {showPresets && (
              <div className="max-h-32 overflow-y-auto space-y-2 p-2 mt-3 bg-gray-800/30 rounded-md border border-gray-700">
                {presets.getFavorites().map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleLoadPreset(preset.id)}
                    className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                  >
                    <div className="font-semibold">{preset.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* PREVIEW OPTIONS */}
        {/* ============================================ */}
        <div className="glass rounded-xl p-4">
          <button
            type="button"
            onClick={() => setCompareMode(!compareMode)}
            className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
              compareMode
                ? 'bg-blue-600/20 border-blue-500'
                : 'bg-gray-700 border-gray-600 hover:border-gray-500'
            }`}
          >
            <span className="text-sm font-medium">Before/After</span>
            {compareMode && <span className="text-xs bg-blue-500 px-2 py-1 rounded">ON</span>}
          </button>
        </div>

        {/* ============================================ */}
        {/* PHASE 2: VISUAL ENHANCEMENTS - QUICK ACCESS */}
        {/* ============================================ */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => setShowBeautyPanel(!showBeautyPanel)}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              showBeautyPanel
                ? 'bg-primary-600/40 border border-primary-500/50 text-primary-200'
                : 'bg-slate-700/40 border border-slate-600/50 text-slate-300 hover:border-primary-500/30'
            }`}
            title="Face Beauty"
          >
            ✨ Beauty
          </button>
          <button
            onClick={() => setShowBlurPanel(!showBlurPanel)}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              showBlurPanel
                ? 'bg-primary-600/40 border border-primary-500/50 text-primary-200'
                : 'bg-slate-700/40 border border-slate-600/50 text-slate-300 hover:border-primary-500/30'
            }`}
            title="Background Blur"
          >
            🌫️ Blur
          </button>
          <button
            onClick={() => setShowColorPanel(!showColorPanel)}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              showColorPanel
                ? 'bg-primary-600/40 border border-primary-500/50 text-primary-200'
                : 'bg-slate-700/40 border border-slate-600/50 text-slate-300 hover:border-primary-500/30'
            }`}
            title="Color Grading"
          >
            🎨 Color
          </button>
        </div>

        {/* Additional Enhancements - Second Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => setShowStickerPanel(!showStickerPanel)}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              showStickerPanel
                ? 'bg-primary-600/40 border border-primary-500/50 text-primary-200'
                : 'bg-slate-700/40 border border-slate-600/50 text-slate-300 hover:border-primary-500/30'
            }`}
            title="Sticker Library"
          >
            🎨 Stickers
          </button>
          <button
            onClick={() => setShowAiModesPanel(!showAiModesPanel)}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              showAiModesPanel
                ? 'bg-primary-600/40 border border-primary-500/50 text-primary-200'
                : 'bg-slate-700/40 border border-slate-600/50 text-slate-300 hover:border-primary-500/30'
            }`}
            title="AI Enhancement Modes"
          >
            🤖 AI Modes
          </button>
          <button
            onClick={() => setShowPresetManager(!showPresetManager)}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              showPresetManager
                ? 'bg-primary-600/40 border border-primary-500/50 text-primary-200'
                : 'bg-slate-700/40 border border-slate-600/50 text-slate-300 hover:border-primary-500/30'
            }`}
            title="Preset Manager"
          >
            💾 Presets
          </button>
        </div>

        {/* Beauty Panel */}
        {showBeautyPanel && (
          <div className="mb-3 p-3 rounded-lg bg-slate-700/20 border border-slate-600/30">
            <FaceBeautyPanel beautySettings={beautySettings} onChange={setBeautySettings} />
          </div>
        )}

        {/* Blur Panel */}
        {showBlurPanel && (
          <div className="mb-3 p-3 rounded-lg bg-slate-700/20 border border-slate-600/30">
            <BackgroundBlurPanel blurSettings={blurSettings} onChange={setBlurSettings} />
          </div>
        )}

        {/* Color Panel */}
        {showColorPanel && (
          <div className="mb-3 p-3 rounded-lg bg-slate-700/20 border border-slate-600/30">
            <ColorGradingPanel colorGrade={colorGrade} onChange={setColorGrade} />
          </div>
        )}

        {/* Sticker Panel */}
        {showStickerPanel && (
          <div className="mb-3 p-3 rounded-lg bg-slate-700/20 border border-slate-600/30">
            <StickerPanel onSelectSticker={(sticker) => {
              console.log('Sticker selected:', sticker);
              // TODO: Add sticker to image overlay in future enhancement
            }} onClose={() => setShowStickerPanel(false)} />
          </div>
        )}

        {/* AI Modes Panel */}
        {showAiModesPanel && (
          <div className="mb-3 p-3 rounded-lg bg-slate-700/20 border border-slate-600/30">
            <AiModesPanel 
              selectedMode={selectedAiMode} 
              onChange={(mode) => {
                setSelectedAiMode(mode);
                console.log('AI Mode selected:', mode);
              }}
              useCase="selfie"
            />
          </div>
        )}

        {/* Preset Manager Panel */}
        {showPresetManager && (
          <div className="mb-3 p-3 rounded-lg bg-slate-700/20 border border-slate-600/30">
            <PresetManagerPanel
              onLoadPreset={(preset) => {
                console.log('Loading preset:', preset);
                // Apply preset settings
                if (preset.settings?.beautySettings) setBeautySettings(preset.settings.beautySettings);
                if (preset.settings?.blurSettings) setBlurSettings(preset.settings.blurSettings);
                if (preset.settings?.colorGrade) setColorGrade(preset.settings.colorGrade);
              }}
              currentSettings={{
                beautySettings,
                blurSettings,
                colorGrade,
              }}
              onClose={() => setShowPresetManager(false)}
            />
          </div>
        )}

        {/* ============================================ */}
        {/* MAIN ENHANCE BUTTON - BOTTOM */}
        {/* ============================================ */}
        <div className="mt-auto pt-4 space-y-2 sticky bottom-0 bg-gradient-to-t from-gray-900 to-transparent">
          <PremiumButton
            variant="primary"
            size="lg"
            icon={<Icon type="sparkles" className="w-5 h-5" />}
            onClick={handleEnhanceClick}
            fullWidth
          >
            ✨ Enhance with AI
          </PremiumButton>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EditView);
