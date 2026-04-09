-- ============================================
-- Game architecture: matchmaking + lobbies
-- ============================================

create table if not exists public.game_lobbies (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('ranked', 'training')),
  status text not null default 'forming' check (status in ('forming', 'countdown', 'in_progress', 'paused', 'finished', 'cancelled')),
  scope_type text not null check (scope_type in ('general', 'category')),
  scope_key text not null,
  max_players integer not null default 30 check (max_players between 2 and 30),
  target_duration_seconds integer not null default 900 check (target_duration_seconds between 300 and 3600),
  pause_budget_seconds integer not null default 90 check (pause_budget_seconds between 0 and 240),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz
);

alter table public.game_lobbies enable row level security;

drop policy if exists "Users can create game lobbies" on public.game_lobbies;
create policy "Users can create game lobbies"
  on public.game_lobbies for insert
  with check (auth.uid() = created_by);

drop policy if exists "Owners can update game lobbies" on public.game_lobbies;
create policy "Owners can update game lobbies"
  on public.game_lobbies for update
  using (auth.uid() = created_by);

create index if not exists idx_game_lobbies_status_scope
  on public.game_lobbies(status, scope_type, scope_key, created_at desc);

create table if not exists public.game_lobby_players (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.game_lobbies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  points_snapshot integer not null default 1000,
  tier_key text not null,
  is_ready boolean not null default false,
  joined_at timestamptz not null default now(),
  unique (lobby_id, user_id)
);

alter table public.game_lobby_players enable row level security;

drop policy if exists "Users can view lobby players they belong to" on public.game_lobby_players;
create policy "Users can view lobby players they belong to"
  on public.game_lobby_players for select
  using (auth.uid() = user_id);

drop policy if exists "Users can join lobbies as themselves" on public.game_lobby_players;
create policy "Users can join lobbies as themselves"
  on public.game_lobby_players for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can leave own lobby slot" on public.game_lobby_players;
create policy "Users can leave own lobby slot"
  on public.game_lobby_players for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can update own readiness" on public.game_lobby_players;
create policy "Users can update own readiness"
  on public.game_lobby_players for update
  using (auth.uid() = user_id);

drop policy if exists "Users can view related game lobbies" on public.game_lobbies;
create policy "Users can view related game lobbies"
  on public.game_lobbies for select
  using (
    auth.uid() = created_by
    or exists (
      select 1
      from public.game_lobby_players p
      where p.lobby_id = game_lobbies.id
        and p.user_id = auth.uid()
    )
  );

create index if not exists idx_game_lobby_players_lobby
  on public.game_lobby_players(lobby_id, joined_at asc);

create index if not exists idx_game_lobby_players_user
  on public.game_lobby_players(user_id, joined_at desc);

create or replace function public.enforce_lobby_capacity()
returns trigger
language plpgsql
security definer
as $$
declare
  v_max_players integer;
  v_current_count integer;
begin
  select max_players
  into v_max_players
  from public.game_lobbies
  where id = new.lobby_id
  for update;

  if v_max_players is null then
    raise exception 'Lobby introuvable: %', new.lobby_id;
  end if;

  select count(*)
  into v_current_count
  from public.game_lobby_players
  where lobby_id = new.lobby_id;

  if v_current_count >= v_max_players then
    raise exception 'Lobby plein (% joueurs max)', v_max_players;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_lobby_capacity on public.game_lobby_players;
create trigger trg_enforce_lobby_capacity
  before insert on public.game_lobby_players
  for each row execute function public.enforce_lobby_capacity();

