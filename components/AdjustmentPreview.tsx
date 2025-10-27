import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ImageAdjustments, DEFAULT_IMAGE_ADJUSTMENTS } from '../types';
import { applyAdjustmentsToImage } from '../services/adjustmentService';
import Spinner from './common/Spinner';

interface AdjustmentPreviewProps {
  originalImage: string;
  adjustments: ImageAdjustments;
  maxHeight?: string;
}

const AdjustmentPreview: React.FC<AdjustmentPreviewProps> = ({
  originalImage,
  adjustments,
  maxHeight = 'h-96',
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAdjustmentsRef = useRef<ImageAdjustments>(adjustments);

  // Debounced preview update
  const updatePreview = useCallback(async () => {
    setIsProcessing(true);
    try {
      // If no adjustments, show original
      if (
        adjustments.exposure === 0 &&
        adjustments.contrast === 0 &&
        adjustments.temperature === 0 &&
        adjustments.saturation === 0 &&
        adjustments.sharpen === 0
      ) {
        setPreviewImage(originalImage);
        setError(null);
        setIsProcessing(false);
        return;
      }

      const adjusted = await applyAdjustmentsToImage(originalImage, adjustments);
      setPreviewImage(adjusted);
      setError(null);
    } catch (err) {
      setError('Failed to preview adjustments');
      console.error('Preview error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, adjustments]);

  // Debounce updates (250ms)
  useEffect(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    previewTimeoutRef.current = setTimeout(() => {
      updatePreview();
      lastAdjustmentsRef.current = adjustments;
    }, 250);

    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [adjustments, updatePreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center ${maxHeight}`}>
      {isProcessing && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm text-center p-4">
          {error}
        </div>
      )}

      {previewImage ? (
        <img
          src={previewImage}
          alt="Adjustment Preview"
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="text-gray-500 text-sm">Loading preview...</div>
      )}

      {/* Adjustment indicators */}
      {(adjustments.exposure !== 0 ||
        adjustments.contrast !== 0 ||
        adjustments.temperature !== 0 ||
        adjustments.saturation !== 0 ||
        adjustments.sharpen !== 0) && (
        <div className="absolute top-2 right-2 bg-primary-500/80 text-white text-xs px-2 py-1 rounded-full">
          Live Preview
        </div>
      )}
    </div>
  );
};

export default AdjustmentPreview;
