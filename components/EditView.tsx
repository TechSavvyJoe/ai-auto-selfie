import React, { useState, useCallback, useEffect } from 'react';
import { PremiumButton, IconButton } from './common/PremiumButton';
import { PremiumCard } from './common/PremiumCard';
import Icon from './common/Icon';
// FIX: Import LogoData to fix type error.
import { EditOptions, Theme, AspectRatio, LogoPosition, LogoData, AIMode, EnhancementLevel, ImageAdjustments, DEFAULT_IMAGE_ADJUSTMENTS, OverlayItem } from '../types';
import { fileToBase64 } from '../utils/imageUtils';
import { generateInspirationalMessage } from '../services/geminiService';
import * as storage from '../services/storageService';
import { usePresets } from '../services/presetService';
import Spinner from './common/Spinner';
import SegmentedControl from './common/SegmentedControl';
import Slider from './common/Slider';
import AdjustmentPreview from './AdjustmentPreview';
import OverlaysPanel from './OverlaysPanel';
import AutoEnhancePanel from './AutoEnhancePanel';

interface EditViewProps {
  imageSrc: string;
  onEnhance: (options: EditOptions) => void;
  onRetake: () => void;
}

const themes: { id: Theme; label: string; description: string; icon: React.ReactNode }[] = [
  { id: 'modern', label: 'Modern', description: 'Clean, crisp, studio-like', icon: <Icon type='sparkles'/> },
  { id: 'luxury', label: 'Luxury', description: 'Cinematic, sophisticated, high-contrast', icon: <Icon type='sparkles'/> },
  { id: 'dynamic', label: 'Dynamic', description: 'Energetic, vibrant, motion', icon: <Icon type='sparkles'/> },
  { id: 'family', label: 'Family', description: 'Warm, inviting, and bright', icon: <Icon type='sparkles'/>}
];

