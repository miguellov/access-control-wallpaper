import {
  createDeviceId,
  DEFAULT_INVENTORY,
  normalizeDeviceStatus,
  type DeviceStatus,
  type InventoryDevice,
} from './inventory';
import { normalizePositionName, normalizeImei } from './configStore';

const STORAGE_KEY = 'ac-wallpaper-inventory-v3';

function migrateInventory(devices: InventoryDevice[]): InventoryDevice[] {
  return devices.map((d) => ({
    ...d,
    status: normalizeDeviceStatus(d.status as string),
  }));
}

export function loadInventory(): InventoryDevice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_INVENTORY];
    const parsed = JSON.parse(raw) as InventoryDevice[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_INVENTORY];
    return migrateInventory(parsed);
  } catch {
    return [...DEFAULT_INVENTORY];
  }
}

export function saveInventory(inventory: InventoryDevice[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

export function resetInventory(): InventoryDevice[] {
  const fresh = [...DEFAULT_INVENTORY];
  saveInventory(fresh);
  return fresh;
}

export function reassignDevice(
  inventory: InventoryDevice[],
  deviceId: string,
  newAirlineId: string,
): InventoryDevice[] {
  return inventory.map((d) => (d.id === deviceId ? { ...d, airlineId: newAirlineId } : d));
}

export function updateDevice(
  inventory: InventoryDevice[],
  deviceId: string,
  updates: Partial<Pick<InventoryDevice, 'position' | 'imei' | 'model' | 'status' | 'airlineId'>>,
): InventoryDevice[] {
  return inventory.map((d) => {
    if (d.id !== deviceId) return d;
    return {
      ...d,
      ...updates,
      position: updates.position ? normalizePositionName(updates.position) : d.position,
      imei: updates.imei !== undefined ? normalizeImei(updates.imei) : d.imei,
      status: updates.status !== undefined ? normalizeDeviceStatus(updates.status) : d.status,
    };
  });
}

export function addDevice(
  inventory: InventoryDevice[],
  device: Omit<InventoryDevice, 'id'> & { id?: string },
): InventoryDevice[] {
  const entry: InventoryDevice = {
    id: device.id ?? createDeviceId(),
    airlineId: device.airlineId,
    position: normalizePositionName(device.position),
    imei: device.imei ? normalizeImei(device.imei) : '',
    model: device.model.trim() || 'Galaxy A16',
    status: normalizeDeviceStatus(device.status),
  };
  return [...inventory, entry];
}

export function removeDevice(inventory: InventoryDevice[], deviceId: string): InventoryDevice[] {
  return inventory.filter((d) => d.id !== deviceId);
}

export interface NewDeviceInput {
  airlineId: string;
  position: string;
  imei?: string;
  model: string;
  status: DeviceStatus;
}

export function createDeviceFromInput(input: NewDeviceInput): Omit<InventoryDevice, 'id'> {
  return {
    airlineId: input.airlineId,
    position: normalizePositionName(input.position),
    imei: input.imei ? normalizeImei(input.imei) : '',
    model: input.model.trim() || 'Galaxy A16',
    status: normalizeDeviceStatus(input.status),
  };
}
