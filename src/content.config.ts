import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { COMPLEMENTS, LOCATIONS, PRICE_UNITS, SPACE_TYPES, valuesOf } from '@/data/catalog';

/**
 * Un archivo por espacio en `src/content/spaces/`. El nombre del archivo es el slug
 * (`parrilla-magdalena.md` → `/espacios/parrilla-magdalena`); la descripción es el cuerpo markdown.
 */
const spaces = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/spaces' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      type: z.enum(valuesOf(SPACE_TYPES)),
      location: z.enum(valuesOf(LOCATIONS)),
      /** Capacidad máxima de personas. */
      maxCapacity: z.number().int().positive(),
      /** Precio base en soles. */
      priceFrom: z.number().positive(),
      priceUnit: z.enum(PRICE_UNITS),
      /** Posición en el bento de la home. Sin valor = no aparece en "más solicitados". */
      featuredOrder: z.number().int().positive().optional(),
      /** La primera imagen es la portada. */
      images: z.array(z.object({ src: image(), alt: z.string() })).min(1),
      /** Características del espacio. */
      amenities: z.array(z.string()).default([]),
      /** Complementos disponibles para este espacio. */
      complements: z.array(z.enum(valuesOf(COMPLEMENTS))).default([]),
    }),
});

export const collections = { spaces };
