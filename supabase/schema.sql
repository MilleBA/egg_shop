-- =============================================================
--  Egg Shop – Supabase-skjema
--  Kjør dette i Supabase Dashboard -> SQL Editor.
--  Kjør hele filen én gang. Den er trygg å kjøre på nytt.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Tabeller
-- -------------------------------------------------------------

-- Tilgjengelighet: én rad som beskriver dagens situasjon.
-- Admin oppdaterer available_count, image_url og note.
create table if not exists public.availability (
  id              uuid primary key default gen_random_uuid(),
  available_count integer not null default 0 check (available_count >= 0),
  image_url       text,
  note            text,
  updated_at      timestamptz not null default now()
);

-- Reservasjoner fra kunder.
-- name og phone er personopplysninger og vises kun til innlogget admin.
create table if not exists public.reservations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  quantity   integer not null check (quantity in (6, 12, 24)),
  note       text,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 2. Row Level Security
-- -------------------------------------------------------------
alter table public.availability enable row level security;
alter table public.reservations enable row level security;

-- Alle kan LESE tilgjengelighet (offentlig side).
drop policy if exists "availability_read_all" on public.availability;
create policy "availability_read_all"
  on public.availability for select
  using (true);

-- Kun innlogget admin kan endre tilgjengelighet.
drop policy if exists "availability_write_authenticated" on public.availability;
create policy "availability_write_authenticated"
  on public.availability for all
  to authenticated
  using (true)
  with check (true);

-- Kun innlogget admin kan LESE reservasjoner (personopplysninger).
drop policy if exists "reservations_read_authenticated" on public.reservations;
create policy "reservations_read_authenticated"
  on public.reservations for select
  to authenticated
  using (true);

-- Bevisst INGEN insert-policy for anon: reservasjoner opprettes kun
-- gjennom funksjonen make_reservation() nedenfor (atomisk nedtelling).

-- -------------------------------------------------------------
-- 3. Atomisk reservasjon (security definer)
--    Trekker fra lageret og oppretter reservasjon i én transaksjon,
--    slik at to kunder ikke kan reservere de samme eggene samtidig.
-- -------------------------------------------------------------
create or replace function public.make_reservation(
  p_name     text,
  p_phone    text,
  p_quantity integer,
  p_note     text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.availability%rowtype;
  v_id  uuid;
begin
  -- Enkel input-validering
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    return json_build_object('ok', false, 'error', 'missing_fields');
  end if;

  if p_quantity not in (6, 12, 24) then
    return json_build_object('ok', false, 'error', 'invalid_quantity');
  end if;

  -- Lås dagens rad slik at nedtellingen er trygg ved samtidige forespørsler
  select * into v_row
  from public.availability
  order by updated_at desc
  limit 1
  for update;

  if not found or v_row.available_count < p_quantity then
    return json_build_object('ok', false, 'error', 'not_enough');
  end if;

  update public.availability
     set available_count = available_count - p_quantity,
         updated_at = now()
   where id = v_row.id;

  insert into public.reservations (name, phone, quantity, note)
  values (p_name, p_phone, p_quantity, nullif(trim(p_note), ''))
  returning id into v_id;

  return json_build_object('ok', true, 'id', v_id);
end;
$$;

-- Alle (også anonyme) kan kalle funksjonen; den håndhever reglene selv.
grant execute on function public.make_reservation(text, text, integer, text)
  to anon, authenticated;

-- -------------------------------------------------------------
-- 4. Sørg for at det finnes nøyaktig én tilgjengelighets-rad
-- -------------------------------------------------------------
insert into public.availability (available_count, note)
select 0, null
where not exists (select 1 from public.availability);

-- -------------------------------------------------------------
-- 5. Storage-bøtte for bilder
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('egg-images', 'egg-images', true)
on conflict (id) do nothing;

-- Alle kan lese bildene (offentlig side viser dem).
drop policy if exists "egg_images_public_read" on storage.objects;
create policy "egg_images_public_read"
  on storage.objects for select
  using (bucket_id = 'egg-images');

-- Kun innlogget admin kan laste opp / endre / slette bilder.
drop policy if exists "egg_images_write_authenticated" on storage.objects;
create policy "egg_images_write_authenticated"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'egg-images')
  with check (bucket_id = 'egg-images');
