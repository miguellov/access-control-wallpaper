export interface Device {
  id: string;
  label: string;
  width: number;
  height: number;
}

/** Resoluciones portrait para Samsung Galaxy serie A */
export const DEVICES: Device[] = [
  { id: 'galaxy-a16', label: 'Galaxy A16 / A15 / A25', width: 1080, height: 2340 },
  { id: 'galaxy-a14', label: 'Galaxy A14 / A13', width: 1080, height: 2408 },
  { id: 'galaxy-a35', label: 'Galaxy A35 / A54', width: 1080, height: 2340 },
  { id: 'galaxy-a06', label: 'Galaxy A06 / A05', width: 720, height: 1600 },
];

export const DEFAULT_DEVICE_ID = 'galaxy-a16';
