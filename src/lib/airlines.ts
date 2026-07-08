import westjetBg from '../assets/westjet-bg.jpg';
import westjetLogo from '../assets/westjet-logo.png';
import jetblueBg from '../assets/jetblue-bg.jpg';
import jetblueLogo from '../assets/jetblue-logo.png';
import deltaBg from '../assets/delta-bg.jpg';
import deltaLogo from '../assets/delta-logo.png';
import type { CustomAirline } from './configStore';
import { createCustomAirlineTheme } from './themeUtils';

export type AirlineId = string;

export interface AirlineTheme {
  id: AirlineId;
  name: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  positionColor: string;
  borderAccent: string;
  overlayRgb: string;
  logoLockScale: number;
  logoHomeScale: number;
  logoScreenBlend: boolean;
  bg: string;
  logo: string;
}

export const BUILTIN_AIRLINES: AirlineTheme[] = [
  {
    id: 'westjet',
    name: 'WestJet',
    accent: '#00abc7',
    accentBg: 'rgba(0, 171, 199, 0.12)',
    accentBorder: 'rgba(0, 171, 199, 0.4)',
    positionColor: '#00E5FF',
    borderAccent: 'rgba(0, 171, 199, 0.5)',
    overlayRgb: '6, 21, 37',
    logoLockScale: 1.1,
    logoHomeScale: 1.1,
    logoScreenBlend: false,
    bg: westjetBg,
    logo: westjetLogo,
  },
  {
    id: 'jetblue',
    name: 'JetBlue',
    accent: '#0033A0',
    accentBg: 'rgba(0, 51, 160, 0.15)',
    accentBorder: 'rgba(0, 102, 204, 0.45)',
    positionColor: '#00E5FF',
    borderAccent: 'rgba(0, 102, 204, 0.55)',
    overlayRgb: '0, 24, 72',
    logoLockScale: 1.25,
    logoHomeScale: 1.3,
    logoScreenBlend: true,
    bg: jetblueBg,
    logo: jetblueLogo,
  },
  {
    id: 'delta',
    name: 'Delta',
    accent: '#C8102E',
    accentBg: 'rgba(200, 16, 46, 0.15)',
    accentBorder: 'rgba(200, 16, 46, 0.45)',
    positionColor: '#FFFFFF',
    borderAccent: 'rgba(200, 16, 46, 0.55)',
    overlayRgb: '0, 24, 72',
    logoLockScale: 0.85,
    logoHomeScale: 0.75,
    logoScreenBlend: false,
    bg: deltaBg,
    logo: deltaLogo,
  },
];

export const AIRLINES = BUILTIN_AIRLINES;

export const DEFAULT_AIRLINE_ID: AirlineId = 'westjet';

export function isCustomAirline(id: AirlineId): boolean {
  return id.startsWith('custom-');
}

export function getAllAirlines(customAirlines: CustomAirline[] = []): AirlineTheme[] {
  return [...BUILTIN_AIRLINES, ...customAirlines.map(createCustomAirlineTheme)];
}

export function getAirline(id: AirlineId, customAirlines: CustomAirline[] = []): AirlineTheme {
  return getAllAirlines(customAirlines).find((a) => a.id === id) ?? BUILTIN_AIRLINES[0];
}
