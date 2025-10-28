import React, { useRef, useState, useCallback } from 'react';
import { OverlayItem, TextOverlay, StickerOverlay, OverlayPosition } from '../types';

interface InteractiveOverlayLayerProps {
  overlays: OverlayItem[];
  onChange: (next: OverlayItem[]) => void;
  imageRect: { x: number; y: number; width: number; height: number };
  naturalSize: { width: number; height: number };
}

function resolveAnchor(position: OverlayPosition, imgRect: { x: number; y: number; width: number; height: number }) {
  const { x, y, width, height } = imgRect;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const positions: Record<OverlayPosition, { x: number; y: number }> = {
    'top-left': { x, y },
    'top': { x: cx, y },
    'top-right': { x: x + width, y },
    'left': { x, y: cy },
    'center': { x: cx, y: cy },
    'right': { x: x + width, y: cy },
    'bottom-left': { x, y: y + height },
    'bottom': { x: cx, y: y + height },
    'bottom-right': { x: x + width, y: y + height },
  };
  return positions[position] || positions.center;
}

const OverlayHandle: React.FC<{
  overlay: OverlayItem;
  style: React.CSSProperties;
  isActive: boolean;
}> = ({ overlay, style, isActive }) => {
  const base = 'absolute inline-flex items-center justify-center select-none rounded px-2 py-1 text-[10px] font-semibold';
  if (overlay.type === 'text') {
    const t = overlay as TextOverlay;
    return (
      <div
        role="button"
        className={`${base} ${isActive ? 'ring-2 ring-primary-400' : ''}`}
        style={{
          ...style,
          color: t.color || '#fff',
          background: t.bgColor || 'rgba(0,0,0,0.35)',
          transform: `translate(-50%, -50%) rotate(${t.rotation || 0}deg) scale(${t.scale || 1})`,
          pointerEvents: 'auto',
        }}
        aria-label={`Drag overlay: ${(t as any).text ?? 'text'}`}
      >
        {(t as any).text ?? 'Text'}
      </div>
    );
  }
  const s = overlay as StickerOverlay;
  return (
    <div
      role="button"
      className={`${base} ${isActive ? 'ring-2 ring-primary-400' : ''}`}
      style={{
        ...style,
        background: 'rgba(0,0,0,0.2)',
        transform: `translate(-50%, -50%) rotate(${s.rotation || 0}deg) scale(${s.scale || 1})`,
        pointerEvents: 'auto',
      }}
      aria-label={`Drag sticker ${s.emoji || ''}`}
    >
      <span className="text-lg">{s.emoji || '⭐'}</span>
    </div>
  );
};

const InteractiveOverlayLayer: React.FC<InteractiveOverlayLayerProps> = ({ overlays, onChange, imageRect, naturalSize }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const scale = Math.min(imageRect.width / (naturalSize.width || 1), imageRect.height / (naturalSize.height || 1));

  const handlePointerDown = useCallback((e: React.PointerEvent, id: string) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setActiveId(id);
    lastPoint.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent, id: string) => {
    if (!lastPoint.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    if (dx === 0 && dy === 0) return;
    lastPoint.current = { x: e.clientX, y: e.clientY };

    // update overlay by id
    onChange(
      overlays.map((o) => {
        if (o.id !== id) return o;
        const deltaXImage = dx / (scale || 1);
        const deltaYImage = dy / (scale || 1);
        return {
          ...o,
          offsetX: (o.offsetX || 0) + deltaXImage,
          offsetY: (o.offsetY || 0) + deltaYImage,
        } as OverlayItem;
      })
    );
  }, [onChange, overlays, scale]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    lastPoint.current = null;
  }, []);

  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      {overlays.map((o) => {
        const anchor = resolveAnchor(o.position, imageRect);
        const x = anchor.x + (o.offsetX || 0) * (scale || 1);
        const y = anchor.y + (o.offsetY || 0) * (scale || 1);
        return (
          <div
            key={o.id}
            style={{ position: 'absolute', left: x, top: y }}
            onPointerDown={(e) => handlePointerDown(e, o.id)}
            onPointerMove={(e) => handlePointerMove(e, o.id)}
            onPointerUp={handlePointerUp}
          >
            <OverlayHandle overlay={o} isActive={activeId === o.id} style={{}} />
          </div>
        );
      })}
    </div>
  );
};

export default InteractiveOverlayLayer;
