/**
 * Enhanced EditView with Undo/Redo Support
 * Drop-in replacement for EditView with professional history management
 *
 * Usage:
 * import EditViewWithUndo from './components/EditViewWithUndo';
 * <EditViewWithUndo imageSrc={url} onEnhance={handler} onRetake={handler} />
 */

import React, { useState, useCallback, useEffect } from 'react';
import { EditOptions } from '../types';
import { ImageAdjustments, DEFAULT_ADJUSTMENTS } from '../services/imageEditorService';
import { useHistory, createAdjustmentCommand } from '../services/historyService';
import { usePresets } from '../services/presetService';
import { useAnalytics } from '../services/analyticsService';
import EditView from './EditView';
import Button from './common/Button';
import Icon from './common/Icon';

export interface EditViewWithUndoProps {
  imageSrc: string;
  onEnhance: (options: EditOptions) => void;
  onRetake: () => void;
}

/**
 * Enhanced EditView with full undo/redo, preset support, and analytics
 */
export const EditViewWithUndo: React.FC<EditViewWithUndoProps> = ({
  imageSrc,
  onEnhance,
  onRetake,
}) => {
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [editOptions, setEditOptions] = useState<EditOptions>({
    theme: 'modern',
    primaryText: 'Welcome to our dealership!',
    ctaText: 'Schedule a test drive',
    aspectRatio: 'original',
  });

  const { execute, undo, redo, canUndo, canRedo, clear: clearHistory } = useHistory();
  const { presets, createPreset, toggleFavorite, getFavorites } = usePresets();
  const { trackFeature, trackEnhancement } = useAnalytics();

  // Track when entering edit view
  useEffect(() => {
    trackFeature('entered_edit_view');
  }, [trackFeature]);

  // Wrap adjustment setter to use command pattern
  const handleAdjustmentChange = useCallback(
    (key: keyof ImageAdjustments, value: number) => {
      const oldValue = adjustments[key];
      const newAdjustments = { ...adjustments, [key]: value };

      const cmd = createAdjustmentCommand(
        `Changed ${key}`,
        newAdjustments,
        adjustments,
        setAdjustments
      );

      execute(cmd);
      trackFeature('adjusted_image', { adjustment: key, value });
    },
    [adjustments, execute, trackFeature]
  );

  const handleThemeChange = useCallback(
    (theme: 'modern' | 'luxury' | 'dynamic' | 'family') => {
      setEditOptions((prev) => ({ ...prev, theme }));
      trackFeature('changed_theme', { theme });
    },
    [trackFeature]
  );

  const handleTextChange = useCallback(
    (primaryText: string, ctaText?: string) => {
      setEditOptions((prev) => ({ ...prev, primaryText, ctaText }));
      trackFeature('changed_text');
    },
    [trackFeature]
  );

  const handleSavePreset = useCallback(() => {
    const presetName = prompt('Preset name:');
    if (presetName) {
      createPreset(presetName, adjustments, {
        description: `Theme: ${editOptions.theme}`,
        category: 'custom',
      });
      trackFeature('saved_preset');
    }
  }, [adjustments, editOptions.theme, createPreset, trackFeature]);

  const handleLoadPreset = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (preset) {
        clearHistory();
        setAdjustments(preset.adjustments);
        trackFeature('loaded_preset', { presetName: preset.name });
      }
    },
    [presets, clearHistory, trackFeature]
  );

  const handleEnhance = useCallback(async () => {
    const startTime = performance.now();

    try {
      await onEnhance(editOptions);
      const duration = performance.now() - startTime;
      trackEnhancement(true, duration, editOptions.theme);
    } catch (error) {
      trackEnhancement(false, performance.now() - startTime);
      throw error;
    }
  }, [editOptions, onEnhance, trackEnhancement]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-950">
      {/* Main edit view */}
      <div className="flex h-full flex-col">
        {/* Header with undo/redo controls */}
        <div className="border-b border-neutral-800 bg-neutral-900/50 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Edit Image</h2>

            {/* Undo/Redo buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="rounded-lg p-2 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Undo (Cmd+Z)"
                aria-label="Undo last action"
              >
                <Icon type="undo" className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="rounded-lg p-2 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Redo (Cmd+Shift+Z)"
                aria-label="Redo last action"
              >
                <Icon type="redo" className="w-5 h-5 text-white" />
              </button>

              {/* Preset buttons */}
              <div className="border-l border-neutral-700 pl-2 ml-2 flex gap-2">
                <button
                  onClick={handleSavePreset}
                  className="rounded-lg px-3 py-2 text-sm font-medium bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 transition-colors"
                  title="Save current adjustments as preset"
                >
                  <Icon type="save" className="w-4 h-4 inline mr-1" />
                  Save Preset
                </button>
              </div>
            </div>
          </div>

          {/* Favorite presets quick access */}
          {getFavorites().length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {getFavorites().slice(0, 5).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset.id)}
                  className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 transition-colors"
                  title={`Load preset: ${preset.name}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Edit view content */}
        <div className="flex-1 overflow-y-auto">
          <EditView
            imageSrc={imageSrc}
            onEnhance={handleEnhance}
            onRetake={onRetake}
          />
        </div>
      </div>

      {/* Floating action buttons */}
      <div className="absolute bottom-8 right-8 flex gap-3">
        <Button
          onClick={onRetake}
          variant="secondary"
          size="sm"
          icon={<Icon type="camera" />}
        >
          Retake
        </Button>
        <Button
          onClick={handleEnhance}
          variant="primary"
          size="sm"
          icon={<Icon type="sparkles" />}
        >
          Enhance
        </Button>
      </div>
    </div>
  );
};

export default EditViewWithUndo;
