/**
 * Contenido de la sección CTA de la home (ONE-28).
 * Frase, botón, imagen y mensaje de WhatsApp editables aquí.
 * DATOS DE PRUEBA: reemplazar imagen por una real del cliente.
 */
import type { ImageMetadata } from 'astro';
import ctaImage from '@/assets/spaces/magdalena/sum-1.jpg';
import { whatsappHref } from '@/lib/whatsapp';

export interface CtaContent {
  title: string;
  buttonLabel: string;
  href: string;
  image: ImageMetadata;
  imageAlt: string;
}

export const CTA: CtaContent = {
  title: 'Tu próximo evento merece el espacio perfecto. Reserva hoy y cotiza en un clic.',
  buttonLabel: 'Solicitar cotización',
  href: whatsappHref('Hola, quiero cotizar el alquiler de un espacio en Altivia.'),
  image: ctaImage,
  imageAlt: 'Salón de usos múltiples de Altivia listo para un evento',
};
