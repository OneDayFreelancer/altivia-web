/** Cálculo de la cotización de un espacio. Funciones puras, sin Astro ni DOM (ONE-23). */

import type { PriceUnit } from '@/data/catalog';

export type Pricing = 'unidad' | 'evento' | 'hora';

export interface QuoteComplement {
  slug: string;
  name: string;
  pricing: Pricing;
  price: number;
  maxQuantity: number;
  /** Solo con `pricing: 'hora'`. */
  maxHours?: number;
}

export interface QuoteInput {
  /** Precio base del espacio, según `priceUnit`. */
  price: number;
  /** `turno`: precio fijo por el turno completo. `hora`: se multiplica por las horas. */
  priceUnit: PriceUnit;
  maxCapacity: number;
  /** `YYYY-MM-DD`. Vacío = sin elegir. */
  date: string;
  /** `HH:MM`. Vacío = sin elegir. */
  startTime: string;
  hours: number;
  guests: number;
  complements: QuoteComplement[];
  /** Complementos marcados, por slug. */
  selection: Record<string, { quantity: number; hours: number }>;
  /** Fecha de hoy `YYYY-MM-DD`, para validar. Inyectada para mantener la función pura. */
  today: string;
}

export interface QuoteLine {
  slug: string;
  name: string;
  quantity: number;
  /** Solo en servicios por hora. */
  hours?: number;
  unitPrice: number;
  subtotal: number;
}

export interface Quote {
  base: number;
  lines: QuoteLine[];
  total: number;
  /** Fecha y hora elegidas, y horas dentro del rango. Solo entonces ONE-24 permite enviar. */
  complete: boolean;
  warnings: string[];
}

export const MIN_HOURS = 1;
export const MAX_HOURS = 15;

export const clamp = (value: number, min: number, max: number): number => {
  const n = Number.isFinite(value) ? Math.trunc(value) : min;
  return Math.min(Math.max(n, min), Math.max(min, max));
};

/** Horas máximas que puede contratar un servicio: su tope y las horas del alquiler. */
export const maxServiceHours = (c: QuoteComplement, rentalHours: number): number =>
  Math.min(c.maxHours ?? rentalHours, rentalHours);

export function buildQuote(input: QuoteInput): Quote {
  const hours = clamp(input.hours, MIN_HOURS, MAX_HOURS);
  const base = input.priceUnit === 'turno' ? input.price : input.price * hours;
  const warnings: string[] = [];

  const lines: QuoteLine[] = [];
  for (const c of input.complements) {
    const picked = input.selection[c.slug];
    if (!picked) continue;
    const quantity = clamp(picked.quantity, 1, c.maxQuantity);
    if (c.pricing === 'hora') {
      const h = clamp(picked.hours, 1, maxServiceHours(c, hours));
      lines.push({
        slug: c.slug,
        name: c.name,
        quantity,
        hours: h,
        unitPrice: c.price,
        subtotal: c.price * h * quantity,
      });
    } else {
      lines.push({
        slug: c.slug,
        name: c.name,
        quantity,
        unitPrice: c.price,
        subtotal: c.price * quantity,
      });
    }
  }

  if (input.guests > input.maxCapacity) {
    warnings.push(`Superas la capacidad máxima del espacio (${input.maxCapacity} personas).`);
  }

  const dateOk = input.date !== '' && input.date >= input.today;
  if (input.date !== '' && !dateOk) warnings.push('La fecha debe ser hoy o posterior.');

  return {
    base,
    lines,
    total: lines.reduce((sum, l) => sum + l.subtotal, base),
    complete: dateOk && input.startTime !== '' && input.guests >= 1,
    warnings,
  };
}

/** `HH:MM` → minutos desde medianoche. */
export const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/** Minutos desde medianoche → `HH:MM` (1440 = 24:00; más de 1440 = día siguiente). */
export const toTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** `HH:MM` → "10:00 am". Medianoche (24:00) es "12:00 am"; "26:00" es "2:00 am". */
export const formatTime = (time: string): string => {
  const minutes = toMinutes(time);
  const h = Math.floor(minutes / 60) % 24;
  const suffix = h < 12 ? 'am' : 'pm';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(minutes % 60).padStart(2, '0')} ${suffix}`;
};

export interface TimeSlot {
  /** Minutos desde medianoche. */
  start: number;
  /** Minutos desde la medianoche inicial; más de 1440 = termina al día siguiente. */
  end: number;
}

/** Días de la semana en el orden de `Date.getDay()` (0 = domingo). */
export const WEEKDAYS = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
] as const;

/** Hora más tardía a la que puede terminar un turno que cruza la medianoche. */
const LATEST_OVERNIGHT_END = 6 * 60;

/** `"11:00"`, `"11:00 am"` o `"11:00 p.m."` → minutos desde medianoche; `null` si no es válida. */
const parseClock = (text: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})(?:\s*([ap])\.?\s?m\.?)?$/i.exec(text.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  const period = m[3]?.toLowerCase();
  if (minute >= 60 || (period && (hour < 1 || hour > 12))) return null;
  if (!period) return hour * 60 + minute;
  return ((hour % 12) + (period === 'p' ? 12 : 0)) * 60 + minute;
};

/**
 * `"11:00 a.m - 02:00 a.m"` o `"11:00-02:00"` → turno. Medianoche como fin (`12:00 a.m` o
 * `24:00`) es válida y un fin de madrugada cae al día siguiente. Devuelve `null` si el formato
 * no es válido.
 */
export const parseSlot = (text: string): TimeSlot | null => {
  const [from, to, ...rest] = text.split('-');
  if (to === undefined || rest.length > 0) return null;
  const start = parseClock(from);
  const rawEnd = parseClock(to);
  if (start === null || rawEnd === null) return null;
  const overnight = rawEnd <= LATEST_OVERNIGHT_END && rawEnd < start;
  const end = overnight ? rawEnd + 24 * 60 : rawEnd;
  return start < end && (overnight || end <= 24 * 60) ? { start, end } : null;
};
