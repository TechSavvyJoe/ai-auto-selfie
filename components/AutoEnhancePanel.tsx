import React, { useState, useCallback } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import Spinner from './common/Spinner';
import { autoEnhance, recommendStrategy, enhanceStrategies, type AutoEnhanceResult } from '../services/autoEnhanceService';
import { ImageAdjustments } from '../types';

interface AutoEnhancePanelProps {
  imageSrc: string;
  onApplyEnhancement: (adjustments: ImageAdjustments, strategy: string, enhancementLevel: string) => void;
}

const AutoEnhancePanel: React.FC<AutoEnhancePanelProps> = ({ imageSrc, onApplyEnhancement }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastEnhancementResult, setLastEnhancementResult] = useState<AutoEnhanceResult | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const handleEnhance = useCallback(async (strategyId: string) => {
    setIsProcessing(true);
    setSelectedStrategy(strategyId);
    try {
      const result = await autoEnhance(imageSrc, strategyId as any);
      setLastEnhancementResult(result);
      onApplyEnhancement(result.adjustments, result.strategy, result.enhancementLevel);
    } catch (error) {
      console.error('Auto-enhance failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, onApplyEnhancement]);

  const handleRecommend = useCallback(async () => {
    setIsProcessing(true);
    try {
      const strategy = await recommendStrategy(imageSrc);
      const result = await autoEnhance(imageSrc, strategy);
      setSelectedStrategy(result.strategy);
      onApplyEnhancement(result.adjustments, result.strategy, result.enhancementLevel);
      setLastEnhancementResult(result);
    } catch (error) {
      console.error('Recommendation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, onApplyEnhancement]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Icon type="sparkles" className="w-5 h-5 text-yellow-300" />
        <h3 className="text-sm font-bold text-white">AI Auto-Enhance</h3>
      </div>

      {lastEnhancementResult && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-blue-300">Enhancement Applied</span>
            <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded">
              {lastEnhancementResult.confidence}% confident
            </span>
          </div>
          <p className="text-xs text-blue-200/70">
            Strategy: <span className="font-medium capitalize">{lastEnhancementResult.strategy}</span> •{' '}
            <span className="capitalize">{lastEnhancementResult.enhancementLevel}</span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Button
          onClick={handleRecommend}
          disabled={isProcessing}
          variant="primary"
          className="w-full text-sm"
          icon={isProcessing ? <Spinner /> : <Icon type="wand2" className="w-4 h-4" />}
        >
          {isProcessing ? 'Analyzing...' : 'Recommend Strategy'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {enhanceStrategies.map(strategy => (
          <button
            key={strategy.id}
            onClick={() => handleEnhance(strategy.id)}
            disabled={isProcessing}
            className={`p-3 rounded-lg text-left transition-all border ${
              selectedStrategy === strategy.id && !isProcessing
                ? 'bg-primary-500/20 border-primary-500'
                : 'bg-gray-700 border-gray-600 hover:border-gray-500 disabled:opacity-50'
            } disabled:cursor-not-allowed`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white capitalize">{strategy.label}</p>
                <p className="text-[10px] text-gray-400 line-clamp-2">{strategy.description}</p>
              </div>
              <div className="text-sm">{strategy.icon}</div>
            </div>
          </button>
        ))}
      </div>

      {lastEnhancementResult?.analysisDetails && (
        <div className="bg-gray-800/50 rounded-lg p-2 text-xs text-gray-400 space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Brightness:</span>
              <span className="ml-1 font-mono">{lastEnhancementResult.analysisDetails.brightness.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-500">Contrast:</span>
              <span className="ml-1 font-mono">{lastEnhancementResult.analysisDetails.contrast.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-500">Saturation:</span>
              <span className="ml-1 font-mono">{lastEnhancementResult.analysisDetails.saturation.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-500">Color Temp:</span>
              <span className="ml-1 font-mono">{lastEnhancementResult.analysisDetails.colorTemp.toFixed(0)}K</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoEnhancePanel;
