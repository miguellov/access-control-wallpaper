export type DeviceStatus = 'active' | 'inoperative';

export interface InventoryDevice {
  id: string;
  airlineId: string;
  position: string;
  serial: string;
  model: string;
  status: DeviceStatus;
}

export const DEFAULT_INVENTORY: InventoryDevice[] = [
  // WestJet
  { id: 'wj-1', airlineId: 'westjet', position: 'OBS MAKEUP', serial: 'R5CY31Q9GZV', model: 'Galaxy A16', status: 'active' },
  { id: 'wj-2', airlineId: 'westjet', position: 'PUERTA 1', serial: 'R5CY31GP3ZM', model: 'Galaxy A16', status: 'active' },
  { id: 'wj-3', airlineId: 'westjet', position: 'PUERTA 2', serial: 'R5CY51P3GPZ', model: 'Galaxy A16', status: 'active' },
  { id: 'wj-4', airlineId: 'westjet', position: 'RAMPA 1', serial: 'R5CY31Q8RFB', model: 'Galaxy A16', status: 'active' },
  { id: 'wj-5', airlineId: 'westjet', position: 'RAMPA 2', serial: 'R5CY321T9RE', model: 'Galaxy A16', status: 'active' },
  { id: 'wj-6', airlineId: 'westjet', position: 'OBSERVER RAMPA', serial: 'R5CY321T5QL', model: 'Galaxy A16', status: 'active' },

  // JetBlue
  { id: 'jb-1', airlineId: 'jetblue', position: 'OBS MAKE UP', serial: 'R5CX52WBBWJ', model: 'Galaxy A15', status: 'active' },
  { id: 'jb-2', airlineId: 'jetblue', position: 'PUERTA 1', serial: 'R9TT200393D', model: 'Galaxy A22', status: 'active' },
  { id: 'jb-3', airlineId: 'jetblue', position: 'PUERTA 2', serial: 'R9TT20038VK', model: 'Galaxy A22', status: 'active' },
  { id: 'jb-4', airlineId: 'jetblue', position: 'RAMPA 1', serial: '', model: 'Galaxy A22', status: 'inoperative' },
  { id: 'jb-5', airlineId: 'jetblue', position: 'OBS RAMPA', serial: 'RFCT702CM4X', model: 'Galaxy A22', status: 'active' },
  { id: 'jb-6', airlineId: 'jetblue', position: 'RAMPA 1', serial: 'R5CY321T5QL', model: 'Galaxy A16', status: 'active' },
  { id: 'jb-7', airlineId: 'jetblue', position: 'RAMPA 2', serial: 'R9TT2003EXL', model: 'Galaxy A22', status: 'active' },

  // Delta
  { id: 'dl-1', airlineId: 'delta', position: 'MAKEUP', serial: 'R5CX8327XFK', model: 'Galaxy A15', status: 'active' },
  { id: 'dl-2', airlineId: 'delta', position: 'PUERTA 2', serial: 'R5CX8326MMX', model: 'Galaxy A15', status: 'active' },
  { id: 'dl-3', airlineId: 'delta', position: 'PUERTA 1', serial: 'R5CX83275PZ', model: 'Galaxy A15', status: 'active' },
  { id: 'dl-4', airlineId: 'delta', position: 'OBS RAMPA', serial: 'R5CX83WEELF', model: 'Galaxy A15', status: 'active' },
  { id: 'dl-5', airlineId: 'delta', position: 'RAMPA 1', serial: 'R5CX83WEELF', model: 'Galaxy A15', status: 'active' },
  { id: 'dl-6', airlineId: 'delta', position: 'RAMPA 2', serial: 'R5CX8395SJP', model: 'Galaxy A15', status: 'active' },
];

export function createDeviceId(): string {
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getDevicesForAirline(
  inventory: InventoryDevice[],
  airlineId: string,
  activeOnly = false,
): InventoryDevice[] {
  return inventory.filter(
    (d) => d.airlineId === airlineId && (!activeOnly || d.status === 'active'),
  );
}

export function getInventoryPositions(
  inventory: InventoryDevice[],
  airlineId: string,
  activeOnly = false,
): string[] {
  const seen = new Set<string>();
  const positions: string[] = [];
  for (const device of getDevicesForAirline(inventory, airlineId, activeOnly)) {
    if (!seen.has(device.position)) {
      seen.add(device.position);
      positions.push(device.position);
    }
  }
  return positions;
}

export function findDeviceByPosition(
  inventory: InventoryDevice[],
  airlineId: string,
  position: string,
): InventoryDevice | undefined {
  return inventory.find((d) => d.airlineId === airlineId && d.position === position);
}

export function getSerialFromInventory(
  inventory: InventoryDevice[],
  airlineId: string,
  position: string,
  deviceId?: string,
): string | undefined {
  if (deviceId) {
    const device = inventory.find((d) => d.id === deviceId);
    if (device?.status === 'active' && device.serial) return device.serial;
    return undefined;
  }

  const device = findDeviceByPosition(inventory, airlineId, position);
  if (device?.status === 'active' && device.serial) return device.serial;
  return undefined;
}

export function groupInventoryByAirline(
  inventory: InventoryDevice[],
  airlineIds: string[],
): Record<string, InventoryDevice[]> {
  const groups: Record<string, InventoryDevice[]> = {};
  for (const id of airlineIds) {
    groups[id] = getDevicesForAirline(inventory, id);
  }
  return groups;
}
