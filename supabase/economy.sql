-- Lanna Snap · server economy and anti-cheat
-- Run once in Supabase → SQL Editor → New query → paste all → Run

-- ===================== Lanna Snap · server economy (anti-cheat) =====================
-- Everything of value (cowries, cards, spares, tiers, rank) lives in tables the client
-- can only READ. All changes go through the functions below, which check the rules.

-- ---------- tables ----------
create table if not exists public.cards (
  id text primary key, cost int not null, type text not null, rarity text not null  -- common | legend | dual
);

-- card list (generated from src/cards.js)
insert into public.cards(id,cost,type,rarity) values
('bosang',2,'job','common'),
('wualai',3,'job','common'),
('tilokaraj',5,'legend','legend'),
('inthawichayanon',4,'legend','legend'),
('whiteelephant',3,'animal','dual'),
('teenjok',1,'item','common'),
('doisuthep',4,'temple','common'),
('mangrai',6,'legend','dual'),
('kawila',4,'legend','dual'),
('teafarmer',1,'job','common'),
('coffeefarmer',2,'job','common'),
('catfish',5,'animal','dual'),
('nanglae',1,'item','common'),
('phrakaewcr',4,'temple','common'),
('carriage',2,'job','common'),
('bowlpainter',3,'job','common'),
('thipchang',5,'legend','legend'),
('anantayot',3,'legend','dual'),
('rooster',1,'animal','common'),
('elephantlp',4,'animal','common'),
('khaotaen',1,'item','common'),
('lampangluang',4,'temple','common'),
('longan',1,'job','common'),
('silkweaver',3,'job','common'),
('chamadevi',6,'legend','legend'),
('frog',2,'animal','dual'),
('lamyainoodle',2,'item','common'),
('hariphunchai',4,'temple','common'),
('kuptai',1,'job','common'),
('kaeomuangma',4,'legend','legend'),
('waterelephant',3,'animal','common'),
('buatong',2,'item','common'),
('doikongmu',4,'temple','common'),
('rower',3,'job','common'),
('saltmaker',2,'job','common'),
('phukha',5,'legend','legend'),
('pumanyaman',2,'legend','legend'),
('usuparat',5,'animal','common'),
('blackivory',3,'item','common'),
('goldenorange',1,'item','common'),
('chaehaeng',4,'temple','common'),
('morhom',2,'job','common'),
('teakcarpenter',4,'job','dual'),
('phralo',4,'legend','legend'),
('phuean',3,'legend','legend'),
('nangkhoi',2,'legend','legend'),
('horse',2,'animal','common'),
('chohae',4,'temple','common'),
('fisher',2,'job','common'),
('hyacinth',3,'job','common'),
('ngammueang',5,'legend','legend'),
('khunchueang',6,'legend','legend'),
('peacock',2,'animal','common'),
('sikhomkham',4,'temple','common'),
('namphi',3,'job','common'),
('langsat',1,'job','common'),
('phichai',5,'legend','legend'),
('laplae',3,'legend','legend'),
('durian',2,'item','common'),
('namphisword',1,'item','common'),
('phrathaen',4,'temple','common'),
('stickyrice',2,'food','common'),
('namphrik',2,'food','common'),
('hangle',3,'food','common'),
('khaepmu',1,'food','common'),
('khaosoi',2,'food','common'),
('khanomjeen',4,'food','common'),
('saiua',2,'food','common'),
('larb',3,'food','common')
on conflict (id) do update set cost=excluded.cost,type=excluded.type,rarity=excluded.rarity;

create table if not exists public.wallet (
  uid uuid primary key references auth.users(id) on delete cascade,
  bia int not null default 60 check (bia >= 0),
  rank int not null default 0 check (rank >= 0),
  wins int not null default 0, losses int not null default 0,
  cl int not null default 1,
  tut_reward boolean not null default false,
  first_topup boolean not null default false,
  day date, gift boolean not null default false, bags int not null default 0,
  offers text[], bought text[] not null default '{}',
  ai_day date, ai_gain int not null default 0,
  created timestamptz not null default now()
);

create table if not exists public.collection (
  uid uuid not null references auth.users(id) on delete cascade,
  card text not null references public.cards(id),
  tier int not null default 0 check (tier between 0 and 6),
  dup int not null default 0 check (dup >= 0),
  primary key (uid, card)
);

