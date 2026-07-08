import type { AirlineTheme } from './airlines';
import type { CustomAirline } from './configStore';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = Number.parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function createCustomAirlineTheme(custom: CustomAirline): AirlineTheme {
  const { r, g, b } = hexToRgb(custom.accent);
  const overlayR = Math.round(r * 0.08);
  const overlayG = Math.round(g * 0.08);
  const overlayB = Math.round(b * 0.2);

  return {
    id: custom.id,
    name: custom.name,
    accent: custom.accent,
    accentBg: `rgba(${r}, ${g}, ${b}, 0.12)`,
    accentBorder: `rgba(${r}, ${g}, ${b}, 0.4)`,
    positionColor: '#00E5FF',
    borderAccent: `rgba(${r}, ${g}, ${b}, 0.5)`,
    overlayRgb: `${overlayR}, ${overlayG}, ${overlayB}`,
    logoLockScale: 1,
    logoHomeScale: 1,
    logoScreenBlend: false,
    bg: custom.bgDataUrl,
    logo: custom.logoDataUrl,
  };
}
