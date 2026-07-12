import {
  DEFAULT_POSITION_TEMPLATE_ID,
  getTemplatePositions,
  type PositionTemplateId,
} from './positionTemplates';

const STORAGE_KEY = 'ac-wallpaper-custom-config';

export interface CustomPosition {
  name: string;
  imei?: string;
}

export interface CustomAirline {
  id: string;
  name: string;
  accent: string;
  bgDataUrl: string;
  logoDataUrl: string;
}

export interface AppCustomConfig {
  customAirlines: CustomAirline[];
  extraPositions: Record<string, CustomPosition[]>;
}

export const EMPTY_CONFIG: AppCustomConfig = {
  customAirlines: [],
  extraPositions: {},
};

export function loadCustomConfig(): AppCustomConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_CONFIG };
    const parsed = JSON.parse(raw) as AppCustomConfig;
    return {
      customAirlines: parsed.customAirlines ?? [],
      extraPositions: parsed.extraPositions ?? {},
    };
  } catch {
    return { ...EMPTY_CONFIG };
  }
}

export function saveCustomConfig(config: AppCustomConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function createAirlineId(name: string): string {
  return `custom-${slugify(name) || 'airline'}-${Date.now()}`;
}

export function normalizePositionName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function normalizeImei(imei: string): string {
  return imei.trim().replace(/\s+/g, '');
}

export function addCustomAirline(
  config: AppCustomConfig,
  airline: Omit<CustomAirline, 'id'> & {
    id?: string;
    templateId?: PositionTemplateId;
  },
): AppCustomConfig {
  const entry: CustomAirline = {
    id: airline.id ?? createAirlineId(airline.name),
    name: airline.name.trim(),
    accent: airline.accent,
    bgDataUrl: airline.bgDataUrl,
    logoDataUrl: airline.logoDataUrl,
  };
  const templateId = airline.templateId ?? DEFAULT_POSITION_TEMPLATE_ID;
  const starterPositions = getTemplatePositions(templateId).map((name) => ({ name }));

  return {
    ...config,
    customAirlines: [...config.customAirlines, entry],
    extraPositions: {
      ...config.extraPositions,
      [entry.id]: config.extraPositions[entry.id] ?? starterPositions,
    },
  };
}

export function removeCustomAirline(config: AppCustomConfig, airlineId: string): AppCustomConfig {
  const { [airlineId]: _, ...extraPositions } = config.extraPositions;
  return {
    customAirlines: config.customAirlines.filter((a) => a.id !== airlineId),
    extraPositions,
  };
}

export function addCustomPosition(
  config: AppCustomConfig,
  airlineId: string,
  position: CustomPosition,
): AppCustomConfig {
  const name = normalizePositionName(position.name);
  if (!name) return config;

  const imei = position.imei ? normalizeImei(position.imei) : undefined;
  const current = config.extraPositions[airlineId] ?? [];
  if (current.some((p) => p.name === name)) return config;

  return {
    ...config,
    extraPositions: {
      ...config.extraPositions,
      [airlineId]: [...current, { name, imei }],
    },
  };
}

export function removeCustomPosition(
  config: AppCustomConfig,
  airlineId: string,
  positionName: string,
): AppCustomConfig {
  const current = config.extraPositions[airlineId] ?? [];
  return {
    ...config,
    extraPositions: {
      ...config.extraPositions,
      [airlineId]: current.filter((p) => p.name !== positionName),
    },
  };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
