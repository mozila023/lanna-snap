-- Lanna Snap · donation reward (1,000 cowries, once per account)
-- 1) Run this whole file once in Supabase → SQL Editor.
-- 2) When a player sends you a donation slip with their player ID, run:
--      select public.admin_grant_donation('PLAYER-ID-HERE');
--    It answers 'granted' (1,000 cowries added) or 'already granted' (nothing changes).
-- Players cannot call this function; only you can, from the SQL Editor.

create or replace function public.admin_grant_donation(player uuid) returns text
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from wallet where uid = player) then
    raise exception 'no player with this id (they must sign in with Google once first)';
  end if;
  update wallet set bia = bia + 1000, first_topup = true where uid = player and first_topup = false;
  if not found then return 'already granted'; end if;
  return 'granted';
end $$;

revoke all on function public.admin_grant_donation(uuid) from public, anon, authenticated;

-- handy: list players who already received the donation reward
-- select uid, bia, created from public.wallet where first_topup order by created desc;
