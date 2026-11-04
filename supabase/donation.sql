-- Lanna Snap · donations with slip upload (1,000 cowries on the first donation, once per account)
-- Run this whole file once in Supabase → SQL Editor (safe to run again).
--
-- DAILY USE
--   1) See who is waiting:          select * from public.donation_queue;
--   2) Look at the slip:            Storage → bucket "slips" → folder = player id
--   3) Slip is good → give cowries: select public.admin_grant_donation('PLAYER-ID');
--      Slip is fake/wrong → reject: select public.admin_reject_donation('PLAYER-ID');
-- Players cannot call the admin functions; only you can, from the SQL Editor.

-- 1) private storage bucket for slip images (max 3 MB, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('slips', 'slips', false, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- 2) one row per uploaded slip
create table if not exists public.donations (
  id bigint generated always as identity primary key,
  uid uuid not null references auth.users(id) on delete cascade,
  path text not null,
  status text not null default 'pending' check (status in ('pending','granted','rejected')),
  created timestamptz not null default now(),
  decided timestamptz
);
create index if not exists donations_uid on public.donations(uid);
alter table public.donations enable row level security;
drop policy if exists "own donations" on public.donations;
create policy "own donations" on public.donations for select to authenticated using (uid = auth.uid());
grant select on public.donations to authenticated;
-- no insert/update policy: players only add rows through submit_slip()

-- how many slip files a player already has (used by the upload rule; max 10 per player)
create or replace function public.slip_count(player uuid) returns int
language sql security definer set search_path = public, storage stable as $$
  select count(*)::int from storage.objects where bucket_id = 'slips' and (storage.foldername(name))[1] = player::text
$$;
revoke all on function public.slip_count(uuid) from public, anon;
grant execute on function public.slip_count(uuid) to authenticated;

-- 3) storage rules: a player can upload into their own folder only, and read only their own slips
drop policy if exists "slips upload own" on storage.objects;
create policy "slips upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'slips' and (storage.foldername(name))[1] = auth.uid()::text and public.slip_count(auth.uid()) < 10);
drop policy if exists "slips read own" on storage.objects;
create policy "slips read own" on storage.objects for select to authenticated
  using (bucket_id = 'slips' and (storage.foldername(name))[1] = auth.uid()::text);

-- 4) player: register an uploaded slip
create or replace function public.submit_slip(path text) returns json
language plpgsql security definer set search_path = public, storage as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'login required'; end if;
  if split_part(path, '/', 1) <> me::text then raise exception 'bad slip path'; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'slips' and name = path) then raise exception 'slip not uploaded'; end if;
  if (select count(*) from donations where uid = me and created > now() - interval '1 day') >= 3 then raise exception 'too many slips today'; end if;
  insert into donations(uid, path) values (me, path);
  return public.donation_status();
end $$;

-- 5) player: latest donation status
create or replace function public.donation_status() returns json
language sql security definer set search_path = public stable as $$
  select json_build_object(
    'granted', coalesce((select first_topup from wallet where uid = auth.uid()), false),
    'latest',  (select status from donations where uid = auth.uid() order by created desc limit 1),
    'pending', (select count(*) from donations where uid = auth.uid() and status = 'pending'))
$$;
revoke all on function public.submit_slip(text), public.donation_status() from public, anon;
grant execute on function public.submit_slip(text), public.donation_status() to authenticated;

-- 6) admin: queue of slips waiting for you
create or replace view public.donation_queue with (security_invoker = true) as
  select d.uid as player_id, p.data->>'name' as player_name, d.path as slip_file, d.created
  from donations d left join profiles p on p.id = d.uid
  where d.status = 'pending' order by d.created;
revoke all on public.donation_queue from anon, authenticated;

-- 7) admin: grant / reject
create or replace function public.admin_grant_donation(player uuid) returns text
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from wallet where uid = player) then
    raise exception 'no player with this id (they must sign in with Google once first)';
  end if;
  update donations set status = 'granted', decided = now() where uid = player and status = 'pending';
  update wallet set bia = bia + 1000, first_topup = true where uid = player and first_topup = false;
  if not found then return 'already granted (slips marked as checked)'; end if;
  return 'granted';
end $$;

create or replace function public.admin_reject_donation(player uuid) returns text
language plpgsql security definer set search_path = public as $$
begin
  update donations set status = 'rejected', decided = now() where uid = player and status = 'pending';
  if not found then return 'nothing pending'; end if;
  return 'rejected';
end $$;
revoke all on function public.admin_grant_donation(uuid), public.admin_reject_donation(uuid) from public, anon, authenticated;
