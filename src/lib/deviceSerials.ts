import type { AppCustomConfig } from './configStore';
import { getSerialFromInventory, type InventoryDevice } from './inventory';

const WESTJET_SERIALS: Record<string, string> = {
  'OBS MAKEUP': 'R5CY31Q9GZV',
  'PUERTA 1': 'R5CY31GP3ZM',
  'PUERTA 2': 'R5CY51P3GPZ',
  'RAMPA 1': 'R5CY31Q8RFB',
  'RAMPA 2': 'R5CY321T9RE',
  'OBSERVER RAMPA': 'R5CY321T5QL',
};

const BUILTIN_SERIALS: Record<string, Record<string, string>> = {
  westjet: WESTJET_SERIALS,
};

export function getSerialForPosition(
  airlineId: string,
  position: string,
  config: AppCustomConfig,
  inventory: InventoryDevice[] = [],
  deviceId?: string,
): string | undefined {
  const fromInventory = getSerialFromInventory(inventory, airlineId, position, deviceId);
  if (fromInventory) return fromInventory;

  const custom = config.extraPositions[airlineId]?.find((p) => p.name === position)?.serial;
  if (custom) return custom;

  return BUILTIN_SERIALS[airlineId]?.[position];
}
