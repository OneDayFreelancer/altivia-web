import { useEffect, useState } from 'preact/hooks';
import { requireSession } from '@/lib/auth';
import { formatTime } from '@/lib/quote';
import {
  cancelReservation,
  listMyReservations,
  type Reservation,
  type ReservationStatus,
  reservationErrorMessage,
} from '@/lib/reservations';

const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

const STATUS: Record<ReservationStatus, { label: string; cls: string }> = {
  pendiente: { label: 'Pendiente de confirmación', cls: 'border-border bg-surface-alt' },
  confirmada: { label: 'Confirmada', cls: 'border-dark bg-dark text-dark-contrast' },
  cancelada: { label: 'Cancelada', cls: 'border-border text-text-muted line-through' },
  rechazada: { label: 'Rechazada', cls: 'border-red-400 text-red-200' },
};

const time = (ts: string) => {
  const t = ts.slice(11, 16);
  return formatTime(t === '00:00' ? '24:00' : t);
};

const dateLabel = (ts: string) =>
  new Date(`${ts.slice(0, 10)}T12:00:00`).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const isActive = (r: Reservation) => r.status === 'pendiente' || r.status === 'confirmada';

/** Lista de reservas del usuario con opción de cancelar. Requiere sesión. */
export default function MyReservations() {
  const [items, setItems] = useState<Reservation[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [created, setCreated] = useState(false);

  const load = async () => {
    try {
      setItems(await listMyReservations());
    } catch (e) {
      setError(reservationErrorMessage(e as { code?: string; message: string }));
      setItems([]);
    }
  };

  useEffect(() => {
    // `window` solo existe en el cliente (el island también se renderiza en el servidor).
    setCreated(new URLSearchParams(window.location.search).get('nueva') === '1');
    requireSession().then((session) => session && load());
  }, []);

  const cancel = async (id: string) => {
    if (busyId || !window.confirm('¿Cancelar esta reserva? El turno quedará libre.')) return;
    setBusyId(id);
    setError('');
    try {
      await cancelReservation(id);
      await load();
    } catch (e) {
      setError(reservationErrorMessage(e as { code?: string; message: string }));
    } finally {
      setBusyId('');
    }
  };

  if (items === null) return <p class="text-text-muted">Cargando tus reservas…</p>;

  return (
    <div class="flex flex-col gap-4">
      {created && (
        <p
          class="rounded-md border border-dark bg-surface-alt p-3 text-small font-semibold"
          role="status"
        >
          Reserva creada. Queda pendiente hasta que el equipo la confirme.
        </p>
      )}
      {error && (
        <p
          class="rounded-md border border-red-400 bg-red-950 p-3 text-small text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}

      {items.length === 0 && !error && (
        <p class="text-text-muted">
          Aún no tienes reservas.{' '}
          <a href="/espacios" class="font-semibold underline">
            Explora los espacios
          </a>
          .
        </p>
      )}

      <ul class="flex flex-col gap-4">
        {items.map((r) => {
          const st = STATUS[r.status];
          return (
            <li
              key={r.id}
              class="flex flex-col gap-3 rounded-card border border-border bg-surface p-5 shadow-soft"
            >
              <div class="flex flex-wrap items-start justify-between gap-2">
                <h2 class="text-body font-semibold">
                  <a href={`/espacios/${r.space_slug}`} class="hover:underline">
                    {r.space_name}
                  </a>
                </h2>
                <span class={`rounded-pill border px-3 py-1 text-small font-semibold ${st.cls}`}>
                  {st.label}
                </span>
              </div>
              <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-small">
                <dt class="text-text-muted">Fecha</dt>
                <dd class="text-right capitalize">{dateLabel(r.starts_at)}</dd>
                <dt class="text-text-muted">Horario</dt>
                <dd class="text-right">
                  {time(r.starts_at)} – {time(r.ends_at)}
                </dd>
                <dt class="text-text-muted">Personas</dt>
                <dd class="text-right">{r.guests}</dd>
              </dl>
              {r.complements.length > 0 && (
                <ul class="flex flex-col gap-1 border-t border-border pt-3 text-small">
                  {r.complements.map((l) => (
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
              )}
              <p class="flex items-baseline justify-between gap-4 border-t border-border pt-3 font-semibold">
                <span>Total estimado</span>
                <span>{money.format(r.total)}</span>
              </p>
              {isActive(r) && (
                <button
                  type="button"
                  onClick={() => cancel(r.id)}
                  disabled={busyId === r.id}
                  class="self-start rounded-pill border border-text px-4 py-2 text-small font-semibold transition-colors hover:bg-text hover:text-surface disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyId === r.id ? 'Cancelando…' : 'Cancelar reserva'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