create table if not exists public.matches (
  id text primary key,
  a uuid, b uuid,
  a_report jsonb, b_report jsonb,
  status text not null default 'open',   -- open | settled | mismatch
  created timestamptz not null default now()
);

create table if not exists public.reports (
  id bigserial primary key,
  reporter uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target text not null, target_name text, reason text not null,
  match_id text, created timestamptz not null default now()
);

alter table public.cards enable row level security;
alter table public.wallet enable row level security;
alter table public.collection enable row level security;
alter table public.matches enable row level security;
alter table public.reports enable row level security;

drop policy if exists "cards readable" on public.cards;
create policy "cards readable" on public.cards for select using (true);
drop policy if exists "own wallet" on public.wallet;
create policy "own wallet" on public.wallet for select using (auth.uid() = uid);
drop policy if exists "own collection" on public.collection;
create policy "own collection" on public.collection for select using (auth.uid() = uid);
drop policy if exists "own matches" on public.matches;
create policy "own matches" on public.matches for select using (auth.uid() in (a, b));
drop policy if exists "file reports" on public.reports;
create policy "file reports" on public.reports for insert with check (auth.uid() = reporter);
-- no insert/update/delete policies on wallet/collection/matches: only the functions below can change them

-- ---------- helpers ----------
create or replace function public._today() returns date language sql stable as $$ select (now() at time zone 'Asia/Bangkok')::date $$;

create or replace function public._me() returns uuid language plpgsql stable as $$
begin if auth.uid() is null then raise exception 'not signed in'; end if; return auth.uid(); end $$;

