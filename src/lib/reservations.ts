import type { QuoteLine } from '@/lib/quote';
import { toMinutes } from '@/lib/quote';
import { supabase } from '@/lib/supabase';

export type ReservationStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'rechazada';

export interface Reservation {
  id: string;
  space_slug: string;
  space_name: string;
  /** `YYYY-MM-DDTHH:MM:SS`, hora local de Lima (sin zona). */
  starts_at: string;
  ends_at: string;
  guests: number;
  base: number;
  total: number;
  complements: QuoteLine[];
  status: ReservationStatus;
  created_at: string;
}

export interface TakenSlot {
  /** Minutos desde la medianoche del día consultado; más de 1440 = día siguiente. */
  start: number;
  end: number;
}

/** Hay solape entre dos rangos de minutos (extremos abiertos: turnos contiguos no chocan). */
export const overlaps = (a: TakenSlot, b: TakenSlot): boolean => a.start < b.end && b.start < a.end;

const dayMinutes = (ts: string, date: string): number => {
  if (ts.slice(0, 10) < date) return 0;
  if (ts.slice(0, 10) > date) return 24 * 60 + toMinutes(ts.slice(11, 16));
  return toMinutes(ts.slice(11, 16));
};

/** Turnos ocupados del espacio en una fecha (`YYYY-MM-DD`). */
export async function fetchTakenSlots(spaceSlug: string, date: string): Promise<TakenSlot[]> {
  const { data, error } = await supabase.rpc('taken_slots', {
    p_space_slug: spaceSlug,
    p_date: date,
  });
  if (error) throw error;
  return (data as { starts_at: string; ends_at: string }[]).map((r) => ({
    start: dayMinutes(r.starts_at, date),
    end: dayMinutes(r.ends_at, date),
  }));
}

export interface NewReservation {
  spaceSlug: string;
  spaceName: string;
  /** `YYYY-MM-DD`. */
  date: string;
  /** Minutos desde medianoche; `end` >= 1440 cae al día siguiente. */
  start: number;
  end: number;
  guests: number;
  base: number;
  total: number;
  lines: QuoteLine[];
}

const pad = (n: number) => String(n).padStart(2, '0');

/** `date` + minutos → `YYYY-MM-DDTHH:MM:00`; desde 1440 pasa al día siguiente. */
const stamp = (date: string, minutes: number): string => {
  const day = new Date(`${date}T12:00:00`);
  if (minutes >= 24 * 60) day.setDate(day.getDate() + 1);
  const time = minutes % (24 * 60);
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}T${pad(Math.floor(time / 60))}:${pad(time % 60)}:00`;
};

export async function createReservation(input: NewReservation, userId: string): Promise<void> {
  const { error } = await supabase.from('reservations').insert({
    user_id: userId,
    space_slug: input.spaceSlug,
    space_name: input.spaceName,
    starts_at: stamp(input.date, input.start),
    ends_at: stamp(input.date, input.end),
    guests: input.guests,
    base: input.base,
    total: input.total,
    complements: input.lines,
  });
  if (error) throw error;
}

export async function listMyReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('starts_at', { ascending: false });
  if (error) throw error;
  return data as Reservation[];
}

export async function cancelReservation(id: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_reservation', { p_id: id });
  if (error) throw error;
}

/** Traduce errores de reservas a mensajes claros. */
export function reservationErrorMessage(error: { code?: string; message: string }): string {
  switch (error.code) {
    case '23P01': // exclusion_violation: otro usuario reservó ese turno
      return 'Ese turno ya fue reservado. Elige otro horario o fecha.';
    case '42501': // RLS: fecha pasada o sesión inválida
      return 'No se pudo crear la reserva. Revisa la fecha e inicia sesión de nuevo.';
    case 'P0001':
      return 'Esta reserva ya no se puede cancelar.';
    default:
      return 'No pudimos procesar tu solicitud. Inténtalo de nuevo.';
  }
}
