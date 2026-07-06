import bgSrc from '../assets/westjet-bg.jpg';
import logoSrc from '../assets/westjet-logo.png';

export interface ImageAssets {
  bg: HTMLImageElement;
  logo: HTMLImageElement;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

let assetsPromise: Promise<ImageAssets> | null = null;

export function loadAssets(): Promise<ImageAssets> {
  if (!assetsPromise) {
    assetsPromise = Promise.all([loadImage(bgSrc), loadImage(logoSrc)]).then(([bg, logo]) => ({
      bg,
      logo,
    }));
  }
  return assetsPromise;
}
