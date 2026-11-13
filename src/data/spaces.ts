/**
 * Acceso a la content collection `spaces` (`src/content/spaces/*.md`).
 * DATOS DE PRUEBA: reemplazar textos, fotos, capacidades y precios con los reales del cliente.
 */
import { type CollectionEntry, getCollection, getEntries } from 'astro:content';

export { LOCATIONS, SPACE_TYPES } from '@/data/catalog';

export type Space = CollectionEntry<'spaces'>;
export type Complement = CollectionEntry<'complements'>;

/** Todos los espacios, ordenados por slug (`id` de la entrada). */
export const getSpaces = async (): Promise<Space[]> =>
  (await getCollection('spaces')).sort((a, b) => a.id.localeCompare(b.id));

/** Espacios "más solicitados" de la home. `featuredOrder` define el bento (grande, vertical, 2 pequeñas). */
export const getFeaturedSpaces = async (): Promise<Space[]> =>
  (await getCollection('spaces', ({ data }) => data.featuredOrder !== undefined)).sort(
    (a, b) => (a.data.featuredOrder ?? 0) - (b.data.featuredOrder ?? 0),
  );

/** Ruta del detalle del espacio (ONE-21). El slug es el `id` de la entrada. */
export const spaceHref = (space: Space): string => `/espacios/${space.id}`;

/** Complementos que ofrece un espacio, resueltos desde sus referencias. */
export const getSpaceComplements = async (space: Space): Promise<Complement[]> =>
  getEntries(space.data.complements);
