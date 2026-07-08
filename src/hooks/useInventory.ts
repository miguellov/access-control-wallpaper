import { useCallback, useState } from 'react';
import type { InventoryDevice } from '../lib/inventory';
import {
  addDevice,
  createDeviceFromInput,
  loadInventory,
  reassignDevice,
  removeDevice,
  resetInventory,
  saveInventory,
  updateDevice,
  type NewDeviceInput,
} from '../lib/inventoryStore';

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryDevice[]>(loadInventory);

  const persist = useCallback((next: InventoryDevice[]) => {
    setInventory(next);
    saveInventory(next);
  }, []);

  const reassign = useCallback(
    (deviceId: string, newAirlineId: string) => {
      persist(reassignDevice(inventory, deviceId, newAirlineId));
    },
    [inventory, persist],
  );

  const update = useCallback(
    (deviceId: string, updates: Partial<Pick<InventoryDevice, 'position' | 'serial' | 'model' | 'status' | 'airlineId'>>) => {
      persist(updateDevice(inventory, deviceId, updates));
    },
    [inventory, persist],
  );

  const add = useCallback(
    (input: NewDeviceInput) => {
      persist(addDevice(inventory, createDeviceFromInput(input)));
    },
    [inventory, persist],
  );

  const remove = useCallback(
    (deviceId: string) => {
      persist(removeDevice(inventory, deviceId));
    },
    [inventory, persist],
  );

  const reset = useCallback(() => {
    persist(resetInventory());
  }, [persist]);

  return { inventory, reassign, update, add, remove, reset };
}
