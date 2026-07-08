import { getAirline } from './airlines';
import type { CustomAirline } from './configStore';

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

const cache = new Map<string, Promise<ImageAssets>>();

export function clearAssetCache(): void {
  cache.clear();
}

export function loadAssets(
  airlineId: string,
  customAirlines: CustomAirline[] = [],
): Promise<ImageAssets> {
  const airline = getAirline(airlineId, customAirlines);
  const cacheKey = `${airlineId}:${airline.bg}:${airline.logo}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const promise = Promise.all([loadImage(airline.bg), loadImage(airline.logo)]).then(([bg, logo]) => ({
    bg,
    logo,
  }));

  cache.set(cacheKey, promise);
  return promise;
}
