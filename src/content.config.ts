import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  COMPLEMENT_CATEGORIES,
  LOCATIONS,
  PRICE_UNITS,
  SPACE_TYPES,
  valuesOf,
} from '@/data/catalog';
import { parseSlot } from '@/lib/quote';

/**
 * Un archivo por espacio en `src/content/spaces/`. El nombre del archivo es el slug
 * (`parrilla-magdalena.md` → `/espacios/parrilla-magdalena`); la descripción es el cuerpo markdown.
 */
const slotList = z
  .array(
    z.string().refine((v) => parseSlot(v) !== null, {
      message: 'Turno inválido: usar "HH:MM-HH:MM" con inicio < fin (el fin puede ser 24:00)',
    }),
  )
  .min(1);

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
      /**
       * Turnos de alquiler (el cliente solo elige uno). `default` aplica a todos los días;
       * un día (`lunes`…`domingo`) lo reemplaza. Formato `"HH:MM-HH:MM"`, fin máx. `24:00`.
       */
      schedule: z.object({
        default: slotList,
        lunes: slotList.optional(),
        martes: slotList.optional(),
        miercoles: slotList.optional(),
        jueves: slotList.optional(),
        viernes: slotList.optional(),
        sabado: slotList.optional(),
        domingo: slotList.optional(),
      }),
      /** Características del espacio. */
      amenities: z.array(z.string()).default([]),
      /** Complementos que ofrece este espacio (slug = nombre de archivo en `complements/`). */
      complements: z.array(reference('complements')).default([]),
    }),
});

/**
 * Un archivo por complemento en `src/content/complements/` (slug = nombre de archivo).
 * `pricing` define cómo se cobra:
 * - `unidad`: precio × cantidad, durante todo el alquiler (mobiliario).
 * - `evento`: cargo fijo por todo el alquiler; por unidad si `maxQuantity` > 1 (equipos).
 * - `hora`: precio × horas × cantidad, dentro del horario del alquiler (servicios).
 * Precio y stock son globales (iguales en todos los espacios).
 */
const complements = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/complements' }),
  schema: ({ image }) => {
    const base = z.object({
      name: z.string(),
      category: z.enum(valuesOf(COMPLEMENT_CATEGORIES)),
      image: z.object({ src: image(), alt: z.string() }),
      /** Precio en soles. */
      price: z.number().positive(),
      /** Stock máximo que se puede pedir. */
      maxQuantity: z.number().int().positive(),
      /** Personas que cubre cada unidad, si aplica. */
      capacity: z.number().int().positive().optional(),
    });
    return z.discriminatedUnion('pricing', [
      base.extend({ pricing: z.literal('unidad') }).strict(),
      base.extend({ pricing: z.literal('evento') }).strict(),
      base
        .extend({
          pricing: z.literal('hora'),
          /** Máximo de horas que se puede contratar. */
          maxHours: z.number().int().positive(),
        })
        .strict(),
    ]);
  },
});

export const collections = { spaces, complements };
