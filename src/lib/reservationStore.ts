/** Estado compartido entre el formulario de reserva y los botones "Reservar" de la página (islands). */
export interface ReservationUiState {
  /** `undefined` = sesión sin resolver, `null` = sin sesión. */
  userId: string | null | undefined;
  canReserve: boolean;
  submitting: boolean;
  /** Campos que faltan, ej. `['la fecha', 'el horario']`. */
  missing: string[];
  loginHref: string;
}

type Listener = (s: ReservationUiState) => void;

let state: ReservationUiState = {
  userId: undefined,
  canReserve: false,
  submitting: false,
  missing: [],
  loginHref: '/login',
};
let submitHandler: (() => void) | null = null;
const listeners = new Set<Listener>();

export const getReservationState = (): ReservationUiState => state;

export function setReservationState(next: ReservationUiState): void {
  state = next;
  for (const l of listeners) l(state);
}

export const setSubmitHandler = (fn: (() => void) | null): void => {
  submitHandler = fn;
};

export const submitReservation = (): void => submitHandler?.();

export function subscribeReservation(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
