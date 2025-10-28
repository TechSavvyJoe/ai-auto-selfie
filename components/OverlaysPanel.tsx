import React from 'react';
import { PremiumButton, IconButton } from './common/PremiumButton';
import SegmentedControl from './common/SegmentedControl';
import Slider from './common/Slider';
import Icon from './common/Icon';
import { OverlayItem, TextOverlay, StickerOverlay, OverlayPosition } from '../types';

export interface OverlaysPanelProps {
  overlays: OverlayItem[];
  onChange: (overlays: OverlayItem[]) => void;
}

const positions: OverlayPosition[] = [
  'top-left', 'top', 'top-right',
  'left', 'center', 'right',
  'bottom-left', 'bottom', 'bottom-right',
];

const emojiSet = ['✨', '🔥', '❤️', '🎉', '😎', '💯', '🌟', '🚀', '💖', '📸'];

export const OverlaysPanel: React.FC<OverlaysPanelProps> = ({ overlays, onChange }) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const addText = () => {
    const item: TextOverlay = {
      id: `text_${Date.now()}`,
      type: 'text',
      text: 'Your caption',
      color: '#ffffff',
      bgColor: 'rgba(0,0,0,0.35)',
      position: 'bottom',
      scale: 1,
      opacity: 1,
      fontSize: 24,
      fontWeight: 'bold' as const,
      textAlign: 'center' as const,
      shadowBlur: 2,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      shadowColor: '#000000',
    };
    onChange([...overlays, item]);
    setActiveId(item.id);
  };

  const addEmoji = (emoji: string) => {
    const item: StickerOverlay = {
      id: `sticker_${Date.now()}`,
      type: 'sticker',
      emoji,
      position: 'top-right',
      scale: 1,
      opacity: 1,
    };
    onChange([...overlays, item]);
    setActiveId(item.id);
  };

  const update = (id: string, patch: Partial<OverlayItem> & Partial<TextOverlay> & Partial<StickerOverlay>) => {
    onChange(overlays.map(o => (o.id === id ? { ...o, ...patch } as OverlayItem : o)));
  };

  const remove = (id: string) => {
    onChange(overlays.filter(o => o.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const active = overlays.find(o => o.id === activeId) || null;

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-800/50 rounded-xl shadow-md">
      <h3 className="text-sm font-bold text-white/80 border-b border-white/10 pb-2 mb-2">Overlays</h3>

      {/* Quick actions */}
      <div className="flex flex-col gap-3">
        <PremiumButton
          variant="primary"
          size="sm"
          icon={<span className="text-lg">📝</span>}
          onClick={addText}
          fullWidth
        >
          Add Text
        </PremiumButton>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Quick stickers:</span>
          <div className="flex items-center gap-1 flex-wrap">
            {emojiSet.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => addEmoji(e)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-primary-500/30 transition-all duration-200 text-lg hover:scale-110"
                aria-label={`Add ${e} sticker`}
                title={`Add ${e} sticker`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List overlays */}
      {overlays.length > 0 ? (
        <div className="space-y-2">
          {overlays.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setActiveId(o.id)}
              className={`w-full text-left px-3 py-2 text-xs rounded-md border transition-colors flex items-center justify-between ${
                activeId === o.id ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-700 border-gray-600 hover:border-gray-500'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="inline-flex w-5 justify-center">{o.type === 'text' ? '✏️' : '⭐'}</span>
                {o.type === 'text' ? (o as TextOverlay).text : (o as StickerOverlay).emoji || 'Sticker'}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(o.id); }}
                className="p-1 rounded hover:bg-red-500/20"
                aria-label="Remove overlay"
                title="Remove overlay"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-red-400" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.5 4.478V5.25h3.25a.75.75 0 1 1 0 1.5h-.31l-.559 11.177A2.25 2.25 0 0 1 16.64 20H7.36a2.25 2.25 0 0 1-2.241-2.073L4.56 6.75h-.31a.75.75 0 0 1 0-1.5H7.5v-.772C7.5 3.597 8.097 3 8.828 3h6.344c.73 0 1.328.597 1.328 1.478ZM9.75 8.25a.75.75 0 1 0-1.5 0l.375 8.25a.75.75 0 0 0 1.5 0l-.375-8.25Zm6.5 0a.75.75 0 0 0-1.5 0l-.375 8.25a.75.75 0 0 0 1.5 0l.375-8.25Z" clipRule="evenodd" />
                </svg>
              </button>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-xs text-white/60">No overlays yet. Add text or an emoji sticker.</div>
      )}

      {/* Editor for active item */}
      {active && (
        <div className="mt-2 space-y-3 p-2 bg-gray-800/30 rounded-md">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/60">Type</div>
            <div className="text-xs font-semibold">{active.type === 'text' ? 'Text' : 'Sticker'}</div>
          </div>

          {/* Position */}
          <div>
            <div className="text-xs text-white/60 mb-1.5">Position</div>
            <SegmentedControl<OverlayPosition>
              options={positions.map(p => ({ value: p, label: p.replace('-', ' ') }))}
              value={active.position}
              onChange={(val) => update(active.id, { position: val })}
            />
          </div>

          {/* Scale */}
          <Slider
            label="Size"
            icon="📏"
            value={Math.round((active.scale ?? 1) * 100)}
            onChange={(v) => update(active.id, { scale: v / 100 })}
            min={50}
            max={300}
            unit="%"
          />

          {/* Rotation */}
          <Slider
            label="Rotate"
            icon="🔄"
            value={Math.round(active.rotation ?? 0)}
            onChange={(v) => update(active.id, { rotation: v })}
            min={-180}
            max={180}
            unit="°"
          />

          {/* Opacity */}
          <Slider
            label="Opacity"
            icon="🫥"
            value={Math.round((active.opacity ?? 1) * 100)}
            onChange={(v) => update(active.id, { opacity: v / 100 })}
            min={20}
            max={100}
            unit="%"
          />

          {active.type === 'text' && (
            <div className="space-y-3 p-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-primary-500/20">
              <div>
                <div className="text-xs text-white/60 font-semibold mb-2">✏️ Text Content</div>
                <input
                  type="text"
                  value={(active as TextOverlay).text}
                  onChange={(e) => update(active.id, { text: e.target.value })}
                  maxLength={64}
                  placeholder="Enter caption text"
                  aria-label="Caption text"
                  title="Caption text"
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Font Size */}
              <Slider
                label="Font Size"
                icon="A"
                value={(active as TextOverlay).fontSize || 24}
                onChange={(v) => update(active.id, { fontSize: v })}
                min={12}
                max={72}
                unit="px"
              />

              {/* Font Weight */}
              <div>
                <div className="text-xs text-white/60 font-semibold mb-1.5">Font Weight</div>
                <div className="flex gap-1">
                  {['normal', 'bold'].map(weight => (
                    <button
                      key={weight}
                      type="button"
                      onClick={() => update(active.id, { fontWeight: weight as 'normal' | 'bold' })}
                      className={`flex-1 px-2 py-1.5 text-xs rounded transition-all ${
                        (active as TextOverlay).fontWeight === weight
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-700 text-white/70 hover:bg-gray-600'
                      }`}
                    >
                      {weight === 'bold' ? '𝗕' : 'B'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <div className="text-xs text-white/60 font-semibold mb-1.5">Alignment</div>
                <div className="flex gap-1">
                  {['left', 'center', 'right'].map(align => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => update(active.id, { textAlign: align as 'left' | 'center' | 'right' })}
                      className={`flex-1 px-2 py-1.5 text-xs rounded transition-all ${
                        (active as TextOverlay).textAlign === align
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-700 text-white/70 hover:bg-gray-600'
                      }`}
                    >
                      {align.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-white/60 mb-1">Text Color</div>
                  <input
                    type="color"
                    value={(active as TextOverlay).color || '#ffffff'}
                    onChange={(e) => update(active.id, { color: e.target.value })}
                    aria-label="Text color"
                    title="Text color"
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Background</div>
                  <input
                    type="color"
                    value={(active as TextOverlay).bgColor || '#000000'}
                    onChange={(e) => update(active.id, { bgColor: e.target.value })}
                    aria-label="Background color"
                    title="Background color"
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Text Shadow */}
              <Slider
                label="Text Shadow"
                icon="✨"
                value={(active as TextOverlay).shadowBlur || 0}
                onChange={(v) => update(active.id, { shadowBlur: v })}
                min={0}
                max={20}
                unit="px"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OverlaysPanel;
