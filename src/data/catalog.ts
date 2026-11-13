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

export const COMPLEMENT_CATEGORIES = [
  { value: 'mobiliario', label: 'Mobiliario' },
  { value: 'audiovisual', label: 'Audiovisual' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'servicio', label: 'Servicio' },
  { value: 'otros', label: 'Otros' },
] as const;

export const PRICE_UNITS = ['hora', 'dia'] as const;

type Values<T extends readonly { value: string }[]> = T[number]['value'];
export type SpaceType = Values<typeof SPACE_TYPES>;
export type LocationSlug = Values<typeof LOCATIONS>;
export type ComplementCategory = Values<typeof COMPLEMENT_CATEGORIES>;
export type PriceUnit = (typeof PRICE_UNITS)[number];

/** Tupla no vacía de valores, requerida por `z.enum`. */
export const valuesOf = <T extends readonly { value: string }[]>(items: T) =>
  items.map((i) => i.value) as [Values<T>, ...Values<T>[]];
