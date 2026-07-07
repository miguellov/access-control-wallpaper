import { DEFAULT_DEVICE_ID, DEVICES } from './resolutions';

export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function isStandaloneApp(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function detectBestDeviceId(): string {
  const short = Math.min(window.screen.width, window.screen.height);
  const long = Math.max(window.screen.width, window.screen.height);

  let bestId = DEFAULT_DEVICE_ID;
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const device of DEVICES) {
    const diff = Math.abs(device.width - short) + Math.abs(device.height - long);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestId = device.id;
    }
  }

  return bestId;
}

export function getPreviewScale(deviceWidth: number): number {
  const horizontalPadding = 48;
  const maxPreviewWidth = Math.min(window.innerWidth - horizontalPadding, 300);
  return Math.min(0.45, Math.max(0.24, maxPreviewWidth / deviceWidth));
}
