import React, { useState, useCallback, useEffect } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
// FIX: Import LogoData to fix type error.
import { EditOptions, Theme, AspectRatio, LogoPosition, LogoData, AIMode, EnhancementLevel } from '../types';
import { fileToBase64 } from '../utils/imageUtils';
import { generateInspirationalMessage } from '../services/geminiService';
import * as storage from '../services/storageService';
import Spinner from './common/Spinner';
import SegmentedControl from './common/SegmentedControl';

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
  const [theme, setTheme] = useState<Theme>('modern');
  const [message, setMessage] = useState('Congratulations!');
  const [ctaText, setCtaText] = useState('');
  // FIX: Use the imported LogoData type directly instead of from the storage namespace.
  const [logoData, setLogoData] = useState<LogoData | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('bottom-right');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [aiMode, setAiMode] = useState<AIMode>('professional');
  const [enhancementLevel, setEnhancementLevel] = useState<EnhancementLevel>('moderate');

  useEffect(() => {
    const savedLogo = storage.getLogo();
    if (savedLogo) {
      setLogoData(savedLogo);
      setLogoPreview(`data:${savedLogo.mimeType};base64,${savedLogo.base64}`);
    }
  }, []);

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
    });
  }, [onEnhance, theme, message, ctaText, logoData, aspectRatio, logoPosition, aiMode, enhancementLevel]);
  
  const ControlGroup: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({title, children, className}) => (
    <div className={`flex flex-col gap-3 p-4 bg-gray-800/50 rounded-xl shadow-md ${className}`}>
        <h3 className="text-sm font-bold text-white/80 border-b border-white/10 pb-2 mb-2">{title}</h3>
        {children}
    </div>
  );
  
  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-black overflow-hidden">
      <div className="w-full md:w-2/3 h-1/2 md:h-full flex items-center justify-center bg-black p-4">
        <img src={imageSrc} alt="Captured selfie" className="max-w-full max-h-full object-contain rounded-lg" />
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
        <ControlGroup title="Select Creative Theme">
            <div className="grid grid-cols-2 gap-3">
                {themes.map(t => (
                    <button key={t.id} onClick={() => setTheme(t.id)} className={`p-3 rounded-lg text-left transition-all duration-200 border-2 ${theme === t.id ? 'bg-blue-600 border-blue-400' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>
                        <h4 className="font-bold text-white">{t.label}</h4>
                        <p className="text-xs text-white/70">{t.description}</p>
                    </button>
                ))}
            </div>
        </ControlGroup>
        
        <ControlGroup title="Customize Text & Brand">
          <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input type="text" value={message} onChange={e => setMessage(e.target.value)} maxLength={48} placeholder="Primary message..." className="w-full bg-gray-700 text-white text-sm p-2.5 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-blue-500" />
                 <button onClick={handleInspireMe} disabled={isGeneratingMessage} className="p-2.5 rounded-md transition-colors bg-gray-700 hover:bg-gray-600 disabled:opacity-50">
                    {isGeneratingMessage ? <Spinner /> : <Icon type="sparkles" className="w-5 h-5 text-yellow-300"/>}
                </button>
            </div>
      <div className="text-right text-[11px] text-white/50">{message.length}/48</div>
            <input type="text" value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="Optional CTA (e.g., website.com)" className="w-full bg-gray-700 text-white text-sm p-2.5 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-blue-500" />
             <label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-3 text-sm p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600">
                {logoPreview ? <img src={logoPreview} alt="Logo preview" className="w-10 h-10 object-contain rounded-sm bg-white/10 p-1"/> : <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-sm"><Icon type="upload" className="w-6 h-6"/></div>}
                <span className="text-gray-200">{logoPreview ? 'Change Dealership Logo' : 'Upload Dealership Logo'}</span>
            </label>
            <input id="logo-upload" type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} className="hidden" />
          </div>
        </ControlGroup>

        <ControlGroup title="Layout & Formatting">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h5 className="text-xs text-white/60 mb-1.5">Aspect Ratio</h5>
                    <div className="flex flex-col gap-1.5">
                        {(['original', '1:1', '9:16', '1.91:1'] as AspectRatio[]).map(ratio => (
                            <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`py-1.5 text-sm rounded-md transition-all duration-200 ${aspectRatio === ratio ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{ratio}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <h5 className="text-xs text-white/60 mb-1.5">Logo Position</h5>
                     <div className="grid grid-cols-2 gap-1.5">
                        {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as LogoPosition[]).map(pos => (
                             <button key={pos} onClick={() => setLogoPosition(pos)} className={`py-2 text-xs rounded-md transition-all duration-200 ${logoPosition === pos ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{pos.split('-').map(p => p.charAt(0).toUpperCase()).join('')}</button>
                        ))}
                         <button onClick={() => setLogoPosition('center')} className={`py-2 text-xs rounded-md transition-all duration-200 col-span-2 ${logoPosition === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Center</button>
                    </div>
                </div>
            </div>
        </ControlGroup>

        <div className="mt-auto pt-4">
            <Button onClick={handleEnhanceClick} variant="primary" icon={<Icon type="sparkles" />} className="w-full text-lg py-3.5">
              Enhance with AI
            </Button>
        </div>
      </div>
    </div>
  );
};

export default EditView;