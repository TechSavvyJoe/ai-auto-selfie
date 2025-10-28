/**
 * Overlays Service
 * Compose text and sticker overlays onto an image
 */

import { OverlayItem, TextOverlay, StickerOverlay } from '../types';

export interface ComposeOptions {
  background?: string; // optional background fill before drawing
}

/** Light utils */
function parseColorToRGB(color?: string): { r: number; g: number; b: number } {
  if (!color) return { r: 255, g: 255, b: 255 };
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return { r: 255, g: 255, b: 255 };
  ctx.fillStyle = color;
  // This forces the browser to resolve the color string
  const computed = ctx.fillStyle as string;
  // Handle rgb(a) or hex
  if (computed.startsWith('#')) {
    const hex = computed.slice(1);
    const bigint = parseInt(hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }
  const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (m) return { r: parseInt(m[1], 10), g: parseInt(m[2], 10), b: parseInt(m[3], 10) };
  return { r: 255, g: 255, b: 255 };
}

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
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
    'auto': { x: (canvasWidth - boxWidth) / 2, y: (canvasHeight - boxHeight) / 2 },
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

function findBestAutoPosition(
  baseCtx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  textWidth: number,
  textHeight: number,
  textColor?: string
) {
  // Downscale current canvas (with base image drawn) for fast analysis
  const SAMPLE_MAX = 160;
  const scale = Math.min(SAMPLE_MAX / canvasWidth, SAMPLE_MAX / canvasHeight, 1);
  const sw = Math.max(1, Math.round(canvasWidth * scale));
  const sh = Math.max(1, Math.round(canvasHeight * scale));
  const off = document.createElement('canvas');
  off.width = sw; off.height = sh;
  const octx = off.getContext('2d')!;
  octx.drawImage(baseCtx.canvas, 0, 0, sw, sh);
  const img = octx.getImageData(0, 0, sw, sh);

  // Build luminance and simple edge map (Sobel)
  const lum = new Float32Array(sw * sh);
  for (let i = 0; i < sw * sh; i++) {
    const r = img.data[i * 4 + 0];
    const g = img.data[i * 4 + 1];
    const b = img.data[i * 4 + 2];
    lum[i] = luminance(r, g, b);
  }
  const edge = new Float32Array(sw * sh);
  const kx = [ -1, 0, 1, -2, 0, 2, -1, 0, 1 ];
  const ky = [ -1, -2, -1, 0, 0, 0, 1, 2, 1 ];
  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      let gx = 0, gy = 0;
      let idx = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i2 = -1; i2 <= 1; i2++) {
          const px = x + i2;
          const py = y + j;
          const p = py * sw + px;
          gx += lum[p] * kx[idx];
          gy += lum[p] * ky[idx];
          idx++;
        }
      }
      const g = Math.sqrt(gx * gx + gy * gy);
      edge[y * sw + x] = g;
    }
  }

  const textBrightness = (() => {
    const { r, g, b } = parseColorToRGB(textColor);
    return luminance(r, g, b); // 0..255
  })();

  const pad = Math.round(24 * scale);
  const tw = Math.max(1, Math.round(textWidth * scale));
  const th = Math.max(1, Math.round(textHeight * scale));

  const candidates: Array<{ key: string; x: number; y: number }> = [
    { key: 'top-left', x: pad, y: pad },
    { key: 'top', x: Math.max(pad, Math.round((sw - tw) / 2)), y: pad },
    { key: 'top-right', x: Math.max(pad, sw - tw - pad), y: pad },
    { key: 'left', x: pad, y: Math.max(pad, Math.round((sh - th) / 2)) },
    { key: 'center', x: Math.max(pad, Math.round((sw - tw) / 2)), y: Math.max(pad, Math.round((sh - th) / 2)) },
    { key: 'right', x: Math.max(pad, sw - tw - pad), y: Math.max(pad, Math.round((sh - th) / 2)) },
    { key: 'bottom-left', x: pad, y: Math.max(pad, sh - th - pad) },
    { key: 'bottom', x: Math.max(pad, Math.round((sw - tw) / 2)), y: Math.max(pad, sh - th - pad) },
    { key: 'bottom-right', x: Math.max(pad, sw - tw - pad), y: Math.max(pad, sh - th - pad) },
  ];

  const scoreRect = (sx: number, sy: number, w: number, h: number) => {
    let sumEdge = 0;
    let sumLum = 0;
    let count = 0;
    for (let yy = sy; yy < Math.min(sy + h, sh); yy++) {
      for (let xx = sx; xx < Math.min(sx + w, sw); xx++) {
        const p = yy * sw + xx;
        sumEdge += edge[p];
        sumLum += lum[p];
        count++;
      }
    }
    const meanEdge = count ? sumEdge / count : 0;
    const meanLum = count ? sumLum / count : 127;
    const edgeScore = 1 - Math.min(1, meanEdge / 128); // favor low-detail regions
    const contrastScore = Math.min(1, Math.abs(meanLum - textBrightness) / 180); // favor contrast from text brightness
    return 0.6 * edgeScore + 0.4 * contrastScore;
  };

  let best = candidates[0];
  let bestScore = -Infinity;
  for (const c of candidates) {
    const sc = scoreRect(c.x, c.y, tw, th);
    if (sc > bestScore) {
      best = c; bestScore = sc;
    }
  }

  // Map back to full-res coordinates
  const fx = Math.round(best.x / scale);
  const fy = Math.round(best.y / scale);
  const chosen: TextOverlay['position'] = (best.key as any);
  return { position: chosen, x: fx, y: fy, score: bestScore };
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

  let x: number; let y: number;
  if (overlay.position === 'auto') {
    // Analyze current canvas (with base image) to pick the best placement
    const auto = findBestAutoPosition(ctx, canvasWidth, canvasHeight, textWidth, textHeight, overlay.color);
    const resolved = resolvePosition(auto.position, canvasWidth, canvasHeight, textWidth, textHeight);
    // Use resolved x/y for anchor, then overwrite with computed offsets
    x = auto.x; y = auto.y;
    // If contrast is weak, enable a subtle pill background automatically
    // Heuristic: recompute contrast at chosen rect
    // Downscale logic already computed; simpler: use chosen background average via small sample
    const sample = ctx.getImageData(Math.max(0, x), Math.max(0, y), Math.min(canvasWidth - x, Math.round(textWidth)), Math.min(canvasHeight - y, Math.round(textHeight)));
    let sum = 0; for (let i = 0; i < sample.data.length; i += 4) { sum += luminance(sample.data[i], sample.data[i+1], sample.data[i+2]); }
    const avgLum = sample.data.length ? sum / (sample.data.length / 4) : 127;
    const { r, g, b } = parseColorToRGB(overlay.color || '#ffffff');
    const textLum = luminance(r, g, b);
    const contrast = Math.abs(avgLum - textLum);
    const needsPill = contrast < 90; // threshold tuned empirically
    if (needsPill && !overlay.bgColor) {
      // Draw a local pill with adaptive color
      const darkText = textLum < 128;
      (overlay as any).__autoBg = darkText ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)';
    }
  } else {
    const pos = resolvePosition(overlay.position, canvasWidth, canvasHeight, textWidth, textHeight);
    x = pos.x + (overlay.offsetX ?? 0);
    y = pos.y + (overlay.offsetY ?? 0);
  }

  if (overlay.rotation) {
    ctx.translate(x + textWidth / 2, y + textHeight / 2);
    ctx.rotate((overlay.rotation * Math.PI) / 180);
  } else {
    ctx.translate(x, y);
  }

  // Background pill (optional)
  const bgColor = (overlay as any).__autoBg || overlay.bgColor;
  if (bgColor) {
    const paddingX = Math.max(12, fontSize * 0.3);
    const paddingY = Math.max(6, fontSize * 0.2);
    const w = textWidth + paddingX * 2;
    const h = textHeight + paddingY * 2;
    ctx.fillStyle = bgColor;
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
