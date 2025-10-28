import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ImageAdjustments, OverlayItem } from '../types';
import { composeOverlays } from '../services/overlaysService';
import { applyAdjustmentsToImage } from '../services/adjustmentService';
import Spinner from './common/Spinner';

interface AdjustmentPreviewProps {
  originalImage: string;
  adjustments: ImageAdjustments;
  maxHeight?: string;
  overlays?: OverlayItem[];
  overlayRenderer?: (info: { imageRect: { x: number; y: number; width: number; height: number }; naturalSize: { width: number; height: number } }) => React.ReactNode;
}

const AdjustmentPreview: React.FC<AdjustmentPreviewProps> = ({
  originalImage,
  adjustments,
  maxHeight = 'h-96',
  overlays = [],
  overlayRenderer,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAdjustmentsRef = useRef<ImageAdjustments>(adjustments);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageRect, setImageRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  // Debounced preview update
  const updatePreview = useCallback(async () => {
    setIsProcessing(true);
    try {
      const noAdjustments =
        adjustments.exposure === 0 &&
        adjustments.contrast === 0 &&
        adjustments.temperature === 0 &&
        adjustments.saturation === 0 &&
        adjustments.sharpen === 0;

      // Determine base image (adjusted or original)
      const base = noAdjustments
        ? originalImage
        : await applyAdjustmentsToImage(originalImage, adjustments);

      // Apply overlays if present
      const finalImage = overlays && overlays.length > 0
        ? await composeOverlays(base, overlays)
        : base;

      setPreviewImage(finalImage);
      setError(null);
    } catch (err) {
      setError('Failed to preview adjustments');
      console.error('Preview error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, adjustments, overlays]);

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
  }, [adjustments, overlays, updatePreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current as HTMLImageElement | null;
    if (!container || !img) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const nw = img.naturalWidth || 1;
    const nh = img.naturalHeight || 1;
    const scale = Math.min(cw / nw, ch / nh);
    const width = Math.round(nw * scale);
    const height = Math.round(nh * scale);
    const x = Math.round((cw - width) / 2);
    const y = Math.round((ch - height) / 2);
    setImageRect({ x, y, width, height });
    setNaturalSize({ width: nw, height: nh });
  }, []);

  useEffect(() => {
    const handler = () => measure();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [measure]);

  useEffect(() => {
    // Re-measure when preview image changes
    if (previewImage) {
      // Wait a tick for layout
      setTimeout(measure, 0);
    }
  }, [previewImage, measure]);

  return (
    <div ref={containerRef} className={`relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center ${maxHeight}`}>
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
          ref={imgRef}
          src={previewImage}
          alt="Adjustment Preview"
          className="w-full h-full object-contain"
          onLoad={measure}
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
      {/* Interactive overlay layer (optional) */}
      {overlayRenderer && imageRect && naturalSize && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="false">
          {overlayRenderer({ imageRect, naturalSize })}
        </div>
      )}
    </div>
  );
};

export default AdjustmentPreview;
