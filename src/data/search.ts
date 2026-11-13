/**
 * Opciones del buscador (ONE-10). Editar aquí tipos, rangos de precio y locales.
 * Rangos de precio de PRUEBA (S/ por hora), reemplazar con los reales del cliente.
 * Los tipos y locales vienen de `catalog.ts`.
 */
export { LOCATIONS, SPACE_TYPES } from '@/data/catalog';

/** `value`: "min-max" o "min+" (sin tope). Se envía tal cual en `?price=`. */
export const PRICE_RANGES: readonly { value: string; label: string }[] = [
  { value: '0-150', label: 'Hasta S/ 150' },
  { value: '150-250', label: 'S/ 150 – S/ 250' },
  { value: '250+', label: 'Más de S/ 250' },
];

/** Destino del buscador. El listado filtrado se implementa en otra historia. */
export const SEARCH_ACTION = '/alquilar';
