/** Catálogos compartidos por la content collection `spaces` y el buscador. Sin imports de Astro. */

export const SPACE_TYPES = [
  { value: 'parrilla', label: 'Parrilla' },
  { value: 'parrilla-jardin', label: 'Parrilla Jardín' },
  { value: 'sum', label: 'SUM' },
] as const;

export const LOCATIONS = [
  { value: 'magdalena', label: 'Magdalena' },
  { value: 'miraflores', label: 'Miraflores' },
  { value: 'san-borja', label: 'San Borja' },
] as const;

/** Complementos que se pueden sumar al alquiler (ONE-22/23). */
export const COMPLEMENTS = [
  { value: 'parlante', label: 'Parlante' },
  { value: 'sillas', label: 'Sillas' },
  { value: 'mesa', label: 'Mesa' },
  { value: 'proyector', label: 'Proyector' },
] as const;

export const PRICE_UNITS = ['hora', 'dia'] as const;

type Values<T extends readonly { value: string }[]> = T[number]['value'];
export type SpaceType = Values<typeof SPACE_TYPES>;
export type LocationSlug = Values<typeof LOCATIONS>;
export type ComplementSlug = Values<typeof COMPLEMENTS>;
export type PriceUnit = (typeof PRICE_UNITS)[number];

/** Tupla no vacía de valores, requerida por `z.enum`. */
export const valuesOf = <T extends readonly { value: string }[]>(items: T) =>
  items.map((i) => i.value) as [Values<T>, ...Values<T>[]];
