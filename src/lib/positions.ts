export const POSITIONS = [
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

export type Position = (typeof POSITIONS)[number];
