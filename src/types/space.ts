import type { ImageMetadata } from 'astro';

export type SpaceType = 'parrilla' | 'parrilla-jardin' | 'sum';

export interface Space {
  /** Slug único para la URL, ej. "parrilla-magdalena". */
  slug: string;
  type: SpaceType;
  /** Nombre visible, ej. "Parrilla Magdalena". */
  name: string;
  /** Slug del local (ver LOCATIONS). */
  location: string;
  /** Capacidad máxima de personas. */
  maxCapacity: number;
  /** Precio base en soles. */
  priceFrom: number;
  priceUnit: 'hora' | 'dia';
  /** Marca los espacios "más solicitados" de la home. */
  featured: boolean;
  image: ImageMetadata;
  imageAlt: string;
}
