import type { AppCustomConfig } from './configStore';
import type { InventoryDevice } from './inventory';
import { getInventoryPositions } from './inventory';
import { isCustomAirline } from './airlines';
import { getTemplatePositions } from './positionTemplates';

const WESTJET_POSITIONS = [
  'OBS MAKEUP',
  'PUERTA 1',
  'PUERTA 2',
  'RAMPA 1',
  'RAMPA 2',
  'OBS RAMPA',
  'CIERRE COUNTER',
  'GATE',
  '5X5 B6',
  'OBS MAKEUP (2)',
  'PUERTA 2 (2)',
  'ADUANA B6',
] as const;

const JETBLUE_POSITIONS = [
  'OBS MAKE UP',
  'PUERTA 1',
  'PUERTA 2',
  'RAMPA 1',
  'RAMPA 2',
  'OBS RAMPA',
  'ADUANA',
  'CONTROL 5X5',
] as const;

const DELTA_POSITIONS = [
  'MAKEUP',
  'PUERTA 1',
  'PUERTA 2',
  'RAMPA 1',
  'RAMPA 2',
  'OBS RAMPA',
] as const;

export const POSITIONS_BY_AIRLINE: Record<string, readonly string[]> = {
  westjet: WESTJET_POSITIONS,
  jetblue: JETBLUE_POSITIONS,
  delta: DELTA_POSITIONS,
};

export const DEFAULT_POSITION = 'OBS MAKEUP';

export const CUSTOM_AIRLINE_STARTER_POSITIONS = getTemplatePositions('standard');

export function resolvePosition(available: string[], current: string): string {
  if (current && available.includes(current)) return current;
  return available[0] ?? '';
}

export function getBuiltinPositions(airlineId: string): readonly string[] {
  return POSITIONS_BY_AIRLINE[airlineId] ?? [];
}

export function getPositionsForAirline(
  airlineId: string,
  config: AppCustomConfig,
  inventory: InventoryDevice[] = [],
): string[] {
  const inventoryPositions = getInventoryPositions(inventory, airlineId, true);
  const builtin = [...getBuiltinPositions(airlineId)];
  const extra = config.extraPositions[airlineId]?.map((p) => p.name) ?? [];
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const name of [...inventoryPositions, ...builtin, ...extra]) {
    if (!seen.has(name)) {
      seen.add(name);
      merged.push(name);
    }
  }

  if (merged.length === 0 && isCustomAirline(airlineId)) {
    return [...CUSTOM_AIRLINE_STARTER_POSITIONS];
  }

  return merged;
}

export function isCustomPosition(
  airlineId: string,
  position: string,
  config: AppCustomConfig,
): boolean {
  return config.extraPositions[airlineId]?.some((p) => p.name === position) ?? false;
}

export function getCustomPositionsForAirline(
  airlineId: string,
  config: AppCustomConfig,
): string[] {
  return config.extraPositions[airlineId]?.map((p) => p.name) ?? [];
}
