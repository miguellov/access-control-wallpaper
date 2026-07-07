/** URL pública de la app en GitHub Pages */
export const APP_PUBLIC_URL = 'https://miguellov.github.io/access-control-wallpaper';

export function getAppUrl(): string {
  if (typeof window === 'undefined') return APP_PUBLIC_URL;

  if (window.location.hostname === 'miguellov.github.io') {
    return APP_PUBLIC_URL;
  }

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${window.location.origin}${base}`;
}
