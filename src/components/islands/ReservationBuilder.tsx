import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  buildQuote,
  clamp,
  formatTime,
  maxServiceHours,
  type Pricing,
  type TimeSlot,
  toTime,
} from '@/lib/quote';

export interface ComplementOption {
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  alt: string;
  pricing: Pricing;
  price: number;
  maxQuantity: number;
  maxHours?: number;
  capacity?: number;
}

interface Props {
  spaceName: string;
  locationLabel: string;
  pricePerHour: number;
  maxCapacity: number;
  complements: ComplementOption[];
  /** Turnos por día de la semana (índice de `Date.getDay()`, 0 = domingo). */
  slotsByWeekday: TimeSlot[][];
}

const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

const PRICING_LABEL: Record<Pricing, (c: ComplementOption) => string> = {
  unidad: (c) => `${money.format(c.price)} por unidad`,
  evento: (c) =>
    c.maxQuantity > 1
      ? `${money.format(c.price)} por unidad, todo el alquiler`
      : `${money.format(c.price)}, todo el alquiler`,
  hora: (c) => `${money.format(c.price)} por hora`,
};

const field =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-body text-text focus-visible:outline-2 focus-visible:outline-offset-1';
const label = 'flex flex-col gap-1 text-small font-semibold';
const stepper =
  'inline-flex size-9 items-center justify-center rounded-pill border border-border bg-surface text-body font-semibold hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40';

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

function Stepper({
  value,
  min,
  max,
  onChange,
  name,
  unit,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  name: string;
  unit: string;
}) {
  return (
    <fieldset class="m-0 inline-flex items-center gap-2 border-0 p-0">
      <legend class="sr-only">{`${unit} de ${name}`}</legend>
      <button
        type="button"
        class={stepper}
        aria-label={`Menos ${unit} de ${name}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1, min, max))}
      >
        <span aria-hidden="true">−</span>
      </button>
      <output class="min-w-6 text-center font-semibold" aria-label={`${unit} de ${name}`}>
        {value}
      </output>
      <button
        type="button"
        class={stepper}
        aria-label={`Más ${unit} de ${name}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1, min, max))}
      >
        <span aria-hidden="true">+</span>
      </button>
    </fieldset>
  );
}

