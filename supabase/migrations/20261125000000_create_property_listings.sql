-- Solicitudes de propietarios para publicar su espacio (/publicar). Requiere sesión.
-- Quedan 'pendiente' hasta que el equipo las revise desde el panel de Supabase.
create table public.property_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 5 and 80),
  property_type text not null
    check (property_type in ('terraza', 'parrilla', 'jardin', 'salon')),
  district text not null check (char_length(district) between 2 and 60),
  address text not null check (char_length(address) between 5 and 160),
  max_capacity integer not null check (max_capacity between 1 and 1000),
  price_per_turn numeric(10, 2) not null check (price_per_turn > 0),
  description text not null check (char_length(description) between 30 and 1500),
  amenities text[] not null default '{}',
  contact_phone text not null check (contact_phone ~ '^9[0-9]{8}$'),
  -- Rutas en el bucket 'listing-photos'. La primera es la portada.
  photos text[] not null check (cardinality(photos) between 1 and 8),
  status text not null default 'pendiente'
    check (status in ('pendiente', 'aprobada', 'rechazada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index property_listings_user_idx on public.property_listings (user_id, created_at desc);

alter table public.property_listings enable row level security;

grant select, insert on public.property_listings to authenticated;

create policy "property_listings_select_own" on public.property_listings
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Solo se crea como pendiente y con fotos de la carpeta propia.
create policy "property_listings_insert_own" on public.property_listings
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pendiente'
    and (
      select bool_and(split_part(p, '/', 1) = (select auth.uid())::text)
      from unnest(photos) as p
    )
  );

create trigger property_listings_set_updated_at
  before update on public.property_listings
  for each row execute function public.set_updated_at();

-- Fotos privadas: cada usuario escribe solo en su carpeta `<user_id>/…`.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "listing_photos_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "listing_photos_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Solo se pueden borrar fotos huérfanas (envío fallido), no las de una solicitud.
create policy "listing_photos_delete_orphan" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (
      select 1 from public.property_listings l where objects.name = any (l.photos)
    )
  );
