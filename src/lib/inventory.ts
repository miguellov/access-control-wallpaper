export type DeviceStatus = 'available' | 'repair' | 'inoperative';

export interface DeviceStatusOption {
  id: DeviceStatus;
  label: string;
}

export const DEVICE_STATUS_OPTIONS: DeviceStatusOption[] = [
  { id: 'available', label: 'Disponible' },
  { id: 'repair', label: 'En reparación' },
  { id: 'inoperative', label: 'Inoperativo' },
];

export function getDeviceStatusLabel(status: DeviceStatus): string {
  return DEVICE_STATUS_OPTIONS.find((o) => o.id === status)?.label ?? status;
}

export function isDeviceAvailable(status: DeviceStatus): boolean {
  return status === 'available';
}

/** Migrates legacy inventory statuses (`active` → `available`). */
export function normalizeDeviceStatus(status: string | undefined): DeviceStatus {
  if (status === 'repair' || status === 'inoperative' || status === 'available') return status;
  if (status === 'active') return 'available';
  return 'available';
}

export interface InventoryDevice {
  id: string;
  airlineId: string;
  position: string;
  imei: string;
  model: string;
  status: DeviceStatus;
}

export const DEFAULT_INVENTORY: InventoryDevice[] = [
  // WestJet
  { id: 'wj-1', airlineId: 'westjet', position: 'OBS MAKEUP', imei: '359630140337008', model: 'Galaxy A16', status: 'available' },
  { id: 'wj-2', airlineId: 'westjet', position: 'PUERTA 1', imei: '359630140282543', model: 'Galaxy A16', status: 'available' },
  { id: 'wj-3', airlineId: 'westjet', position: 'PUERTA 2', imei: '359630140545444', model: 'Galaxy A16', status: 'available' },
  { id: 'wj-4', airlineId: 'westjet', position: 'RAMPA 1', imei: '359630140328916', model: 'Galaxy A16', status: 'available' },
  { id: 'wj-5', airlineId: 'westjet', position: 'RAMPA 2', imei: '359630140393605', model: 'Galaxy A16', status: 'available' },
  { id: 'wj-6', airlineId: 'westjet', position: 'OBS RAMPA', imei: '359630140392276', model: 'Galaxy A16', status: 'available' },
  { id: 'wj-7', airlineId: 'westjet', position: 'CIERRE COUNTER', imei: '359630140589574', model: 'Galaxy A16', status: 'available' },
  { id: 'wj-8', airlineId: 'westjet', position: 'GATE', imei: '359630140580656', model: 'Galaxy A16', status: 'available' },
  { id: 'wj-9', airlineId: 'westjet', position: '5X5 B6', imei: '359630140595225', model: 'Galaxy A16', status: 'available' },
  { id: 'wj-10', airlineId: 'westjet', position: 'OBS MAKEUP (2)', imei: '359630140588386', model: 'Galaxy A16', status: 'available' },
  { id: 'wj-11', airlineId: 'westjet', position: 'PUERTA 2 (2)', imei: '359630140583353', model: 'Galaxy A16', status: 'available' },
  { id: 'wj-12', airlineId: 'westjet', position: 'ADUANA B6', imei: '359630140580110', model: 'Galaxy A16', status: 'available' },

  // JetBlue
  { id: 'jb-1', airlineId: 'jetblue', position: 'OBS MAKE UP', imei: '359535931361358', model: 'Galaxy A15', status: 'available' },
  { id: 'jb-2', airlineId: 'jetblue', position: 'PUERTA 1', imei: '358055380819146', model: 'Galaxy A22', status: 'available' },
  { id: 'jb-3', airlineId: 'jetblue', position: 'PUERTA 2', imei: '', model: 'Galaxy A22', status: 'available' },
  { id: 'jb-4', airlineId: 'jetblue', position: 'RAMPA 1', imei: '', model: 'Galaxy A22', status: 'inoperative' },
  { id: 'jb-5', airlineId: 'jetblue', position: 'OBS RAMPA', imei: '358055380822082', model: 'Galaxy A22', status: 'available' },
  { id: 'jb-6', airlineId: 'jetblue', position: 'RAMPA 1', imei: '', model: 'Galaxy A16', status: 'available' },
  { id: 'jb-7', airlineId: 'jetblue', position: 'RAMPA 2', imei: '', model: 'Galaxy A22', status: 'available' },

  // Delta
  { id: 'dl-1', airlineId: 'delta', position: 'MAKEUP', imei: '', model: 'Galaxy A15', status: 'available' },
  { id: 'dl-2', airlineId: 'delta', position: 'PUERTA 2', imei: '359535931744439', model: 'Galaxy A15', status: 'available' },
  { id: 'dl-3', airlineId: 'delta', position: 'PUERTA 1', imei: '359535931755179', model: 'Galaxy A15', status: 'available' },
  { id: 'dl-4', airlineId: 'delta', position: 'OBS RAMPA', imei: '', model: 'Galaxy A15', status: 'available' },
  { id: 'dl-5', airlineId: 'delta', position: 'RAMPA 1', imei: '359535931749982', model: 'Galaxy A15', status: 'available' },
  { id: 'dl-6', airlineId: 'delta', position: 'RAMPA 2', imei: '359535931759270', model: 'Galaxy A15', status: 'available' },
];

export function createDeviceId(): string {
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getDevicesForAirline(
  inventory: InventoryDevice[],
  airlineId: string,
  availableOnly = false,
): InventoryDevice[] {
  return inventory.filter(
    (d) => d.airlineId === airlineId && (!availableOnly || isDeviceAvailable(d.status)),
  );
}

export function getInventoryPositions(
  inventory: InventoryDevice[],
  airlineId: string,
  availableOnly = false,
): string[] {
  const seen = new Set<string>();
  const positions: string[] = [];
  for (const device of getDevicesForAirline(inventory, airlineId, availableOnly)) {
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

export function getImeiFromInventory(
  inventory: InventoryDevice[],
  airlineId: string,
  position: string,
  deviceId?: string,
): string | undefined {
  if (deviceId) {
    const device = inventory.find((d) => d.id === deviceId);
    if (device && isDeviceAvailable(device.status) && device.imei) return device.imei;
    return undefined;
  }

  const device = findDeviceByPosition(inventory, airlineId, position);
  if (device && isDeviceAvailable(device.status) && device.imei) return device.imei;
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
