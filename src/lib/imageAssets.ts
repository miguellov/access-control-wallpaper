import { getAirline, type AirlineId } from './airlines';

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

const cache = new Map<AirlineId, Promise<ImageAssets>>();

export function loadAssets(airlineId: AirlineId): Promise<ImageAssets> {
  const cached = cache.get(airlineId);
  if (cached) return cached;

  const airline = getAirline(airlineId);
  const promise = Promise.all([loadImage(airline.bg), loadImage(airline.logo)]).then(([bg, logo]) => ({
    bg,
    logo,
  }));

  cache.set(airlineId, promise);
  return promise;
}
