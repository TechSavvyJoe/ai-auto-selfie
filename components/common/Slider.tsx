/**
 * Advanced Slider Component
 * For adjusting values with visual feedback and labels
 */

import React, { useCallback, useState } from 'react';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  icon?: React.ReactNode;
  showValue?: boolean;
  unit?: string;
  disabled?: boolean;
  onReset?: () => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = -100,
  max = 100,
  step = 1,
  label,
  icon,
  showValue = true,
  unit = '',
  disabled = false,
  onReset,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;
  const isNeutral = value === 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  const handleReset = useCallback(() => {
    onChange(0);
    onReset?.();
  }, [onChange, onReset]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label & Value Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-neutral-400">{icon}</span>}
          {label && <label className="text-sm font-medium text-neutral-300">{label}</label>}
        </div>
        <div className="flex items-center gap-2">
          {showValue && (
            <span
              className={`text-sm font-semibold ${isNeutral ? 'text-neutral-500' : 'text-primary-400'}`}
            >
              {value > 0 ? '+' : ''}
              {value}
              {unit}
            </span>
          )}
          {!isNeutral && (
            <button
              onClick={handleReset}
              className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Reset to default"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative pt-2">
        {/* Background track */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-neutral-700 rounded-full" />

        {/* Center line (0 value indicator) */}
        {min < 0 && max > 0 && (
          <div
            className="absolute top-3.5 h-2 w-0.5 bg-neutral-600 rounded-full"
            style={{
              left: `${((0 - min) / (max - min)) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          />
        )}

        {/* Progress track (filled portion) */}
        <div
          className={`absolute top-4 h-1 rounded-full transition-all ${
            isNeutral
              ? 'bg-neutral-600'
              : value > 0
                ? 'bg-primary-500'
                : 'bg-warning-500'
          }`}
          style={{
            left: min < 0 ? `${((0 - min) / (max - min)) * 100}%` : '0',
            right: value > 0 ? `${100 - ((value - min) / (max - min)) * 100}%` : 'auto',
            width:
              min < 0
                ? `${Math.abs((value / (max - min)) * 100)}%`
                : `${((value - min) / (max - min)) * 100}%`,
          }}
        />

        {/* Input slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className="relative w-full h-2 bg-transparent rounded-full appearance-none cursor-pointer z-10 pointer-events-none"
          style={{
            WebkitAppearance: 'slider-horizontal',
            WebkitSliderThumb: {
              WebkitAppearance: 'none',
              appearance: 'none',
            },
          } as any}
        />

        {/* Custom thumb */}
        <style>{`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #5a9bff 0%, #2d65ff 100%);
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(90, 155, 255, 0.4);
            transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
          }

          input[type='range']::-webkit-slider-thumb:hover,
          input[type='range']::-webkit-slider-thumb:active {
            width: 24px;
            height: 24px;
            box-shadow: 0 4px 12px rgba(90, 155, 255, 0.6);
          }

          input[type='range']::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #5a9bff 0%, #2d65ff 100%);
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(90, 155, 255, 0.4);
            transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          }

          input[type='range']::-moz-range-thumb:hover,
          input[type='range']::-moz-range-thumb:active {
            width: 24px;
            height: 24px;
            box-shadow: 0 4px 12px rgba(90, 155, 255, 0.6);
          }

          input[type='range']:disabled::-webkit-slider-thumb {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>

      {/* Range indicators */}
      <div className="flex justify-between text-xs text-neutral-500 px-1">
        <span>{min}%</span>
        <span>0%</span>
        <span>{max}%</span>
      </div>
    </div>
  );
};

export default Slider;