const EditView: React.FC<EditViewProps> = ({ imageSrc, onEnhance }) => {
  const presets = usePresets();

  const [theme, setTheme] = useState<Theme>('modern');
  const [message, setMessage] = useState('Elevate Your Vision');
  const [ctaText, setCtaText] = useState('');
  // FIX: Use the imported LogoData type directly instead of from the storage namespace.
  const [logoData, setLogoData] = useState<LogoData | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('bottom-right');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [aiMode, setAiMode] = useState<AIMode>('professional');
  const [enhancementLevel, setEnhancementLevel] = useState<EnhancementLevel>('moderate');
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_IMAGE_ADJUSTMENTS);
  const [compareMode, setCompareMode] = useState(false);
  const [expandAdjustments, setExpandAdjustments] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);

  useEffect(() => {
    const savedLogo = storage.getLogo();
    if (savedLogo) {
      setLogoData(savedLogo);
      setLogoPreview(`data:${savedLogo.mimeType};base64,${savedLogo.base64}`);
    }
  }, []);

  // Auto-generate inspirational message when theme changes
  useEffect(() => {
    const generateMessage = async () => {
      try {
        const newMessage = await generateInspirationalMessage(theme);
        setMessage(newMessage);
      } catch (error) {
        console.error("Failed to auto-generate message for theme", error);
        // Keep current message if generation fails
      }
    };

    generateMessage();
  }, [theme]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { base64, mimeType } = await fileToBase64(file);
        const newLogoData = { base64, mimeType };
        setLogoData(newLogoData);
        setLogoPreview(`data:${mimeType};base64,${base64}`);
        storage.saveLogo(newLogoData);
      } catch (error) {
        console.error("Error processing logo file:", error);
      }
    }
  };
  
  const handleInspireMe = async () => {
    setIsGeneratingMessage(true);
    try {
        const newMessage = await generateInspirationalMessage(theme);
        setMessage(newMessage);
    } catch (error) {
        console.error("Failed to get inspirational message", error);
        setMessage("Live The Dream!");
    } finally {
        setIsGeneratingMessage(false);
    }
  }

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
      message,
      ctaText,
      logoBase64: logoData?.base64 || null,
      logoMimeType: logoData?.mimeType || null,
      aspectRatio,
      logoPosition,
      aiMode,
      enhancementLevel,
      adjustments: isAdjusted ? adjustments : undefined,
      compareMode: compareMode ? true : undefined,
      overlays: overlays.length > 0 ? overlays : undefined,
    });
  }, [onEnhance, theme, message, ctaText, logoData, aspectRatio, logoPosition, aiMode, enhancementLevel, adjustments, compareMode, isAdjusted, overlays]);
  
  const ControlGroup: React.FC<{title: string; children: React.ReactNode; className?: string; icon?: string}> = ({title, children, className, icon}) => (
    <div className={`flex flex-col gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 hover:border-primary-500/50 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/50 border-slate-700/50 backdrop-blur ${className}`}>
        <div className="flex items-center gap-2 mb-1">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary-200">{title}</h3>
        </div>
        {children}
    </div>
  );
  
  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-black overflow-hidden">
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
      
      <div className="w-full md:w-1/3 h-1/2 md:h-full bg-gray-900 overflow-y-auto p-4 flex flex-col gap-4">
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-bold text-white/80 border-b border-white/10 pb-2 mb-3">AI Mode</h3>
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
          <div className="mt-4">
            <h4 className="text-xs text-white/60 mb-2">Enhancement Level</h4>
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
        <ControlGroup title="Select Creative Theme" icon="🎨">
            <div className="grid grid-cols-2 gap-3">
                {themes.map(t => (
                    <button key={t.id} onClick={() => setTheme(t.id)} className={`p-3 rounded-lg text-left transition-all duration-200 border-2 ${theme === t.id ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-lg shadow-primary-500/30' : 'bg-gray-700 border-gray-600 hover:border-primary-500 hover:bg-gray-600'}`}>
                        <h4 className="font-bold text-white">{t.label}</h4>
                        <p className="text-xs text-white/70">{t.description}</p>
                    </button>
                ))}
            </div>
        </ControlGroup>
        
        <ControlGroup title="Customize Text & Brand" icon="📝">
          <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input type="text" value={message} onChange={e => setMessage(e.target.value)} maxLength={48} placeholder="Primary message..." className="w-full bg-gray-700 text-white text-sm p-2.5 rounded-md border border-gray-600 focus:border-primary-500 focus:ring-primary-500 transition-colors" />
                 <IconButton
                   onClick={handleInspireMe}
                   disabled={isGeneratingMessage}
                   variant="primary"
                   size="md"
                   icon={isGeneratingMessage ? <Spinner /> : <Icon type="sparkles" className="w-5 h-5"/>}
                   tooltip="Generate inspirational message"
                />
            </div>
      <div className="text-right text-[11px] text-white/50">{message.length}/48</div>
            <input type="text" value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="Optional CTA (e.g., website.com)" className="w-full bg-gray-700 text-white text-sm p-2.5 rounded-md border border-gray-600 focus:border-primary-500 focus:ring-primary-500 transition-colors" />
             <label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-3 text-sm p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg hover:from-primary-500/20 hover:to-primary-600/20 transition-all duration-200 border border-gray-600 hover:border-primary-500/50">
                {logoPreview ? <img src={logoPreview} alt="Logo preview" className="w-10 h-10 object-contain rounded-sm bg-white/10 p-1"/> : <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-sm"><Icon type="upload" className="w-6 h-6 text-primary-400"/></div>}
                <span className="text-gray-200">{logoPreview ? 'Change Dealership Logo' : 'Upload Dealership Logo'}</span>
            </label>
            <input id="logo-upload" type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} className="hidden" />
          </div>
        </ControlGroup>

        <ControlGroup title="Layout & Formatting" icon="📐">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h5 className="text-xs text-white/60 mb-1.5">Aspect Ratio</h5>
                    <div className="flex flex-col gap-1.5">
                        {(['original', '1:1', '9:16', '1.91:1'] as AspectRatio[]).map(ratio => (
                            <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`py-1.5 text-sm rounded-md transition-all duration-200 ${aspectRatio === ratio ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}>{ratio}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <h5 className="text-xs text-white/60 mb-1.5">Logo Position</h5>
                     <div className="grid grid-cols-2 gap-1.5">
                        {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as LogoPosition[]).map(pos => (
                             <button key={pos} onClick={() => setLogoPosition(pos)} className={`py-2 text-xs rounded-md transition-all duration-200 ${logoPosition === pos ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}>{pos.split('-').map(p => p.charAt(0).toUpperCase()).join('')}</button>
                        ))}
                         <button onClick={() => setLogoPosition('center')} className={`py-2 text-xs rounded-md transition-all duration-200 col-span-2 ${logoPosition === 'center' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}>Center</button>
                    </div>
                </div>
            </div>
        </ControlGroup>

        <ControlGroup title="Text & Stickers" icon="✨">
          <OverlaysPanel overlays={overlays} onChange={setOverlays} imageSrc={imageSrc} />
        </ControlGroup>

        <ControlGroup title="Professional Adjustments" icon="⚙️">
          <button
            type="button"
            onClick={() => setExpandAdjustments(!expandAdjustments)}
            className="w-full flex items-center justify-between p-2 mb-2 hover:bg-gray-700/50 rounded-md transition-colors"
          >
            <span className="text-xs text-white/70">Exposure • Contrast • Temperature</span>
            <Icon
              type={expandAdjustments ? 'chevronUp' : 'chevronDown'}
              className="w-4 h-4 text-white/50 transition-transform"
              style={{ transform: expandAdjustments ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {expandAdjustments && (
            <div className="space-y-3 p-2 bg-gray-800/30 rounded-md">
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
                label="Saturation"
                icon="🎨"
                value={adjustments.saturation}
                onChange={(value) => handleAdjustmentChange('saturation', value)}
                onReset={() => handleAdjustmentChange('saturation', 0)}
                min={-50}
                max={50}
                unit="%"
              />
              <Slider
                label="Sharpen"
                icon="🔍"
                value={adjustments.sharpen}
                onChange={(value) => handleAdjustmentChange('sharpen', value)}
                onReset={() => handleAdjustmentChange('sharpen', 0)}
                min={0}
                max={10}
              />
              {isAdjusted && (
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="w-full mt-2 p-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <Icon type="redo" className="w-4 h-4" />
                  Reset All
                </button>
              )}
            </div>
          )}
        </ControlGroup>

        <ControlGroup title="Auto Enhancement">
          <AutoEnhancePanel
            imageSrc={imageSrc}
            onApplyEnhancement={(adjustments, strategy, level) => {
              setAdjustments(adjustments);
            }}
          />
        </ControlGroup>

        <ControlGroup title="Quick Presets">
          <div className="space-y-3">
            <PremiumButton
              variant={showPresets ? "primary" : "secondary"}
              size="sm"
              icon={<Icon type="sparkles" className="w-4 h-4" />}
              onClick={() => setShowPresets(!showPresets)}
              fullWidth
            >
              {presets.presets.length > 0 ? `Load Preset (${presets.presets.length})` : 'No Presets Yet'}
            </PremiumButton>

            {showPresets && presets.presets.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-gray-800/30 rounded-md border border-gray-700">
                {presets.getFavorites().map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleLoadPreset(preset.id)}
                    className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">{preset.name}</div>
                      <div className="text-white/60">{preset.description || preset.category}</div>
                    </div>
                    {preset.isFavorite && <Icon type="heart" className="w-3 h-3 fill-red-500 text-red-500" />}
                  </button>
                ))}
                {presets.getMostUsed(3).length > 0 && (
                  <>
                    <div className="text-xs text-white/60 font-semibold mt-3 mb-2">Most Used</div>
                    {presets.getMostUsed(3).map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleLoadPreset(preset.id)}
                        className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold">{preset.name}</div>
                          <div className="text-white/60">Used {preset.uses} times</div>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            <PremiumButton
              variant="success"
              size="sm"
              icon={<Icon type="save" className="w-4 h-4" />}
              onClick={() => setShowSavePresetDialog(!showSavePresetDialog)}
              fullWidth
            >
              Save Current as Preset
            </PremiumButton>

            {showSavePresetDialog && (
              <div className="space-y-2 p-3 bg-gray-800/50 rounded-md border border-blue-500/30">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Preset name..."
                  maxLength={30}
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                />
                <div className="flex gap-2">
                  <PremiumButton
                    variant="success"
                    size="sm"
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                    className="flex-1"
                  >
                    Save
                  </PremiumButton>
                  <PremiumButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowSavePresetDialog(false);
                      setPresetName('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </PremiumButton>
                </div>
              </div>
            )}
          </div>
        </ControlGroup>

        <ControlGroup title="Preview Options">
          <button
            type="button"
            onClick={() => setCompareMode(!compareMode)}
            className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
              compareMode
                ? 'bg-blue-600/20 border-blue-500'
                : 'bg-gray-700 border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon type="compare" className="w-5 h-5" />
              <span className="text-sm font-medium">Before/After Compare</span>
            </div>
            {compareMode && <span className="text-xs bg-blue-500 px-2 py-1 rounded">ON</span>}
          </button>
        </ControlGroup>

        <div className="mt-auto pt-4 space-y-2">
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