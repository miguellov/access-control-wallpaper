export type WallpaperType = 'lock' | 'home';

export interface WallpaperTypeOption {
  id: WallpaperType;
  label: string;
  description: string;
}

export const WALLPAPER_TYPES: WallpaperTypeOption[] = [
  {
    id: 'lock',
    label: 'Pantalla de bloqueo',
    description: 'Con posición y datos de acceso',
  },
  {
    id: 'home',
    label: 'Fondo de inicio',
    description: 'Posición grande en vertical',
  },
];
