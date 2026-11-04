-- Lanna Snap · unique player names
-- Run this whole file once in Supabase → SQL Editor (safe to run again). Run leaderboard.sql again after it.
-- Names are compared ignoring upper/lower case, extra spaces and invisible characters,
-- so "Somchai", "somchai" and "  Somchai " all count as the same name.

create table if not exists public.player_names (
  uid uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  name_key text not null unique,
  updated timestamptz not null default now()
);
alter table public.player_names enable row level security;
-- no policies: players change names only through set_name()/claim_name()

create or replace function public.name_key(n text) returns text language sql immutable as $$
  select lower(regexp_replace(regexp_replace(coalesce(n, ''), '[​-‍﻿­]', '', 'g'), '\s+', ' ', 'g'))
$$;
create or replace function public.name_clean(n text) returns text language sql immutable as $$
  select left(btrim(regexp_replace(regexp_replace(coalesce(n, ''), '[<>​-‍﻿­]', '', 'g'), '\s+', ' ', 'g')), 20)
$$;

-- set my name exactly; fails with 'name taken' if someone else has it
create or replace function public.set_name(new_name text) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); n text := public.name_clean(new_name); k text;
begin
  if me is null then raise exception 'login required'; end if;
  if char_length(n) < 2 then raise exception 'name too short'; end if;
  k := btrim(public.name_key(n));
  if k in ('ai', 'ผู้เล่น', 'ผู้มาเยือน', 'admin', 'แอดมิน', 'ผู้สร้าง') then raise exception 'name reserved'; end if;
  if exists (select 1 from player_names where name_key = k and uid <> me) then raise exception 'name taken'; end if;
  insert into player_names(uid, name, name_key) values (me, n, k)
    on conflict (uid) do update set name = excluded.name, name_key = excluded.name_key, updated = now();
  return n;
exception when unique_violation then raise exception 'name taken';
end $$;

-- first sign-in: keep my current name if I already own one, otherwise take the wanted name,
-- adding a number (Somchai 2, Somchai 3, …) when it is already used
create or replace function public.claim_name(wanted text) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); base text := public.name_clean(wanted); cur text; i int := 1; tryname text;
begin
  if me is null then raise exception 'login required'; end if;
  select name into cur from player_names where uid = me; if cur is not null then return cur; end if;
  if char_length(base) < 2 or btrim(public.name_key(base)) in ('ai', 'ผู้เล่น', 'ผู้มาเยือน', 'admin', 'แอดมิน', 'ผู้สร้าง') then base := 'ผู้เล่น'; i := 2; end if;
  loop
    tryname := case when i = 1 then base else left(base, 20 - char_length(' ' || i)) || ' ' || i end;
    begin
      if not exists (select 1 from player_names where name_key = btrim(public.name_key(tryname))) then
        insert into player_names(uid, name, name_key) values (me, tryname, btrim(public.name_key(tryname)));
        return tryname;
      end if;
    exception when unique_violation then null; end;
    i := i + 1; if i > 9999 then raise exception 'could not find a free name'; end if;
  end loop;
end $$;

revoke all on function public.set_name(text), public.claim_name(text) from public, anon;
grant execute on function public.set_name(text), public.claim_name(text) to authenticated;
