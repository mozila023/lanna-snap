-- Lanna Snap · leaderboard (top 100 list + your own position up to 500)
-- Run this whole file once in Supabase → SQL Editor (safe to run again).
-- Order: rank points (high first), then wins, then whoever reached it first (older account).
-- Only players with at least 1 rank point are listed.

drop function if exists public.leaderboard();
create function public.leaderboard() returns jsonb
language sql security definer set search_path = public stable as $$
  with ranked as (
    select w.uid, w.rank, w.wins,
           row_number() over (order by w.rank desc, w.wins desc, w.created asc, w.uid) as pos
    from wallet w where w.rank > 0
  ), top as (
    select r.pos, r.rank, r.wins,
           left(coalesce(nullif(trim(p.data->>'name'), ''), 'ผู้เล่น'), 20) as name,
           case
             when p.data->'avatar'->>'type' = 'card' then jsonb_build_object('type', 'card', 'id', left(p.data->'avatar'->>'id', 40))
             when p.data->'avatar'->>'type' = 'google' and p.data->'avatar'->>'src' like 'https://%' and length(p.data->'avatar'->>'src') < 600
               then jsonb_build_object('type', 'google', 'src', p.data->'avatar'->>'src')
           end as av,
           (r.uid = auth.uid()) as me
    from ranked r left join profiles p on p.id = r.uid
    where r.pos <= 100 order by r.pos
  )
  select json_build_object(
    'top', coalesce((select json_agg(t order by t.pos) from top t), '[]'::json),
    'me', (select json_build_object('pos', case when r.pos <= 500 then r.pos end, 'rank', r.rank)
           from ranked r where r.uid = auth.uid()),
    'total', (select count(*) from ranked)
  )::jsonb
$$;
revoke all on function public.leaderboard() from public;
grant execute on function public.leaderboard() to anon, authenticated;