export default function ReservationBuilder({
  spaceName,
  locationLabel,
  pricePerHour,
  maxCapacity,
  complements,
  slotsByWeekday,
}: Props) {
  const [today, setToday] = useState('');
  const [date, setDate] = useState('');
  const [slotIndex, setSlotIndex] = useState('');
  const [guests, setGuests] = useState('');
  const [selection, setSelection] = useState<Record<string, { quantity: number; hours: number }>>(
    {},
  );

  useEffect(() => setToday(localToday()), []);

  const guestsNumber = Number.parseInt(guests, 10) || 0;

  // Turnos fijos del día de la semana elegido. Sin fecha, no hay turnos.
  const weekday = date ? new Date(`${date}T12:00:00`).getDay() : null;
  const slots = weekday === null ? [] : slotsByWeekday[weekday];
  const slot = slots[Number(slotIndex)] as (typeof slots)[number] | undefined;
  const startTime = slot ? toTime(slot.start) : '';
  const endTime = slot ? toTime(slot.end) : '';
  const hours = slot ? (slot.end - slot.start) / 60 : 0;

  const onDate = (value: string) => {
    setDate(value);
    setSlotIndex('');
  };

  const quote = useMemo(
    () =>
      buildQuote({
        pricePerHour,
        maxCapacity,
        date,
        startTime: hours > 0 ? startTime : '',
        hours: hours || 1,
        guests: guestsNumber,
        complements,
        selection,
        today: today || '0000-00-00',
      }),
    [
      pricePerHour,
      maxCapacity,
      date,
      startTime,
      hours,
      guestsNumber,
      complements,
      selection,
      today,
    ],
  );

  const update = (slug: string, patch: Partial<{ quantity: number; hours: number }>) =>
    setSelection((prev) => ({ ...prev, [slug]: { ...prev[slug], ...patch } }));

  const toggle = (c: ComplementOption, checked: boolean) =>
    setSelection((prev) => {
      const next = { ...prev };
      if (checked) next[c.slug] = { quantity: 1, hours: 1 };
      else delete next[c.slug];
      return next;
    });

  const timeRange = hours > 0 ? `${formatTime(startTime)} – ${formatTime(endTime)}` : null;

  return (
    <section id="reserva" aria-labelledby="reserva-title" class="flex scroll-mt-28 flex-col gap-6">
      <h2 id="reserva-title" class="text-h3 font-semibold">
        Arma tu reserva
      </h2>

      <fieldset class="grid gap-4 sm:grid-cols-2">
        <legend class="sr-only">Fecha y horario del alquiler</legend>
        <label class={label}>
          Fecha
          <input
            type="date"
            class={field}
            value={date}
            min={today || undefined}
            required
            onInput={(e) => onDate(e.currentTarget.value)}
          />
        </label>
        <label class={label}>
          Horario
          <select
            class={field}
            value={slotIndex}
            required
            disabled={slots.length === 0}
            onChange={(e) => setSlotIndex(e.currentTarget.value)}
          >
            <option value="">{date ? 'Elige el horario' : 'Elige primero la fecha'}</option>
            {slots.map((sl, i) => (
              <option key={sl.start} value={i}>
                {formatTime(toTime(sl.start))} - {formatTime(toTime(sl.end))}
              </option>
            ))}
          </select>
        </label>
        <label class={label}>
          Número de personas
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            class={field}
            value={guests}
            placeholder={`Hasta ${maxCapacity}`}
            required
            onInput={(e) => setGuests(e.currentTarget.value.replace(/\D/g, ''))}
          />
        </label>
      </fieldset>
      {complements.length > 0 && (
        <fieldset class="flex flex-col gap-3">
          <legend class="mb-1 text-body font-semibold">Complementos</legend>
          <ul class="grid gap-3 sm:grid-cols-2">
            {complements.map((c) => {
              const picked = selection[c.slug];
              const id = `comp-${c.slug}`;
              const serviceMax = maxServiceHours(c, hours);
              return (
                <li
                  key={c.slug}
                  class={`flex flex-col gap-3 rounded-card border p-3 transition-colors ${picked ? 'border-dark bg-surface-alt' : 'border-border bg-surface'}`}
                >
                  <div class="flex gap-3">
                    <img
                      src={c.image}
                      alt={c.alt}
                      width={80}
                      height={80}
                      loading="lazy"
                      decoding="async"
                      class="size-20 shrink-0 rounded-md object-cover"
                    />
                    <div class="flex min-w-0 flex-col gap-1">
                      <label for={id} class="flex cursor-pointer items-start gap-2 font-semibold">
                        <input
                          id={id}
                          type="checkbox"
                          class="mt-1 size-4 shrink-0 accent-dark"
                          checked={Boolean(picked)}
                          onChange={(e) => toggle(c, e.currentTarget.checked)}
                        />
                        {c.name}
                      </label>
                      <p class="text-small text-text-muted">{PRICING_LABEL[c.pricing](c)}</p>
                      {c.capacity && (
                        <p class="text-small text-text-muted">
                          Cubre {c.capacity} {c.capacity === 1 ? 'persona' : 'personas'} por unidad
                        </p>
                      )}
                    </div>
                  </div>

                  {picked && (
                    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-small">
                      {c.maxQuantity > 1 && (
                        <div class="flex items-center gap-2">
                          <span>Cantidad</span>
                          <Stepper
                            name={c.name}
                            unit="cantidad"
                            value={clamp(picked.quantity, 1, c.maxQuantity)}
                            min={1}
                            max={c.maxQuantity}
                            onChange={(v) => update(c.slug, { quantity: v })}
                          />
                        </div>
                      )}
                      {c.pricing === 'hora' && (
                        <div class="flex items-center gap-2">
                          <span>Horas</span>
                          <Stepper
                            name={c.name}
                            unit="horas"
                            value={clamp(picked.hours, 1, serviceMax)}
                            min={1}
                            max={serviceMax}
                            onChange={(v) => update(c.slug, { hours: v })}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}

      <div class="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-soft">
        <h3 class="text-body font-semibold">Resumen</h3>

        <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-small">
          <dt class="text-text-muted">Espacio</dt>
          <dd class="text-right">
            {spaceName} · {locationLabel}
          </dd>
          <dt class="text-text-muted">Fecha</dt>
          <dd class="text-right">{date ? formatDate(date) : 'Sin elegir'}</dd>
          <dt class="text-text-muted">Horario</dt>
          <dd class="text-right">
            {timeRange ? `${timeRange} (${hours} ${hours === 1 ? 'hora' : 'horas'})` : 'Sin elegir'}
          </dd>
          <dt class="text-text-muted">Personas</dt>
          <dd class="text-right">{guestsNumber || 'Sin indicar'}</dd>
        </dl>

        <ul class="flex flex-col gap-1 border-t border-border pt-3 text-small">
          <li class="flex justify-between gap-4">
            <span>
              Espacio ({money.format(pricePerHour)} × {hours} h)
            </span>
            <span>{money.format(quote.base)}</span>
          </li>
          {quote.lines.map((l) => (
            <li key={l.slug} class="flex justify-between gap-4">
              <span>
                {l.name}
                {l.hours !== undefined && ` (${l.hours} h)`}
                {l.quantity > 1 && ` × ${l.quantity}`}
              </span>
              <span>{money.format(l.subtotal)}</span>
            </li>
          ))}
        </ul>

        <p
          class="flex items-baseline justify-between gap-4 border-t border-border pt-3 text-body font-semibold"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>Total estimado</span>
          <span class="text-h3">{money.format(quote.total)}</span>
        </p>

        {quote.warnings.length > 0 && (
          <ul
            class="flex flex-col gap-1 text-small font-medium text-text underline decoration-wavy"
            role="alert"
          >
            {quote.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}

        <p class="text-small text-text-muted">
          Precio referencial, sujeto a confirmación y disponibilidad.
        </p>
      </div>
    </section>
  );
}
