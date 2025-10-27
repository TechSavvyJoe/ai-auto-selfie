import React, { useState, useCallback } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import Slider from './common/Slider';
import Spinner from './common/Spinner';
import { applyEffect, effectsLibrary, EffectName } from '../services/effectsService';

interface EffectsPanelProps {
  imageSrc: string;
  onApplyEffect: (effectName: EffectName, intensity: number, resultImage: string) => void;
  onClose?: () => void;
}

const EffectsPanel: React.FC<EffectsPanelProps> = ({ imageSrc, onApplyEffect, onClose }) => {
  const [selectedEffect, setSelectedEffect] = useState<EffectName | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApplyEffect = useCallback(async (effectName: EffectName) => {
    setSelectedEffect(effectName);
    setIsProcessing(true);
    setError(null);

    try {
      const result = await applyEffect(imageSrc, effectName, { intensity });
      setPreviewImage(result);
    } catch (err) {
      setError(`Failed to apply ${effectName} effect: ${err}`);
      setPreviewImage(null);
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, intensity]);

  const handleIntensityChange = useCallback(async (newIntensity: number) => {
    setIntensity(newIntensity);

    if (selectedEffect) {
      setIsProcessing(true);
      try {
        const result = await applyEffect(imageSrc, selectedEffect, { intensity: newIntensity });
        setPreviewImage(result);
      } catch (err) {
        setError(`Failed to update effect: ${err}`);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [imageSrc, selectedEffect]);

  const handleConfirmEffect = () => {
    if (selectedEffect && previewImage) {
      onApplyEffect(selectedEffect, intensity, previewImage);
      if (onClose) onClose();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Effects</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon type="close" className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Preview */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="relative bg-black w-full h-64 flex items-center justify-center">
          {isProcessing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <Spinner />
            </div>
          )}
          {previewImage ? (
            <img
              src={previewImage}
              alt="Effect preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={imageSrc}
              alt="Original"
              className="w-full h-full object-contain opacity-50"
            />
          )}
        </div>

        {/* Effect label */}
        {selectedEffect && (
          <div className="p-3 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white capitalize">{selectedEffect}</p>
                <p className="text-xs text-gray-400">
                  {effectsLibrary.find(e => e.name === selectedEffect)?.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Intensity</p>
                <p className="text-sm font-semibold text-primary-400">{intensity}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Intensity slider */}
      {selectedEffect && (
        <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
          <Slider
            label="Intensity"
            value={intensity}
            onChange={handleIntensityChange}
            min={0}
            max={100}
            step={5}
            onReset={() => handleIntensityChange(50)}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Effects grid */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/80">Available Effects</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {effectsLibrary.map(effect => (
            <button
              key={effect.name}
              onClick={() => handleApplyEffect(effect.name)}
              disabled={isProcessing}
              className={`p-3 rounded-lg text-xs transition-all ${
                selectedEffect === effect.name
                  ? 'bg-primary-500 text-white border-2 border-primary-400'
                  : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-gray-500'
              } disabled:opacity-50`}
              title={effect.description}
            >
              <div className="font-semibold text-center">{effect.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleConfirmEffect}
          variant="primary"
          disabled={!selectedEffect || isProcessing}
          className="flex-1"
          icon={<Icon type="check" className="w-4 h-4" />}
        >
          Apply Effect
        </Button>
        {onClose && (
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 text-xs text-blue-300 space-y-1">
        <p>• Select an effect to preview</p>
        <p>• Adjust intensity for desired strength</p>
        <p>• Click "Apply Effect" to confirm</p>
      </div>
    </div>
  );
};

export default EffectsPanel;
