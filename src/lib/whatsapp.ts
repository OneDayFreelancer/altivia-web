import { SITE } from '@/config/site';

/** Enlace de WhatsApp con el mensaje prellenado. */
export const whatsappHref = (message: string): string =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
