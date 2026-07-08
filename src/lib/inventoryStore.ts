import {
  createDeviceId,
  DEFAULT_INVENTORY,
  type DeviceStatus,
  type InventoryDevice,
} from './inventory';
import { normalizePositionName, normalizeSerial } from './configStore';

const STORAGE_KEY = 'ac-wallpaper-inventory';

export function loadInventory(): InventoryDevice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_INVENTORY];
    const parsed = JSON.parse(raw) as InventoryDevice[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_INVENTORY];
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
  updates: Partial<Pick<InventoryDevice, 'position' | 'serial' | 'model' | 'status' | 'airlineId'>>,
): InventoryDevice[] {
  return inventory.map((d) => {
    if (d.id !== deviceId) return d;
    return {
      ...d,
      ...updates,
      position: updates.position ? normalizePositionName(updates.position) : d.position,
      serial: updates.serial !== undefined ? normalizeSerial(updates.serial) : d.serial,
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
    serial: device.serial ? normalizeSerial(device.serial) : '',
    model: device.model.trim() || 'Galaxy A16',
    status: device.status,
  };
  return [...inventory, entry];
}

export function removeDevice(inventory: InventoryDevice[], deviceId: string): InventoryDevice[] {
  return inventory.filter((d) => d.id !== deviceId);
}

export interface NewDeviceInput {
  airlineId: string;
  position: string;
  serial?: string;
  model: string;
  status: DeviceStatus;
}

export function createDeviceFromInput(input: NewDeviceInput): Omit<InventoryDevice, 'id'> {
  return {
    airlineId: input.airlineId,
    position: normalizePositionName(input.position),
    serial: input.serial ? normalizeSerial(input.serial) : '',
    model: input.model.trim() || 'Galaxy A16',
    status: input.status,
  };
}
