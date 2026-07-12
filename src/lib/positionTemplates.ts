export type PositionTemplateId = 'standard' | 'westjet' | 'jetblue' | 'delta' | 'full';

export interface PositionTemplate {
  id: PositionTemplateId;
  label: string;
  description: string;
  positions: readonly string[];
}

export const POSITION_TEMPLATES: PositionTemplate[] = [
  {
    id: 'standard',
    label: 'Estándar',
    description: 'Puertas, rampas y obs rampa',
    positions: ['PUERTA 1', 'PUERTA 2', 'RAMPA 1', 'RAMPA 2', 'OBS RAMPA'],
  },
  {
    id: 'westjet',
    label: 'Tipo WestJet',
    description: 'Incluye makeup, gate y aduana',
    positions: [
      'OBS MAKEUP',
      'PUERTA 1',
      'PUERTA 2',
      'RAMPA 1',
      'RAMPA 2',
      'OBS RAMPA',
      'CIERRE COUNTER',
      'GATE',
      '5X5 B6',
      'ADUANA B6',
    ],
  },
  {
    id: 'jetblue',
    label: 'Tipo JetBlue',
    description: 'Makeup, puertas, rampas y 5x5',
    positions: [
      'OBS MAKE UP',
      'PUERTA 1',
      'PUERTA 2',
      'RAMPA 1',
      'RAMPA 2',
      'OBS RAMPA',
      'ADUANA',
      'CONTROL 5X5',
    ],
  },
  {
    id: 'delta',
    label: 'Tipo Delta',
    description: 'Makeup, puertas y rampas',
    positions: ['MAKEUP', 'PUERTA 1', 'PUERTA 2', 'RAMPA 1', 'RAMPA 2', 'OBS RAMPA'],
  },
  {
    id: 'full',
    label: 'Completo',
    description: 'Todas las posiciones comunes',
    positions: [
      'OBS MAKEUP',
      'MAKEUP',
      'PUERTA 1',
      'PUERTA 2',
      'RAMPA 1',
      'RAMPA 2',
      'OBS RAMPA',
      'CIERRE COUNTER',
      'GATE',
      'ADUANA',
      'CONTROL 5X5',
      '5X5 B6',
    ],
  },
];

export const DEFAULT_POSITION_TEMPLATE_ID: PositionTemplateId = 'standard';

export function getPositionTemplate(id: PositionTemplateId): PositionTemplate {
  return POSITION_TEMPLATES.find((t) => t.id === id) ?? POSITION_TEMPLATES[0];
}

export function getTemplatePositions(id: PositionTemplateId): string[] {
  return [...getPositionTemplate(id).positions];
}
