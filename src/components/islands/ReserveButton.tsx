import { useEffect, useState } from 'preact/hooks';
import {
  getReservationState,
  submitReservation,
  subscribeReservation,
} from '@/lib/reservationStore';

interface Props {
  /** Oculta el texto de campos faltantes (barra móvil, poco espacio). */
  hideHint?: boolean;
  class?: string;
}

const base =
  'inline-flex items-center justify-center rounded-pill bg-primary px-5 py-2.5 text-small font-semibold text-primary-contrast transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary';

/** "Reservar" fuera del formulario: habilitado solo con los campos completos; pide login si falta. */
export default function ReserveButton({ hideHint, class: cls = '' }: Props) {
  const [s, setS] = useState(getReservationState);
  useEffect(() => {
    setS(getReservationState());
    return subscribeReservation(setS);
  }, []);

  if (s.userId === null && s.canReserve) {
    return (
      <a href={s.loginHref} class={`${base} ${cls}`}>
        Inicia sesión para reservar
      </a>
    );
  }

  return (
    <div class="flex flex-col gap-2">
      <button
        type="button"
        class={`${base} ${cls}`}
        disabled={!s.canReserve || s.submitting || s.userId === undefined}
        onClick={submitReservation}
      >
        {s.submitting ? 'Reservando…' : 'Reservar'}
      </button>
      {!hideHint && !s.canReserve && s.missing.length > 0 && (
        <p class="text-small text-text-muted">
          Elige {s.missing.join(', ')} en{' '}
          <a href="#reserva" class="font-semibold underline">
            Arma tu reserva
          </a>
          .
        </p>
      )}
    </div>
  );
}
