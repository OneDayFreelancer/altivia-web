/** Constantes globales del sitio. Sin dependencias de Astro ni de componentes. */
export const SITE = {
  name: 'Altivia',
  description: 'Altivia: alquiler de propiedades y espacios.',
  locale: 'es',
  whatsappNumber: import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '',
} as const;

export const NAV_ITEMS = [
  { label: 'Inicio', href: '/' },
  { label: 'Nosotros', href: '/#nosotros' },
  { label: 'Propiedades', href: '/#propiedades' },
  { label: 'Contacto', href: '/#contacto' },
] as const;