create or replace function public._roll_day(u uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  update wallet set day = _today(), gift = false, bags = 0, offers = null, bought = '{}'
   where uid = u and (day is distinct from _today());
end $$;

create or replace function public.get_state() returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := _me(); w wallet;
begin
  perform _roll_day(u);
  select * into w from wallet where uid = u;
  if not found then return null; end if;
  return jsonb_build_object(
    'bia', w.bia, 'rank', w.rank, 'wins', w.wins, 'losses', w.losses, 'cl', w.cl,
    'tutReward', w.tut_reward, 'firstTopup', w.first_topup,
    'shop', jsonb_build_object('day', w.day, 'gift', w.gift, 'bags', w.bags, 'offers', coalesce(to_jsonb(w.offers), 'null'::jsonb), 'bought', to_jsonb(w.bought)),
    'owned', coalesce((select jsonb_object_agg(card, jsonb_build_object('tier', tier, 'dup', dup)) from collection where uid = u), '{}'::jsonb));
end $$;

-- first sign-in: wallet + starter deck (exactly one legend)
create or replace function public.init_account() returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := _me();
begin
  insert into wallet(uid, day) values (u, _today()) on conflict (uid) do nothing;
  insert into collection(uid, card)
    select u, c from unnest(array['rooster','teafarmer','bosang','carriage','horse','morhom','bowlpainter','wualai','elephantlp','lampangluang','khanomjeen','thipchang']) c
    on conflict do nothing;
  return get_state();
end $$;

-- random card the player does not own yet, of a given rarity
create or replace function public._random_unowned(u uuid, r text) returns text language sql volatile security definer set search_path = public as $$
  select c.id from cards c where c.rarity = r and not exists (select 1 from collection x where x.uid = u and x.card = c.id) order by random() limit 1
$$;

-- ---------- daily gift ----------
create or replace function public.claim_gift() returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := _me();
begin
  perform _roll_day(u);
  update wallet set bia = bia + 50, gift = true where uid = u and gift = false;
  if not found then raise exception 'gift already claimed today'; end if;
  return get_state();
end $$;

-- ---------- shop ----------
create or replace function public.shop_offers() returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := _me(); w wallet; picks text[] := '{}'; pick text; i int;
begin
  perform _roll_day(u);
  select * into w from wallet where uid = u for update;
  if w.offers is null then
    for i in 1..4 loop
      pick := null;
      if random() < 0.05 then
        select c.id into pick from cards c where c.rarity = 'legend' and c.id <> all(picks)
          and not exists (select 1 from collection x where x.uid = u and x.card = c.id) order by random() limit 1;
      end if;
      if pick is null then
        select c.id into pick from cards c where c.rarity = 'common' and c.id <> all(picks)
          and not exists (select 1 from collection x where x.uid = u and x.card = c.id) order by random() limit 1;
      end if;
      if pick is null then
        select c.id into pick from cards c where c.rarity = 'legend' and c.id <> all(picks)
          and not exists (select 1 from collection x where x.uid = u and x.card = c.id) order by random() limit 1;
      end if;
      exit when pick is null;
      picks := picks || pick;
    end loop;
    update wallet set offers = picks where uid = u;
  end if;
  return get_state();
end $$;

create or replace function public._price(card_id text) returns int language sql stable set search_path = public as $$
  select 80 + cost * 30 + case when rarity = 'legend' then 60 else 0 end from cards where id = card_id
$$;

create or replace function public.buy_offer(card_id text) returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := _me(); w wallet; p int;
begin
  perform _roll_day(u);
  select * into w from wallet where uid = u for update;
  if w.offers is null or not (card_id = any(w.offers)) then raise exception 'card is not in today''s shop'; end if;
  if card_id = any(w.bought) or exists (select 1 from collection where uid = u and card = card_id) then raise exception 'already owned'; end if;
  p := _price(card_id);
  if w.bia < p then raise exception 'not enough cowries'; end if;
  update wallet set bia = bia - p, bought = bought || card_id where uid = u;
  insert into collection(uid, card) values (u, card_id);
  return get_state() || jsonb_build_object('got', card_id);
end $$;

-- random pack: common 86% · legend 12% · two-province 2% (two-province cards only come from here)
create or replace function public.buy_pack() returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := _me(); w wallet; roll float := random(); r text; pick text; rr text; ord text[];
begin
  select * into w from wallet where uid = u for update;
  if w.bia < 150 then raise exception 'not enough cowries'; end if;
  r := case when roll < 0.02 then 'dual' when roll < 0.14 then 'legend' else 'common' end;
  ord := case r when 'common' then array['common','legend','dual'] when 'legend' then array['legend','common','dual'] else array['dual','legend','common'] end;
  foreach rr in array ord loop pick := _random_unowned(u, rr); exit when pick is not null; end loop;
  update wallet set bia = bia - 150 where uid = u;
  if pick is null then  -- owns everything: two spares of a random card instead
    select card into pick from collection where uid = u and tier < 6 order by random() limit 1;
    if pick is null then raise exception 'collection complete'; end if;
    update collection set dup = dup + 2 where uid = u and card = pick;
    return get_state() || jsonb_build_object('got', pick, 'spares', 2);
  end if;
  insert into collection(uid, card) values (u, pick);
  return get_state() || jsonb_build_object('got', pick);
end $$;

-- spare pack: +1 spare for 3 random owned cards, 60 cowries, 3 per day
create or replace function public.buy_spares() returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := _me(); w wallet; got text[];
begin
  perform _roll_day(u);
  select * into w from wallet where uid = u for update;
  if w.bags >= 3 then raise exception 'daily limit reached'; end if;
  if w.bia < 60 then raise exception 'not enough cowries'; end if;
  select array_agg(card) into got from (select card from collection where uid = u and tier < 6 order by random() limit 3) s;
  if got is null then raise exception 'nothing to upgrade'; end if;
  update wallet set bia = bia - 60, bags = bags + 1 where uid = u;
  update collection set dup = dup + 1 where uid = u and card = any(got);
  return get_state() || jsonb_build_object('got', to_jsonb(got));
end $$;

-- ---------- upgrades: spares 1,2,3,4,5,8 · cowries 25,100,200,300,400,1500 ----------
create or replace function public.upgrade_card(card_id text) returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := _me(); c collection; need_s int; need_b int; w wallet; unlocked text;
begin
  select * into c from collection where uid = u and card = card_id for update;
  if not found then raise exception 'card not owned'; end if;
  if c.tier >= 6 then raise exception 'already max tier'; end if;
  need_s := (array[1,2,3,4,5,8])[c.tier + 1]; need_b := (array[25,100,200,300,400,1500])[c.tier + 1];
  select * into w from wallet where uid = u for update;
  if c.dup < need_s then raise exception 'not enough spares'; end if;
  if w.bia < need_b then raise exception 'not enough cowries'; end if;
  update collection set tier = tier + 1, dup = dup - need_s where uid = u and card = card_id;
  update wallet set bia = bia - need_b, cl = cl + 1 where uid = u returning * into w;
  if w.cl % 3 = 0 then  -- every 3 collection levels unlocks a random common card
    unlocked := _random_unowned(u, 'common');
    if unlocked is not null then insert into collection(uid, card) values (u, unlocked); end if;
  end if;
  return get_state() || jsonb_build_object('unlocked', unlocked);
end $$;

-- ---------- tutorial reward: 10 commons, once ----------
create or replace function public.tutorial_reward() returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := _me(); got text[];
begin
  update wallet set tut_reward = true where uid = u and tut_reward = false;
  if not found then raise exception 'reward already claimed'; end if;
  select array_agg(id) into got from (select c.id from cards c where c.rarity = 'common'
     and not exists (select 1 from collection x where x.uid = u and x.card = c.id) order by random() limit 10) s;
  insert into collection(uid, card) select u, unnest(coalesce(got, '{}'));
  return get_state() || jsonb_build_object('got', to_jsonb(coalesce(got, '{}')));
end $$;

-- ---------- matches vs AI: the client cannot be fully trusted, so gains are capped per day ----------
create or replace function public.ai_result(outcome int, stake int, cubes int, played text[]) returns jsonb language plpgsql security definer set search_path = public as $$
-- outcome: 1 win, 0 draw, -1 loss
declare u uuid := _me(); w wallet; delta int; room int; spare text; cap constant int := 400;
begin
  if stake not in (0,10,25,50,100) or cubes not in (1,2,4,8) or outcome not in (-1,0,1) then raise exception 'bad result'; end if;
  select * into w from wallet where uid = u for update;
  if w.ai_day is distinct from _today() then update wallet set ai_day = _today(), ai_gain = 0 where uid = u; w.ai_gain := 0; end if;
  if stake > 0 and w.bia < stake * 2 and outcome <> -1 then raise exception 'stake too high'; end if;
  if stake = 0 then delta := case outcome when 1 then 10 else 5 end;
  else delta := case outcome when 1 then stake * cubes when -1 then -least(w.bia, stake * cubes) else 0 end + 5; end if;
  if delta > 0 then room := greatest(0, cap - w.ai_gain); delta := least(delta, room); end if;
  update wallet set bia = greatest(0, bia + delta), ai_gain = ai_gain + greatest(delta, 0),
         wins = wins + (outcome = 1)::int, losses = losses + (outcome = -1)::int where uid = u;
  if outcome = 1 or random() < (case outcome when 0 then 0.5 else 0.25 end) then
    select card into spare from collection where uid = u and tier < 6 and card = any(coalesce(played, '{}')) order by random() limit 1;
    if spare is not null then update collection set dup = dup + 1 where uid = u and card = spare; end if;
  end if;
  return get_state() || jsonb_build_object('delta', delta, 'spare', spare, 'capped', (delta = 0 and outcome >= 0 and w.ai_gain >= cap));
end $$;

-- ---------- ranked: both players report; rewards only when both reports agree ----------
-- report = {outcome: 1|0|-1, cubes, hash (final game state), deck: [12 ids], lk: [ids with +2]}
create or replace function public._deck_ok(u uuid, rep jsonb) returns boolean language plpgsql stable security definer set search_path = public as $$
declare d text[]; l text[];
begin
  select array_agg(x) into d from jsonb_array_elements_text(rep->'deck') x;
  select array_agg(x) into l from jsonb_array_elements_text(coalesce(rep->'lk','[]'::jsonb)) x;
  if d is null or cardinality(d) <> 12 or (select count(distinct x) from unnest(d) x) <> 12 then return false; end if;
  if exists (select 1 from unnest(d) x where not exists (select 1 from collection c where c.uid = u and c.card = x)) then return false; end if;
  if exists (select 1 from unnest(coalesce(l,'{}')) x where not exists (select 1 from collection c where c.uid = u and c.card = x and c.tier >= 6)) then return false; end if;
  return true;
end $$;

create or replace function public._settle(m matches) returns text language plpgsql security definer set search_path = public as $$
declare ra jsonb := m.a_report; rb jsonb := m.b_report; oa int; ob int; cu int; oka boolean; okb boolean; sp text;
begin
  oa := (ra->>'outcome')::int; ob := (rb->>'outcome')::int; cu := (ra->>'cubes')::int;
  oka := _deck_ok(m.a, ra); okb := _deck_ok(m.b, rb);
  if ra->>'hash' is distinct from rb->>'hash' or oa <> -ob or cu is distinct from (rb->>'cubes')::int or cu not in (1,2,4,8) or not oka or not okb then
    update matches set status = 'mismatch' where id = m.id; return 'mismatch';
  end if;
  -- player a
  update wallet set rank = greatest(0, rank + oa * cu), bia = bia + case when oa = 1 then 15 else 5 end,
         wins = wins + (oa = 1)::int, losses = losses + (oa = -1)::int where uid = m.a;
  -- player b
  update wallet set rank = greatest(0, rank + ob * cu), bia = bia + case when ob = 1 then 15 else 5 end,
         wins = wins + (ob = 1)::int, losses = losses + (ob = -1)::int where uid = m.b;
  -- spare for the winner(s): a random card from their deck
  if oa >= 0 then select card into sp from collection where uid = m.a and tier < 6 and card in (select jsonb_array_elements_text(ra->'deck')) order by random() limit 1;
    if sp is not null then update collection set dup = dup + 1 where uid = m.a and card = sp; end if; end if;
  if ob >= 0 then select card into sp from collection where uid = m.b and tier < 6 and card in (select jsonb_array_elements_text(rb->'deck')) order by random() limit 1;
    if sp is not null then update collection set dup = dup + 1 where uid = m.b and card = sp; end if; end if;
  update matches set status = 'settled' where id = m.id;
  return 'settled';
end $$;

create or replace function public.report_ranked(match_id text, opponent uuid, report jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := _me(); m matches; st text;
begin
  if opponent = u then raise exception 'bad opponent'; end if;
  if length(match_id) > 80 then raise exception 'bad match id'; end if;
  insert into matches(id, a, b) values (match_id, least(u, opponent), greatest(u, opponent)) on conflict (id) do nothing;
  select * into m from matches where id = match_id for update;
  if u not in (m.a, m.b) or opponent not in (m.a, m.b) then raise exception 'not your match'; end if;
  if m.status <> 'open' then return get_state() || jsonb_build_object('match', m.status); end if;
  if u = m.a then
    if m.a_report is not null then raise exception 'already reported'; end if;
    update matches set a_report = report where id = match_id returning * into m;
  else
    if m.b_report is not null then raise exception 'already reported'; end if;
    update matches set b_report = report where id = match_id returning * into m;
  end if;
  st := 'waiting';
  if m.a_report is not null and m.b_report is not null then st := _settle(m); end if;
  return get_state() || jsonb_build_object('match', st);
end $$;

create or replace function public.match_status(match_id text) returns jsonb language plpgsql security definer set search_path = public as $$
declare u uuid := _me(); s text;
begin
  select status into s from matches where id = match_id and u in (a, b);
  return get_state() || jsonb_build_object('match', coalesce(s, 'none'));
end $$;

-- ---------- reports ----------
create or replace function public.report_player(target text, target_name text, reason text, match_id text) returns void language plpgsql security definer set search_path = public as $$
declare u uuid := _me();
begin
  if (select count(*) from reports where reporter = u and created > now() - interval '1 day') >= 20 then raise exception 'too many reports today'; end if;
  insert into reports(reporter, target, target_name, reason, match_id) values (u, left(target, 80), left(target_name, 40), left(reason, 200), left(match_id, 80));
end $$;

-- only signed-in users may call the functions; helpers stay private
revoke all on function public._roll_day(uuid), public._random_unowned(uuid,text), public._deck_ok(uuid,jsonb), public._settle(public.matches) from public, anon, authenticated;
grant execute on function public.get_state(), public.init_account(), public.claim_gift(), public.shop_offers(), public.buy_offer(text), public.buy_pack(), public.buy_spares(),
  public.upgrade_card(text), public.tutorial_reward(), public.ai_result(int,int,int,text[]), public.report_ranked(text,uuid,jsonb), public.match_status(text),
  public.report_player(text,text,text,text) to authenticated;
revoke execute on function public.get_state(), public.init_account(), public.claim_gift(), public.shop_offers(), public.buy_offer(text), public.buy_pack(), public.buy_spares(),
  public.upgrade_card(text), public.tutorial_reward(), public.ai_result(int,int,int,text[]), public.report_ranked(text,uuid,jsonb), public.match_status(text),
  public.report_player(text,text,text,text) from anon, public;

grant select on public.cards, public.wallet, public.collection, public.matches to authenticated;
grant insert on public.reports to authenticated;
grant usage, select on sequence public.reports_id_seq to authenticated;
