import { loadAssets } from './imageAssets';
import { getAirline } from './airlines';
import type { CustomAirline } from './configStore';
import type { AirlineTheme } from './airlines';
import type { WallpaperType } from './wallpaperTypes';

export interface WallpaperData {
  position: string;
  type: WallpaperType;
  airlineId: string;
  imei?: string;
  customAirlines?: CustomAirline[];
}

const BASE_WIDTH = 1080;

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  let drawW: number;
  let drawH: number;
  let drawX: number;
  let drawY: number;

  if (imgRatio > canvasRatio) {
    drawH = h;
    drawW = h * imgRatio;
    drawX = (w - drawW) / 2;
    drawY = 0;
  } else {
    drawW = w;
    drawH = w / imgRatio;
    drawX = 0;
    drawY = (h - drawH) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

function drawLockOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, theme: AirlineTheme) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, `rgba(${theme.overlayRgb}, 0.55)`);
  gradient.addColorStop(0.35, `rgba(${theme.overlayRgb}, 0.25)`);
  gradient.addColorStop(0.55, `rgba(${theme.overlayRgb}, 0.45)`);
  gradient.addColorStop(1, `rgba(${theme.overlayRgb}, 0.75)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function drawHomeOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, theme: AirlineTheme) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, `rgba(${theme.overlayRgb}, 0.35)`);
  gradient.addColorStop(0.25, `rgba(${theme.overlayRgb}, 0.05)`);
  gradient.addColorStop(0.55, `rgba(${theme.overlayRgb}, 0.1)`);
  gradient.addColorStop(0.8, `rgba(${theme.overlayRgb}, 0.35)`);
  gradient.addColorStop(1, `rgba(${theme.overlayRgb}, 0.55)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawVerticalPositionText(
  ctx: CanvasRenderingContext2D,
  text: string,
  w: number,
  h: number,
  scale: number,
  theme: AirlineTheme,
  imei?: string,
) {
  const maxLength = h * 0.78;
  let fontSize = 220 * scale;
  const upper = text.toUpperCase().replace(/\s+/g, ' ');

  for (let i = 0; i < 30; i++) {
    ctx.font = `900 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
    ctx.letterSpacing = `${4 * scale}px`;
    if (ctx.measureText(upper).width <= maxLength) break;
    fontSize -= 3 * scale;
  }

  const textWidth = ctx.measureText(upper).width;
  let barW = fontSize * 1.55;
  const centerX = w * 0.5;
  const centerY = h * 0.48;

  let imeiSize = 0;
  let imeiLabel = '';
  if (imei) {
    imeiLabel = `IMEI ${imei}`;
    imeiSize = Math.min(48 * scale, fontSize * 0.28);
    const imeiMaxWidth = textWidth * 0.98;
    ctx.font = `700 ${imeiSize}px "Consolas", "Segoe UI", monospace`;
    ctx.letterSpacing = `${1.5 * scale}px`;
    while (ctx.measureText(imeiLabel).width > imeiMaxWidth && imeiSize > 22 * scale) {
      imeiSize -= 1 * scale;
      ctx.font = `700 ${imeiSize}px "Consolas", "Segoe UI", monospace`;
    }
    // Extra room on the dark bar for the IMEI under the letters.
    barW += imeiSize * 1.85 + 20 * scale;
  }

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(Math.PI / 2);

  const barX = -textWidth / 2 - fontSize * 0.25;
  const barH = barW;
  const letterY = imei ? -(imeiSize * 0.45) : 0;

  ctx.fillStyle = `rgba(${theme.overlayRgb}, 0.55)`;
  ctx.fillRect(barX, -barH / 2, textWidth + fontSize * 0.5, barH);

  ctx.strokeStyle = theme.borderAccent;
  ctx.lineWidth = 3 * scale;
  ctx.strokeRect(barX, -barH / 2, textWidth + fontSize * 0.5, barH);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
  ctx.letterSpacing = `${4 * scale}px`;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 28 * scale;
  ctx.shadowOffsetX = 5 * scale;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = 8 * scale;
  ctx.strokeText(upper, 0, letterY);

  ctx.fillStyle = theme.positionColor;
  ctx.fillText(upper, 0, letterY);

  if (imei) {
    const imeiY = barH / 2 - imeiSize * 0.75;

    ctx.font = `700 ${imeiSize}px "Consolas", "Segoe UI", monospace`;
    ctx.letterSpacing = `${1.2 * scale}px`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetX = 2 * scale;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.lineWidth = 3.5 * scale;
    ctx.strokeText(imeiLabel, 0, imeiY);
    ctx.fillStyle = theme.positionColor;
    ctx.fillText(imeiLabel, 0, imeiY);
  }

  ctx.restore();
}

function drawPositionText(
  ctx: CanvasRenderingContext2D,
  text: string,
  w: number,
  centerY: number,
  scale: number,
  theme: AirlineTheme,
) {
  const maxWidth = w * 0.9;
  let fontSize = 120 * scale;

  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 24 * scale;
  ctx.shadowOffsetY = 6 * scale;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 6 * scale;
  ctx.fillStyle = theme.positionColor;

  const upper = text.toUpperCase();

  for (let i = 0; i < 8; i++) {
    ctx.font = `900 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
    ctx.letterSpacing = `${2 * scale}px`;
    const lines = wrapText(ctx, upper, maxWidth);
    const fits = lines.every((line) => ctx.measureText(line).width <= maxWidth);
    if (fits && lines.length <= 2) break;
    fontSize -= 8 * scale;
  }

  ctx.font = `900 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
  ctx.letterSpacing = `${2 * scale}px`;
  const lines = wrapText(ctx, upper, maxWidth);
  const lineHeight = fontSize * 1.15;
  const startY = centerY - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;
    ctx.strokeText(line, w / 2, y);
    ctx.fillText(line, w / 2, y);
  });

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function drawImeiText(
  ctx: CanvasRenderingContext2D,
  imei: string,
  w: number,
  y: number,
  scale: number,
  theme: AirlineTheme,
) {
  const label = `IMEI ${imei}`;
  let fontSize = 48 * scale;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${fontSize}px "Consolas", "Segoe UI", monospace`;
  ctx.letterSpacing = `${2 * scale}px`;

  const maxWidth = w * 0.92;
  while (ctx.measureText(label).width > maxWidth && fontSize > 28 * scale) {
    fontSize -= 2 * scale;
    ctx.font = `700 ${fontSize}px "Consolas", "Segoe UI", monospace`;
  }

  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 20 * scale;
  ctx.shadowOffsetY = 3 * scale;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.lineWidth = 7 * scale;
  ctx.strokeText(label, w / 2, y);
  ctx.fillStyle = theme.positionColor;
  ctx.fillText(label, w / 2, y);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  theme: AirlineTheme,
  withShadow = false,
) {
  if (withShadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 16 * (width / 200);
  }

  if (theme.logoScreenBlend) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(logo, x, y, width, height);
    ctx.restore();
  } else {
    ctx.drawImage(logo, x, y, width, height);
  }

  ctx.shadowBlur = 0;
}

function drawLockScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: WallpaperData,
  scale: number,
  bg: HTMLImageElement,
  logo: HTMLImageElement,
  theme: AirlineTheme,
) {
  drawCoverImage(ctx, bg, w, h);
  drawLockOverlay(ctx, w, h, theme);

  ctx.textAlign = 'center';

  const logoWidth = 235 * scale * theme.logoLockScale;
  const logoHeight = (logo.height / logo.width) * logoWidth;
  const logoX = (w - logoWidth) / 2;
  const logoY = h * 0.14;

  drawLogo(ctx, logo, logoX, logoY, logoWidth, logoHeight, theme);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = `600 ${28 * scale}px "Segoe UI", system-ui, sans-serif`;
  ctx.letterSpacing = `${12 * scale}px`;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 14 * scale;
  ctx.shadowOffsetY = 2 * scale;
  ctx.fillText('ACCESS CONTROL', w / 2, logoY - 28 * scale);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  drawPositionText(ctx, data.position, w, h * 0.56, scale, theme);

  if (data.imei) {
    drawImeiText(ctx, data.imei, w, h * 0.72, scale, theme);
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = `400 ${15 * scale}px "Segoe UI", system-ui, sans-serif`;
  ctx.letterSpacing = `${5 * scale}px`;
  ctx.fillText('ACCESO AUTORIZADO', w / 2, h * 0.9);
}

function drawHomeScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  data: WallpaperData,
  scale: number,
  bg: HTMLImageElement,
  logo: HTMLImageElement,
  theme: AirlineTheme,
) {
  drawCoverImage(ctx, bg, w, h);
  drawHomeOverlay(ctx, w, h, theme);

  const logoWidth = 140 * scale * theme.logoHomeScale;
  const logoHeight = (logo.height / logo.width) * logoWidth;
  const logoX = (w - logoWidth) / 2;
  const logoY = h * 0.06;

  drawLogo(ctx, logo, logoX, logoY, logoWidth, logoHeight, theme, true);

  drawVerticalPositionText(ctx, data.position, w, h, scale, theme, data.imei);
}

export async function renderWallpaper(
  canvas: HTMLCanvasElement,
  data: WallpaperData,
  width: number,
  height: number,
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const theme = getAirline(data.airlineId, data.customAirlines);
  const { bg, logo } = await loadAssets(data.airlineId, data.customAirlines);

  canvas.width = width;
  canvas.height = height;

  const scale = width / BASE_WIDTH;

  if (data.type === 'home') {
    drawHomeScreen(ctx, width, height, data, scale, bg, logo, theme);
  } else {
    drawLockScreen(ctx, width, height, data, scale, bg, logo, theme);
  }
}

export function downloadWallpaper(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
