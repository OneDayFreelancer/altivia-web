/** Constantes globales del sitio. Sin dependencias de Astro ni de componentes. */
export const SITE = {
  name: 'Altivia',
  /** `<title>` de la home. */
  title: 'Altivia | Alquiler de parrillas y SUM en Magdalena y San Borja',
  description:
    'Alquila parrillas, parrillas con jardín y salones (SUM) en Magdalena y San Borja, Lima. Arma tu reserva con complementos para tu evento.',
  locale: 'es',
  /** Con código de país, sin `+`. `PUBLIC_WHATSAPP_NUMBER` lo sobrescribe. */
  whatsappNumber: import.meta.env.PUBLIC_WHATSAPP_NUMBER || '51954206384',
} as const;

export const NAV_ITEMS = [
  { label: 'Alquilar', href: '/' },
  { label: 'Publicar propiedad', href: '/publicar' },
] as const;

/** Destinos de cuenta. */
export const AUTH_LINKS = {
  login: { label: 'Log in', href: '/login' },
  signUp: { label: 'Sign Up', href: '/registro' },
} as const;
