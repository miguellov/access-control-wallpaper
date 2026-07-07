import type { AirlineId } from './airlines';

const SHARED_POSITIONS = [
  'OBS MAKEUP',
  'CIERRE COUNTER',
  'GATE',
  'PUERTA 1',
  'PUERTA 2',
  'RAMPA 1',
  'RAMPA 2',
  'OBSERVER RAMPA',
  'ADUANA',
] as const;

const JETBLUE_POSITIONS = [...SHARED_POSITIONS, 'CONTROL 5X5'] as const;

export const POSITIONS_BY_AIRLINE: Record<AirlineId, readonly string[]> = {
  westjet: SHARED_POSITIONS,
  jetblue: JETBLUE_POSITIONS,
};

export type Position = (typeof JETBLUE_POSITIONS)[number];

export function getPositionsForAirline(airlineId: AirlineId): readonly string[] {
  return POSITIONS_BY_AIRLINE[airlineId];
}

export const DEFAULT_POSITION = 'OBS MAKEUP';