create table if not exists public.ranked_match_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  scope_type text not null check (scope_type in ('general', 'category')),
  scope_key text not null,
  points_snapshot integer not null default 1000,
  tier_key text not null,
  status text not null default 'searching' check (status in ('searching', 'matched', 'cancelled')),
  matched_lobby_id uuid references public.game_lobbies(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ranked_match_queue enable row level security;

drop policy if exists "Users can view own queue entries" on public.ranked_match_queue;
create policy "Users can view own queue entries"
  on public.ranked_match_queue for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own queue entries" on public.ranked_match_queue;
create policy "Users can create own queue entries"
  on public.ranked_match_queue for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own queue entries" on public.ranked_match_queue;
create policy "Users can update own queue entries"
  on public.ranked_match_queue for update
  using (auth.uid() = user_id);

create unique index if not exists idx_ranked_match_queue_unique_search
  on public.ranked_match_queue(user_id)
  where status = 'searching';

create index if not exists idx_ranked_match_queue_scope_status
  on public.ranked_match_queue(scope_type, scope_key, status, created_at asc);

create table if not exists public.lobby_pause_events (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.game_lobbies(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  reason text not null default '',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer not null default 0
);

alter table public.lobby_pause_events enable row level security;

drop policy if exists "Users can view pause events from their lobbies" on public.lobby_pause_events;
create policy "Users can view pause events from their lobbies"
  on public.lobby_pause_events for select
  using (
    exists (
      select 1
      from public.game_lobby_players p
      where p.lobby_id = lobby_pause_events.lobby_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create pause events in their lobbies" on public.lobby_pause_events;
create policy "Users can create pause events in their lobbies"
  on public.lobby_pause_events for insert
  with check (
    auth.uid() = requested_by
    and exists (
      select 1
      from public.game_lobby_players p
      where p.lobby_id = lobby_pause_events.lobby_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update own pause events" on public.lobby_pause_events;
create policy "Users can update own pause events"
  on public.lobby_pause_events for update
  using (auth.uid() = requested_by);

create index if not exists idx_lobby_pause_events_lobby_started
  on public.lobby_pause_events(lobby_id, started_at desc);

create or replace function public.tier_index_from_key(p_tier_key text)
returns integer
language sql
immutable
as $$
  select case lower(coalesce(p_tier_key, 'rookie'))
    when 'rookie' then 0
    when 'bronze' then 1
    when 'silver' then 2
    when 'gold' then 3
    when 'platinum' then 4
    when 'diamond' then 5
    when 'master' then 6
    when 'grandmaster' then 7
    else 0
  end;
$$;

create or replace function public.enqueue_ranked_match(
  p_scope_type text default 'general',
  p_scope_key text default 'general',
  p_max_players integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_scope_type text;
  v_scope_key text;
  v_points integer := 1000;
  v_tier_key text := 'rookie';
  v_queue_id uuid;
  v_lobby_id uuid;
  v_candidate ranked_match_queue%rowtype;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifie';
  end if;

  v_scope_type := case when lower(coalesce(p_scope_type, 'general')) = 'category' then 'category' else 'general' end;
  v_scope_key := lower(trim(coalesce(p_scope_key, 'general')));
  if v_scope_key = '' then v_scope_key := 'general'; end if;
  if v_scope_type = 'general' then v_scope_key := 'general'; end if;

  select rp.points
  into v_points
  from public.ranked_profiles rp
  where rp.user_id = v_user_id
    and rp.scope_type = v_scope_type
    and rp.scope_key = v_scope_key
  limit 1;

  if v_points is null then
    select rp.points
    into v_points
    from public.ranked_profiles rp
    where rp.user_id = v_user_id
      and rp.scope_type = 'general'
      and rp.scope_key = 'general'
    limit 1;
  end if;

  if v_points is null then
    v_points := 1000;
  end if;

  v_tier_key := case
    when v_points >= 3500 then 'grandmaster'
    when v_points >= 2850 then 'master'
    when v_points >= 2300 then 'diamond'
    when v_points >= 1850 then 'platinum'
    when v_points >= 1450 then 'gold'
    when v_points >= 1100 then 'silver'
    when v_points >= 800 then 'bronze'
    else 'rookie'
  end;

  update public.ranked_match_queue
  set status = 'cancelled', updated_at = now()
  where user_id = v_user_id
    and status = 'searching';

  insert into public.ranked_match_queue (
    user_id,
    scope_type,
    scope_key,
    points_snapshot,
    tier_key,
    status
  ) values (
    v_user_id,
    v_scope_type,
    v_scope_key,
    v_points,
    v_tier_key,
    'searching'
  )
  returning id into v_queue_id;

  select q.*
  into v_candidate
  from public.ranked_match_queue q
  where q.status = 'searching'
    and q.user_id <> v_user_id
    and q.scope_type = v_scope_type
    and q.scope_key = v_scope_key
    and abs(public.tier_index_from_key(q.tier_key) - public.tier_index_from_key(v_tier_key)) <= 1
  order by abs(q.points_snapshot - v_points) asc, q.created_at asc
  limit 1
  for update skip locked;

  if found then
    insert into public.game_lobbies (
      mode,
      status,
      scope_type,
      scope_key,
      max_players,
      target_duration_seconds,
      pause_budget_seconds,
      created_by
    ) values (
      'ranked',
      'forming',
      v_scope_type,
      v_scope_key,
      least(greatest(coalesce(p_max_players, 30), 2), 30),
      900,
      90,
      v_user_id
    )
    returning id into v_lobby_id;

    insert into public.game_lobby_players (lobby_id, user_id, points_snapshot, tier_key, is_ready)
    values
      (v_lobby_id, v_user_id, v_points, v_tier_key, false),
      (v_lobby_id, v_candidate.user_id, v_candidate.points_snapshot, v_candidate.tier_key, false);

    update public.ranked_match_queue
    set status = 'matched', matched_lobby_id = v_lobby_id, updated_at = now()
    where id in (v_queue_id, v_candidate.id);

    return jsonb_build_object(
      'status', 'matched',
      'queue_id', v_queue_id,
      'lobby_id', v_lobby_id,
      'opponent_user_id', v_candidate.user_id,
      'scope_type', v_scope_type,
      'scope_key', v_scope_key
    );
  end if;

  return jsonb_build_object(
    'status', 'searching',
    'queue_id', v_queue_id,
    'scope_type', v_scope_type,
    'scope_key', v_scope_key
  );
end;
$$;

create or replace function public.cancel_ranked_queue()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_updated integer := 0;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifie';
  end if;

  update public.ranked_match_queue
  set status = 'cancelled', updated_at = now()
  where user_id = v_user_id
    and status = 'searching';

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

grant execute on function public.enqueue_ranked_match(text, text, integer) to authenticated;
grant execute on function public.cancel_ranked_queue() to authenticated;
