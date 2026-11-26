/**
 * Contenido de la sección "Explora nuestros espacios" de la home (ONE-26).
 * Editar aquí título, descripción, imagen y alt de cada tipo. Nombre y enlace salen de `catalog.ts`;
 * la capacidad máxima se calcula desde la content collection `spaces`.
 * DATOS DE PRUEBA: reemplazar imágenes y textos con los reales del cliente.
 */
import type { ImageMetadata } from 'astro';
import jardin from '@/assets/spaces/magdalena/jardin-1.jpg';
import parrilla from '@/assets/spaces/magdalena/parrilla-1.jpg';
import sum from '@/assets/spaces/magdalena/sum-1.jpg';
import type { SpaceType } from '@/data/catalog';

export const SPACE_TYPES_SECTION = {
  title: 'Descubre nuestra selección de espacios',
  description:
    'Elige el local que mejor se ajusta a tu evento: desde reuniones íntimas en la parrilla hasta celebraciones grandes en el SUM. Cada espacio indica su capacidad máxima.',
} as const;

export const SPACE_TYPE_CARDS: readonly {
  type: SpaceType;
  image: ImageMetadata;
  imageAlt: string;
}[] = [
  { type: 'parrilla', image: parrilla, imageAlt: 'Parrilla con mesas listas para un evento' },
  { type: 'parrilla-jardin', image: jardin, imageAlt: 'Parrilla con jardín al aire libre' },
  { type: 'sum', image: sum, imageAlt: 'Salón de usos múltiples (SUM) equipado' },
];
