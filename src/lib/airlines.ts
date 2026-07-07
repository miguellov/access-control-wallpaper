import westjetBg from '../assets/westjet-bg.jpg';
import westjetLogo from '../assets/westjet-logo.png';
import jetblueBg from '../assets/jetblue-bg.jpg';
import jetblueLogo from '../assets/jetblue-logo.png';

export type AirlineId = 'westjet' | 'jetblue';

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

export const AIRLINES: AirlineTheme[] = [
  {
    id: 'westjet',
    name: 'WestJet',
    accent: '#00abc7',
    accentBg: 'rgba(0, 171, 199, 0.12)',
    accentBorder: 'rgba(0, 171, 199, 0.4)',
    positionColor: '#00E5FF',
    borderAccent: 'rgba(0, 171, 199, 0.5)',
    overlayRgb: '6, 21, 37',
    logoLockScale: 1,
    logoHomeScale: 1,
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
    logoLockScale: 1.15,
    logoHomeScale: 1.2,
    logoScreenBlend: true,
    bg: jetblueBg,
    logo: jetblueLogo,
  },
];

export const DEFAULT_AIRLINE_ID: AirlineId = 'westjet';

export function getAirline(id: AirlineId): AirlineTheme {
  return AIRLINES.find((a) => a.id === id) ?? AIRLINES[0];
}
