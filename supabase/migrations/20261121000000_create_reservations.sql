-- Reservas de espacios por hora (un día, un turno). Requiere sesión.
-- Un turno ocupado (pendiente o confirmada) no admite otra reserva que se solape.
create extension if not exists btree_gist with schema extensions;

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  space_slug text not null,
  space_name text not null,
  starts_at timestamp not null,
  ends_at timestamp not null,
  guests integer not null check (guests between 1 and 1000),
  base numeric(10, 2) not null check (base >= 0),
  total numeric(10, 2) not null check (total >= base),
  -- Líneas de complementos del resumen (buildQuote.lines).
  complements jsonb not null default '[]'::jsonb,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'confirmada', 'cancelada', 'rechazada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- Un solo turno activo por espacio y franja horaria.
  constraint reservations_no_overlap exclude using gist (
    space_slug with =,
    tsrange(starts_at, ends_at) with &&
  ) where (status in ('pendiente', 'confirmada'))
);

create index reservations_user_idx on public.reservations (user_id, starts_at desc);

alter table public.reservations enable row level security;

create policy "reservations_select_own" on public.reservations
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Solo se crea como pendiente y a futuro. Cancelar va por cancel_reservation().
create policy "reservations_insert_own" on public.reservations
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pendiente'
    and starts_at > (now() at time zone 'America/Lima')
  );

create trigger reservations_set_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();

-- Turnos ocupados de un espacio en una fecha, sin exponer datos de otros usuarios.
create function public.taken_slots(p_space_slug text, p_date date)
returns table (starts_at timestamp, ends_at timestamp)
language sql
stable
security definer
set search_path = ''
as $$
  select r.starts_at, r.ends_at
  from public.reservations r
  where r.space_slug = p_space_slug
    and r.status in ('pendiente', 'confirmada')
    and r.starts_at < (p_date + 1)::timestamp
    and r.ends_at > p_date::timestamp;
$$;

grant execute on function public.taken_slots(text, date) to anon, authenticated;

-- El usuario cancela su propia reserva activa; libera el turno.
create function public.cancel_reservation(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.reservations
  set status = 'cancelada'
  where id = p_id
    and user_id = (select auth.uid())
    and status in ('pendiente', 'confirmada');
  if not found then
    raise exception 'reservation_not_cancellable' using errcode = 'P0001';
  end if;
end;
$$;

revoke execute on function public.cancel_reservation(uuid) from public, anon;
grant execute on function public.cancel_reservation(uuid) to authenticated;
