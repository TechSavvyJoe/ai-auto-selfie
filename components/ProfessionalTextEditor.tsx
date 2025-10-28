import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from './common/ToastContainer';
import Icon from './common/Icon';
import { getAITextGeneratorService } from '../services/aiTextGeneratorService';
import { useAnalytics } from '../services/analyticsService';

interface TextEditorProps {
  onTextSelect: (text: string, style: any) => void;
  imageDataUrl?: string;
  aiMode?: string;
  currentText?: string;
  onClose?: () => void;
}

interface SelectedStyle {
  name: string;
  color: string;
  bgColor: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  shadowBlur: number;
  textAlign: 'left' | 'center' | 'right';
}

const ProfessionalTextEditor: React.FC<TextEditorProps> = ({
  onTextSelect,
  imageDataUrl,
  aiMode = 'professional',
  currentText = '',
  onClose
}) => {
  const { showToast } = useToast();
  const { trackFeature } = useAnalytics();
  const [activeTab, setActiveTab] = useState<'suggestions' | 'custom'>('suggestions');
  const [textInput, setTextInput] = useState(currentText);
  const [selectedStyle, setSelectedStyle] = useState<SelectedStyle | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewText, setPreviewText] = useState(currentText);

  // Load suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setIsLoading(true);
        const textGeneratorService = getAITextGeneratorService();
        const suggestedTexts = await textGeneratorService.generateTextSuggestions(imageDataUrl, aiMode);
        setSuggestions(suggestedTexts);

        // Set default style
        const defaultPreset = textGeneratorService.getPreset('Modern Minimal');
        if (defaultPreset) {
          setSelectedStyle({
            name: defaultPreset.name,
            color: defaultPreset.color,
            bgColor: defaultPreset.bgColor,
            fontSize: defaultPreset.fontSize,
            fontWeight: defaultPreset.fontWeight as 'normal' | 'bold',
            shadowBlur: defaultPreset.shadowBlur,
            textAlign: defaultPreset.textAlign as 'left' | 'center' | 'right',
          });
        }
      } catch (error) {
        console.error('Failed to load suggestions:', error);
        showToast('Failed to load text suggestions', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (imageDataUrl) {
      loadSuggestions();
    }
  }, [imageDataUrl, aiMode, showToast]);

  const handleSelectSuggestion = useCallback((text: string) => {
    setPreviewText(text);
    setTextInput(text);
    trackFeature('select_suggested_text', { category: 'ai_suggestions' });
  }, [trackFeature]);

  const handleStyleSelect = useCallback((style: any) => {
    const styleObj: SelectedStyle = {
      name: style.name,
      color: style.color,
      bgColor: style.bgColor,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight as 'normal' | 'bold',
      shadowBlur: style.shadowBlur,
      textAlign: style.textAlign as 'left' | 'center' | 'right',
    };
    setSelectedStyle(styleObj);
    trackFeature('select_text_style', { style: style.name });
  }, [trackFeature]);

  const handleApplyText = useCallback(() => {
    if (!previewText.trim()) {
      showToast('Please enter or select text', 'warning');
      return;
    }

    if (!selectedStyle) {
      showToast('Please select a style', 'warning');
      return;
    }

    onTextSelect(previewText, selectedStyle);
    trackFeature('apply_text_overlay', {
      style: selectedStyle.name,
      textLength: previewText.length,
      source: activeTab
    });
    showToast('Text overlay applied!', 'success');
    onClose?.();
  }, [previewText, selectedStyle, onTextSelect, showToast, trackFeature, activeTab, onClose]);

  const handleCustomTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value.slice(0, 100); // Max 100 chars
    setTextInput(newText);
    setPreviewText(newText);
  }, []);

  const textGeneratorService = getAITextGeneratorService();
  const presets = textGeneratorService.getAllPresets();

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <h2 className="text-xl font-bold text-white">Text Editor</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close editor"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700/50 bg-slate-800/30">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-4 px-6 font-semibold text-sm transition-all relative ${
              activeTab === 'suggestions'
                ? 'text-primary-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            AI Suggestions
            {activeTab === 'suggestions' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-4 px-6 font-semibold text-sm transition-all relative ${
              activeTab === 'custom'
                ? 'text-primary-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Custom Text
            {activeTab === 'custom' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-400" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 space-y-6">
          {/* AI Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin text-primary-500 text-2xl">⟳</div>
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <p className="text-sm text-slate-400">
                    Choose a suggested text for your photo overlay:
                  </p>
                  <div className="space-y-3">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(suggestion.text)}
                        className={`w-full p-4 rounded-lg transition-all text-left group ${
                          previewText === suggestion.text
                            ? 'bg-gradient-to-r from-primary-500/30 to-primary-600/30 border-primary-500/50'
                            : 'bg-slate-700/40 border border-slate-600/50 hover:border-primary-500/50 hover:bg-slate-700/60'
                        } border`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-white group-hover:text-primary-200 transition-colors">
                              {suggestion.text}
                            </p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <span className="text-xs px-2 py-1 rounded bg-primary-500/20 text-primary-300 font-medium">
                                {suggestion.category}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-slate-600/40 text-slate-300">
                                {suggestion.style}
                              </span>
                            </div>
                          </div>
                          {previewText === suggestion.text && (
                            <div className="text-primary-400 mt-1">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-slate-400 text-center py-8">
                  No suggestions available. Try using custom text instead.
                </p>
              )}
            </div>
          )}

          {/* Custom Text Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Enter Your Text
                </label>
                <input
                  type="text"
                  value={textInput}
                  onChange={handleCustomTextChange}
                  placeholder="Type your text here (max 100 characters)..."
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-500 focus:border-primary-500/50 focus:bg-slate-700/60 transition-all outline-none"
                />
                <p className="text-xs text-slate-400 mt-2">
                  {textInput.length} / 100 characters
                </p>
              </div>
            </div>
          )}

          {/* Style Presets */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Choose a Style
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleStyleSelect(preset)}
                  className={`p-4 rounded-lg transition-all text-left group ${
                    selectedStyle?.name === preset.name
                      ? 'ring-2 ring-primary-500 bg-slate-700/60'
                      : 'bg-slate-700/40 hover:bg-slate-700/60 border border-slate-600/50'
                  }`}
                >
                  {/* Style Preview */}
                  <div
                    className="p-3 rounded mb-3 text-center overflow-hidden"
                    style={{
                      backgroundColor: preset.bgColor,
                      textShadow: `0 0 ${preset.shadowBlur}px rgba(0,0,0,0.5)`,
                    }}
                  >
                    <p
                      style={{
                        color: preset.color,
                        fontSize: '14px',
                        fontWeight: preset.fontWeight,
                      }}
                      className="truncate"
                    >
                      Preview
                    </p>
                  </div>
                  {/* Style Name */}
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-primary-300 transition-colors">
                    {preset.name}
                  </p>
                  {selectedStyle?.name === preset.name && (
                    <div className="text-primary-400 text-sm mt-1">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Preview
            </h3>
            <div
              className="w-full h-32 rounded-lg border border-slate-600/50 flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: '#1a1a2e',
                backgroundImage: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)',
              }}
            >
              {previewText && selectedStyle ? (
                <div
                  style={{
                    color: selectedStyle.color,
                    backgroundColor: selectedStyle.bgColor,
                    fontSize: `${selectedStyle.fontSize}px`,
                    fontWeight: selectedStyle.fontWeight,
                    textShadow: `0 0 ${selectedStyle.shadowBlur}px rgba(0,0,0,0.8)`,
                    textAlign: selectedStyle.textAlign,
                    padding: '12px 24px',
                    borderRadius: '8px',
                  }}
                  className="text-center max-w-full"
                >
                  {previewText}
                </div>
              ) : (
                <p className="text-slate-500 text-center text-sm">
                  Your text preview will appear here
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-700/50 p-6 bg-slate-800/30 flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 hover:text-slate-100 border border-slate-600/50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleApplyText}
            disabled={!previewText.trim() || !selectedStyle}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>✓</span> Apply Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTextEditor;
