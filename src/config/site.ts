/** Constantes globales del sitio. Sin dependencias de Astro ni de componentes. */
export const SITE = {
  name: 'Altivia',
  description: 'Altivia: alquiler de propiedades y espacios.',
  locale: 'es',
  /** Con código de país, sin `+`. `PUBLIC_WHATSAPP_NUMBER` lo sobrescribe. */
  whatsappNumber: import.meta.env.PUBLIC_WHATSAPP_NUMBER || '51954206384',
} as const;

export const NAV_ITEMS = [
  { label: 'Alquilar', href: '/alquilar' },
  { label: 'Publicar propiedad', href: '/publicar' },
] as const;

/** Destinos de cuenta. Placeholder hasta implementar auth. */
export const AUTH_LINKS = {
  login: { label: 'Log in', href: '#' },
  signUp: { label: 'Sign Up', href: '#' },
} as const;

/** Idiomas del sitio. `available: false` = preparado, aún sin páginas traducidas. */
export const LOCALES = [
  { code: 'es', label: 'ES', available: true },
  { code: 'en', label: 'EN', available: false },
] as const;
