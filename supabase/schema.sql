-- =============================================================
--  Gårdsbutikk – Supabase-skjema (annonse-modell)
--  Kjør hele filen i Supabase Dashboard -> SQL Editor.
--  Trygg å kjøre på nytt. Migrerer automatisk fra den gamle
--  "availability"-modellen (egg) hvis den finnes.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Annonser (listings) – erstatter gamle "availability"
-- -------------------------------------------------------------
create table if not exists public.listings (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  description      text,
  image_url        text,
  category         text,
  -- Hvordan kunden reserverer:
  --   'fixed'  = faste valg (quantity_options), f.eks. egg 6/12/24
  --   'free'   = kunden skriver inn ønsket antall
  --   'single' = én enhet per reservasjon (f.eks. ett dyr)
  reservation_type text not null default 'fixed'
                   check (reservation_type in ('fixed', 'free', 'single')),
  quantity_options integer[] not null default '{6,12,24}',
  available_count  integer not null default 0 check (available_count >= 0),
  price            numeric(10, 2),           -- forberedt for betaling senere
  is_published     boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 2. Reservasjoner
-- -------------------------------------------------------------
create table if not exists public.reservations (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  name       text not null,
  phone      text not null,
  quantity   integer not null check (quantity > 0),
  note       text,
  created_at timestamptz not null default now()
);

-- Oppgrader eksisterende reservations-tabell (fra gammel modell)
alter table public.reservations
  drop constraint if exists reservations_quantity_check;
alter table public.reservations
  add column if not exists listing_id uuid references public.listings(id) on delete set null;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reservations_quantity_positive'
  ) then
    alter table public.reservations
      add constraint reservations_quantity_positive check (quantity > 0);
  end if;
end $$;

-- -------------------------------------------------------------
-- 3. Migrering: gammel availability -> listings (kjøres én gang)
-- -------------------------------------------------------------
do $$
declare
  a record;
begin
  if exists (
    select from information_schema.tables
    where table_schema = 'public' and table_name = 'availability'
  ) then
    select * into a from public.availability order by updated_at desc limit 1;
    if found and not exists (select 1 from public.listings where slug = 'ferske-egg') then
      insert into public.listings
        (slug, title, description, image_url, category,
         reservation_type, quantity_options, available_count, is_published, sort_order)
      values
        ('ferske-egg', 'Ferske egg', a.note, a.image_url, 'egg',
         'fixed', '{6,12,24}', a.available_count, true, 0);
    end if;

    -- Knytt gamle reservasjoner til egg-annonsen
    update public.reservations
       set listing_id = (select id from public.listings where slug = 'ferske-egg')
     where listing_id is null;
  end if;
end $$;

-- Standard egg-annonse for helt ferske installasjoner
insert into public.listings
  (slug, title, description, category, reservation_type, quantity_options,
   available_count, is_published, sort_order)
select 'ferske-egg', 'Ferske egg', 'Ferske egg fra våre 10 høner.', 'egg',
       'fixed', '{6,12,24}', 0, true, 0
where not exists (select 1 from public.listings);

-- -------------------------------------------------------------
-- 4. Row Level Security
-- -------------------------------------------------------------
alter table public.listings     enable row level security;
alter table public.reservations enable row level security;

-- Alle kan lese PUBLISERTE annonser
drop policy if exists "listings_read_published" on public.listings;
create policy "listings_read_published"
  on public.listings for select
  using (is_published = true);

-- Innlogget admin kan lese ALLE annonser (også skjulte)
drop policy if exists "listings_read_authenticated" on public.listings;
create policy "listings_read_authenticated"
  on public.listings for select
  to authenticated
  using (true);

-- Kun innlogget admin kan opprette/endre/slette annonser
drop policy if exists "listings_write_authenticated" on public.listings;
create policy "listings_write_authenticated"
  on public.listings for all
  to authenticated
  using (true)
  with check (true);

-- Kun innlogget admin kan lese reservasjoner (personopplysninger)
drop policy if exists "reservations_read_authenticated" on public.reservations;
create policy "reservations_read_authenticated"
  on public.reservations for select
  to authenticated
  using (true);
-- Ingen direkte insert for anon: reservasjoner går kun via make_reservation()

-- -------------------------------------------------------------
-- 5. Atomisk reservasjon (security definer)
-- -------------------------------------------------------------
-- Fjern gammel signatur fra egg-modellen om den finnes
drop function if exists public.make_reservation(text, text, integer, text);

create or replace function public.make_reservation(
  p_listing_id uuid,
  p_name       text,
  p_phone      text,
  p_quantity   integer,
  p_note       text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.listings%rowtype;
  v_id  uuid;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    return json_build_object('ok', false, 'error', 'missing_fields');
  end if;

  if p_quantity is null or p_quantity < 1 then
    return json_build_object('ok', false, 'error', 'invalid_quantity');
  end if;

  -- Lås annonsen for trygg nedtelling ved samtidige forespørsler
  select * into v_row from public.listings where id = p_listing_id for update;

  if not found or v_row.is_published = false then
    return json_build_object('ok', false, 'error', 'not_found');
  end if;

  -- Valider antall ut fra reservasjonstype
  if v_row.reservation_type = 'fixed' then
    if not (p_quantity = any (v_row.quantity_options)) then
      return json_build_object('ok', false, 'error', 'invalid_quantity');
    end if;
  elsif v_row.reservation_type = 'single' then
    if p_quantity <> 1 then
      return json_build_object('ok', false, 'error', 'invalid_quantity');
    end if;
  end if;
  -- 'free': ethvert positivt antall er lov (begrenses av lageret under)

  if v_row.available_count < p_quantity then
    return json_build_object('ok', false, 'error', 'not_enough');
  end if;

  update public.listings
     set available_count = available_count - p_quantity,
         updated_at = now()
   where id = v_row.id;

  insert into public.reservations (listing_id, name, phone, quantity, note)
  values (v_row.id, p_name, p_phone, p_quantity, nullif(trim(p_note), ''))
  returning id into v_id;

  return json_build_object('ok', true, 'id', v_id);
end;
$$;

grant execute on function
  public.make_reservation(uuid, text, text, integer, text)
  to anon, authenticated;

-- -------------------------------------------------------------
-- 6. Storage-bøtte for annonsebilder
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- Behold også den gamle egg-images-bøtta så migrerte bilde-URLer virker
insert into storage.buckets (id, name, public)
values ('egg-images', 'egg-images', true)
on conflict (id) do nothing;

drop policy if exists "listing_images_public_read" on storage.objects;
create policy "listing_images_public_read"
  on storage.objects for select
  using (bucket_id in ('listing-images', 'egg-images'));

drop policy if exists "listing_images_write_authenticated" on storage.objects;
create policy "listing_images_write_authenticated"
  on storage.objects for all
  to authenticated
  using (bucket_id in ('listing-images', 'egg-images'))
  with check (bucket_id in ('listing-images', 'egg-images'));

-- -------------------------------------------------------------
-- 7. Realtime – live oppdatering av beholdning
--    Legger tabellene i supabase_realtime-publikasjonen slik at
--    åpne sider oppdateres i sanntid.
-- -------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public' and tablename = 'listings'
    ) then
      alter publication supabase_realtime add table public.listings;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public' and tablename = 'reservations'
    ) then
      alter publication supabase_realtime add table public.reservations;
    end if;
  end if;
end $$;

-- -------------------------------------------------------------
-- 8. Rydd bort gammel availability-tabell (etter migrering)
-- -------------------------------------------------------------
drop table if exists public.availability cascade;
