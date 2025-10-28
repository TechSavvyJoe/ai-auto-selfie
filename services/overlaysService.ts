/**
 * Overlays Service
 * Compose text and sticker overlays onto an image
 */

import { OverlayItem, TextOverlay, StickerOverlay } from '../types';

export interface ComposeOptions {
  background?: string; // optional background fill before drawing
}

/** Map position keyword to pixel coordinates */
function resolvePosition(
  position: TextOverlay['position'],
  canvasWidth: number,
  canvasHeight: number,
  boxWidth: number,
  boxHeight: number,
  padding: number = 24
): { x: number; y: number } {
  const positions: Record<NonNullable<TextOverlay['position']>, { x: number; y: number }> = {
    'top-left': { x: padding, y: padding },
    top: { x: (canvasWidth - boxWidth) / 2, y: padding },
    'top-right': { x: canvasWidth - boxWidth - padding, y: padding },
    left: { x: padding, y: (canvasHeight - boxHeight) / 2 },
    center: { x: (canvasWidth - boxWidth) / 2, y: (canvasHeight - boxHeight) / 2 },
    right: { x: canvasWidth - boxWidth - padding, y: (canvasHeight - boxHeight) / 2 },
    'bottom-left': { x: padding, y: canvasHeight - boxHeight - padding },
    bottom: { x: (canvasWidth - boxWidth) / 2, y: canvasHeight - boxHeight - padding },
    'bottom-right': { x: canvasWidth - boxWidth - padding, y: canvasHeight - boxHeight - padding },
  };
  return positions[position] || positions.center;
}

function drawText(ctx: CanvasRenderingContext2D, overlay: TextOverlay, canvasWidth: number, canvasHeight: number) {
  const scale = overlay.scale ?? 1;
  const fontBase = 36; // px
  const fontSize = Math.max(14, Math.min(120, fontBase * scale));
  const fontWeight = overlay.fontWeight === 'black' ? 900 : overlay.fontWeight === 'bold' ? 700 : 500;
  const fontFamily = overlay.fontFamily || 'Inter, Arial, sans-serif';

  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const metrics = ctx.measureText(overlay.text);
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.2;

  let { x, y } = resolvePosition(overlay.position, canvasWidth, canvasHeight, textWidth, textHeight);
  x += overlay.offsetX ?? 0;
  y += overlay.offsetY ?? 0;

  if (overlay.rotation) {
    ctx.translate(x + textWidth / 2, y + textHeight / 2);
    ctx.rotate((overlay.rotation * Math.PI) / 180);
  } else {
    ctx.translate(x, y);
  }

  // Background pill (optional)
  if (overlay.bgColor) {
    const paddingX = Math.max(12, fontSize * 0.3);
    const paddingY = Math.max(6, fontSize * 0.2);
    const w = textWidth + paddingX * 2;
    const h = textHeight + paddingY * 2;
    ctx.fillStyle = overlay.bgColor;
    const radius = Math.min(16, h / 2);
    // rounded rect
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(w - radius, 0);
    ctx.quadraticCurveTo(w, 0, w, radius);
    ctx.lineTo(w, h - radius);
    ctx.quadraticCurveTo(w, h, w - radius, h);
    ctx.lineTo(radius, h);
    ctx.quadraticCurveTo(0, h, 0, h - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.globalAlpha = overlay.opacity ?? 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.translate(paddingX, paddingY);
  }

  // Text with subtle stroke for readability
  ctx.lineWidth = Math.max(1, fontSize / 18);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.fillStyle = overlay.color || '#ffffff';

  ctx.strokeText(overlay.text, 0, textHeight / 2);
  ctx.fillText(overlay.text, 0, textHeight / 2);

  ctx.restore();
}

async function drawSticker(
  ctx: CanvasRenderingContext2D,
  overlay: StickerOverlay,
  canvasWidth: number,
  canvasHeight: number
) {
  const scale = overlay.scale ?? 1;
  const size = Math.max(48, Math.min(512, 120 * scale));

  if (overlay.emoji) {
    ctx.save();
    ctx.font = `${size}px system-ui, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji`;
    const metrics = ctx.measureText(overlay.emoji);
    const w = metrics.width;
    const h = size * 1.1;
  let { x, y } = resolvePosition(overlay.position, canvasWidth, canvasHeight, w, h);
  x += overlay.offsetX ?? 0;
  y += overlay.offsetY ?? 0;

    if (overlay.rotation) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((overlay.rotation * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);
    } else {
      ctx.translate(x, y);
    }

    ctx.globalAlpha = overlay.opacity ?? 1;
    ctx.fillText(overlay.emoji, 0, size);
    ctx.globalAlpha = 1;
    ctx.restore();
    return;
  }

  if (overlay.imageUrl) {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        const aspect = img.width / img.height;
        const w = size;
        const h = size / aspect;
  let { x, y } = resolvePosition(overlay.position, canvasWidth, canvasHeight, w, h);
  x += overlay.offsetX ?? 0;
  y += overlay.offsetY ?? 0;

        if (overlay.rotation) {
          ctx.translate(x + w / 2, y + h / 2);
          ctx.rotate((overlay.rotation * Math.PI) / 180);
          ctx.translate(-w / 2, -h / 2);
        } else {
          ctx.translate(x, y);
        }

        ctx.globalAlpha = overlay.opacity ?? 1;
        ctx.drawImage(img, 0, 0, w, h);
        ctx.globalAlpha = 1;
        ctx.restore();
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load sticker image'));
      img.src = overlay.imageUrl!;
    });
  }
}

export async function composeOverlays(
  baseImageUrl: string,
  overlays: OverlayItem[],
  options?: ComposeOptions
): Promise<string> {
  if (!overlays || overlays.length === 0) return baseImageUrl;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      if (options?.background) {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      for (const overlay of overlays) {
        if (overlay.type === 'text') {
          drawText(ctx, overlay as TextOverlay, canvas.width, canvas.height);
        } else if (overlay.type === 'sticker') {
          // eslint-disable-next-line no-await-in-loop
          await drawSticker(ctx, overlay as StickerOverlay, canvas.width, canvas.height);
        }
      }

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = () => reject(new Error('Failed to load base image'));
    img.src = baseImageUrl;
  });
}
