/** Cálculo de la cotización de un espacio. Funciones puras, sin Astro ni DOM (ONE-23). */

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
  /** Precio base del espacio por hora. */
  pricePerHour: number;
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
export const MAX_HOURS = 14;

export const clamp = (value: number, min: number, max: number): number => {
  const n = Number.isFinite(value) ? Math.trunc(value) : min;
  return Math.min(Math.max(n, min), Math.max(min, max));
};

/** Horas máximas que puede contratar un servicio: su tope y las horas del alquiler. */
export const maxServiceHours = (c: QuoteComplement, rentalHours: number): number =>
  Math.min(c.maxHours ?? rentalHours, rentalHours);

export function buildQuote(input: QuoteInput): Quote {
  const hours = clamp(input.hours, MIN_HOURS, MAX_HOURS);
  const base = input.pricePerHour * hours;
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

/** Minutos desde medianoche → `HH:MM` (1440 = 24:00). */
export const toTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** `HH:MM` → "10:00 am". El cierre de medianoche (24:00) se muestra como "11:59 pm". */
export const formatTime = (time: string): string => {
  const minutes = toMinutes(time);
  if (minutes >= 24 * 60) return '12:00 am';
  const h = Math.floor(minutes / 60);
  const suffix = h < 12 ? 'am' : 'pm';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(minutes % 60).padStart(2, '0')} ${suffix}`;
};

export interface TimeSlot {
  /** Minutos desde medianoche. */
  start: number;
  /** Minutos desde medianoche; 1440 = 12:00 am. */
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

/** `"10:00-14:00"` → turno. `24:00` es válido como fin. Devuelve `null` si el formato no es válido. */
export const parseSlot = (text: string): TimeSlot | null => {
  const m = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.exec(text);
  if (!m) return null;
  const start = Number(m[1]) * 60 + Number(m[2]);
  const end = Number(m[3]) * 60 + Number(m[4]);
  return Number(m[2]) < 60 && Number(m[4]) < 60 && start < end && end <= 24 * 60
    ? { start, end }
    : null;
};
