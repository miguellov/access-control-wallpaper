import type { AppCustomConfig } from './configStore';
import { getImeiFromInventory, type InventoryDevice } from './inventory';

const WESTJET_IMEIS: Record<string, string> = {
  'OBS MAKEUP': '359630140337008',
  'PUERTA 1': '359630140282543',
  'PUERTA 2': '359630140545444',
  'RAMPA 1': '359630140328916',
  'RAMPA 2': '359630140393605',
  'OBS RAMPA': '359630140392276',
  'CIERRE COUNTER': '359630140589574',
  GATE: '359630140580656',
  '5X5 B6': '359630140595225',
  'OBS MAKEUP (2)': '359630140588386',
  'PUERTA 2 (2)': '359630140583353',
  'ADUANA B6': '359630140580110',
};

const BUILTIN_IMEIS: Record<string, Record<string, string>> = {
  westjet: WESTJET_IMEIS,
};

export function getImeiForPosition(
  airlineId: string,
  position: string,
  config: AppCustomConfig,
  inventory: InventoryDevice[] = [],
  deviceId?: string,
): string | undefined {
  const fromInventory = getImeiFromInventory(inventory, airlineId, position, deviceId);
  if (fromInventory) return fromInventory;

  const custom = config.extraPositions[airlineId]?.find((p) => p.name === position)?.imei;
  if (custom) return custom;

  return BUILTIN_IMEIS[airlineId]?.[position];
}
