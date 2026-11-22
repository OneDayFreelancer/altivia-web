/** Filtros del listado de espacios (ONE-25). Funciones puras, sin dependencias de Astro. */

export interface SpaceFilters {
  type: string;
  location: string;
  /** "min-max" o "min+"; vacío = cualquiera. */
  price: string;
  /** Capacidad mínima; null = sin filtro. */
  capacity: number | null;
}

export interface FilterableSpace {
  type: string;
  location: string;
  price: number;
  capacity: number;
}

const money = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  maximumFractionDigits: 0,
});

/** Precio en soles según locale y moneda (ej. `S/ 180`). */
export const formatPrice = (value: number): string => money.format(value);

/** Entero >= 1 o null (vacío o inválido = sin filtro). */
export const parseCapacity = (raw: string | null): number | null => {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : null;
};

export const parseFilters = (params: URLSearchParams): SpaceFilters => ({
  type: params.get('type') ?? '',
  location: params.get('location') ?? '',
  price: params.get('price') ?? '',
  capacity: parseCapacity(params.get('capacity')),
});

const inPriceRange = (price: number, range: string): boolean => {
  if (!range) return true;
  const open = range.match(/^(\d+)\+$/);
  if (open) return price >= Number(open[1]);
  const closed = range.match(/^(\d+)-(\d+)$/);
  if (closed) return price >= Number(closed[1]) && price <= Number(closed[2]);
  return true; // rango desconocido: no filtra
};

export const matchesFilters = (space: FilterableSpace, f: SpaceFilters): boolean =>
  (!f.type || space.type === f.type) &&
  (!f.location || space.location === f.location) &&
  inPriceRange(space.price, f.price) &&
  (f.capacity === null || space.capacity >= f.capacity);
