-- ============================================
-- 005: Social presence + lobby invitations services
-- ============================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'presence_status') then
    create type public.presence_status as enum ('online', 'dnd', 'offline');
  end if;
end $$;

create table if not exists public.user_presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status public.presence_status not null default 'offline',
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_presence enable row level security;

drop policy if exists "Users can view friend presence" on public.user_presence;
create policy "Users can view friend presence"
  on public.user_presence for select
  using (
    auth.uid() is not null
    and (
      auth.uid() = user_id
      or exists (
        select 1
        from public.friendships f
        where f.status = 'accepted'
          and (
            (f.requester_id = auth.uid() and f.addressee_id = user_presence.user_id)
            or (f.addressee_id = auth.uid() and f.requester_id = user_presence.user_id)
          )
      )
    )
  );

drop policy if exists "Users can insert own presence" on public.user_presence;
create policy "Users can insert own presence"
  on public.user_presence for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own presence" on public.user_presence;
create policy "Users can update own presence"
  on public.user_presence for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_user_presence_status_seen
  on public.user_presence(status, last_seen_at desc);

create table if not exists public.lobby_invitations (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.game_lobbies(id) on delete cascade,
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz,
  check (inviter_id <> invitee_id)
);

alter table public.lobby_invitations enable row level security;

drop policy if exists "Users can view related lobby invitations" on public.lobby_invitations;
create policy "Users can view related lobby invitations"
  on public.lobby_invitations for select
  using (auth.uid() = inviter_id or auth.uid() = invitee_id);

drop policy if exists "Users can create lobby invitations" on public.lobby_invitations;
create policy "Users can create lobby invitations"
  on public.lobby_invitations for insert
  with check (
    auth.uid() = inviter_id
    and exists (
      select 1
      from public.game_lobby_players p
      where p.lobby_id = lobby_invitations.lobby_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update related lobby invitations" on public.lobby_invitations;
create policy "Users can update related lobby invitations"
  on public.lobby_invitations for update
  using (auth.uid() = inviter_id or auth.uid() = invitee_id)
  with check (auth.uid() = inviter_id or auth.uid() = invitee_id);

create index if not exists idx_lobby_invitations_invitee_status
  on public.lobby_invitations(invitee_id, status, created_at desc);

create index if not exists idx_lobby_invitations_lobby_status
  on public.lobby_invitations(lobby_id, status, created_at desc);

create unique index if not exists idx_lobby_invitations_unique_pending
  on public.lobby_invitations(lobby_id, invitee_id)
  where status = 'pending';

drop trigger if exists set_friendships_updated_at on public.friendships;
create trigger set_friendships_updated_at
  before update on public.friendships
  for each row execute function public.set_updated_at();

drop trigger if exists set_user_presence_updated_at on public.user_presence;
create trigger set_user_presence_updated_at
  before update on public.user_presence
  for each row execute function public.set_updated_at();

drop trigger if exists set_lobby_invitations_updated_at on public.lobby_invitations;
create trigger set_lobby_invitations_updated_at
  before update on public.lobby_invitations
  for each row execute function public.set_updated_at();

create or replace function public.set_my_presence(
  p_status text default 'online'
)
returns public.user_presence
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_status public.presence_status;
  v_row public.user_presence;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifie';
  end if;

  if lower(trim(coalesce(p_status, 'online'))) not in ('online', 'dnd', 'offline') then
    raise exception 'Presence invalide';
  end if;

  v_status := lower(trim(coalesce(p_status, 'online')))::public.presence_status;

  insert into public.user_presence (user_id, status, last_seen_at, updated_at)
  values (v_user_id, v_status, now(), now())
  on conflict (user_id)
  do update set
    status = excluded.status,
    last_seen_at = now(),
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.send_friend_request_by_display_name(
  p_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_target_id uuid;
  v_target_name text;
  v_friendship_id uuid;
  v_sender_name text;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifie';
  end if;

  select p.id, p.display_name
  into v_target_id, v_target_name
  from public.profiles p
  where lower(trim(coalesce(p.display_name, ''))) = lower(trim(coalesce(p_display_name, '')))
  order by p.updated_at desc
  limit 1;

  if v_target_id is null then
    return jsonb_build_object('status', 'not_found');
  end if;

  if v_target_id = v_user_id then
    return jsonb_build_object('status', 'self');
  end if;

  if exists (
    select 1
    from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = v_user_id and f.addressee_id = v_target_id)
        or (f.requester_id = v_target_id and f.addressee_id = v_user_id)
      )
  ) then
    return jsonb_build_object('status', 'already_friends', 'target_user_id', v_target_id, 'target_display_name', v_target_name);
  end if;

  update public.friendships f
  set status = 'accepted', updated_at = now()
  where f.requester_id = v_target_id
    and f.addressee_id = v_user_id
    and f.status = 'pending'
  returning f.id into v_friendship_id;

  if v_friendship_id is not null then
    insert into public.notifications (user_id, type, title, body, data)
    values (
      v_target_id,
      'friend_request_accepted',
      'Demande acceptee',
      'Ta demande d''ami a ete acceptee.',
      jsonb_build_object('friendship_id', v_friendship_id, 'friend_id', v_user_id)
    );

    return jsonb_build_object('status', 'auto_accepted', 'friendship_id', v_friendship_id, 'target_user_id', v_target_id, 'target_display_name', v_target_name);
  end if;

  select f.id
  into v_friendship_id
  from public.friendships f
  where f.requester_id = v_user_id
    and f.addressee_id = v_target_id
    and f.status = 'pending'
  limit 1;

  if v_friendship_id is not null then
    return jsonb_build_object('status', 'already_pending', 'friendship_id', v_friendship_id, 'target_user_id', v_target_id, 'target_display_name', v_target_name);
  end if;

  insert into public.friendships (requester_id, addressee_id, status)
  values (v_user_id, v_target_id, 'pending')
  on conflict (requester_id, addressee_id)
  do update set
    status = 'pending',
    updated_at = now()
  returning id into v_friendship_id;

  select p.display_name
  into v_sender_name
  from public.profiles p
  where p.id = v_user_id;

  insert into public.notifications (user_id, type, title, body, data)
  values (
    v_target_id,
    'friend_request',
    'Nouvelle demande d''ami',
    format('%s veut t''ajouter en ami.', coalesce(v_sender_name, 'Un joueur')),
    jsonb_build_object('friendship_id', v_friendship_id, 'requester_id', v_user_id)
  );

  return jsonb_build_object('status', 'pending', 'friendship_id', v_friendship_id, 'target_user_id', v_target_id, 'target_display_name', v_target_name);
end;
$$;

create or replace function public.respond_friend_request(
  p_friendship_id uuid,
  p_accept boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_friendship public.friendships%rowtype;
  v_new_status text;
  v_responder_name text;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifie';
  end if;

  select *
  into v_friendship
  from public.friendships f
  where f.id = p_friendship_id
    and f.addressee_id = v_user_id
  for update;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if v_friendship.status <> 'pending' then
    return jsonb_build_object('status', 'already_processed', 'friendship_status', v_friendship.status);
  end if;

  v_new_status := case when coalesce(p_accept, false) then 'accepted' else 'rejected' end;

  update public.friendships
  set status = v_new_status,
      updated_at = now()
  where id = v_friendship.id;

  select p.display_name
  into v_responder_name
  from public.profiles p
  where p.id = v_user_id;

  insert into public.notifications (user_id, type, title, body, data)
  values (
    v_friendship.requester_id,
    case when v_new_status = 'accepted' then 'friend_request_accepted' else 'friend_request_rejected' end,
    case when v_new_status = 'accepted' then 'Demande acceptee' else 'Demande refusee' end,
    case
      when v_new_status = 'accepted'
        then format('%s a accepte ta demande d''ami.', coalesce(v_responder_name, 'Un joueur'))
      else format('%s a refuse ta demande d''ami.', coalesce(v_responder_name, 'Un joueur'))
    end,
    jsonb_build_object('friendship_id', v_friendship.id, 'responder_id', v_user_id)
  );

  return jsonb_build_object('status', v_new_status, 'friendship_id', v_friendship.id);
end;
$$;

create or replace function public.invite_friend_to_lobby(
  p_lobby_id uuid,
  p_friend_user_id uuid,
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_lobby public.game_lobbies%rowtype;
  v_invitation_id uuid;
  v_presence_status public.presence_status;
  v_presence_last_seen timestamptz;
  v_inviter_name text;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifie';
  end if;

  if p_friend_user_id is null or p_friend_user_id = v_user_id then
    return jsonb_build_object('status', 'invalid_target');
  end if;

  select *
  into v_lobby
  from public.game_lobbies l
  where l.id = p_lobby_id
  for update;

  if not found then
    return jsonb_build_object('status', 'lobby_not_found');
  end if;

  if not exists (
    select 1
    from public.game_lobby_players p
    where p.lobby_id = p_lobby_id
      and p.user_id = v_user_id
  ) then
    return jsonb_build_object('status', 'not_member');
  end if;

  if v_lobby.status <> 'forming' then
    return jsonb_build_object('status', 'lobby_locked');
  end if;

  if exists (
    select 1
    from public.game_lobby_players p
    where p.lobby_id = p_lobby_id
      and p.user_id = p_friend_user_id
  ) then
    return jsonb_build_object('status', 'already_in_lobby');
  end if;

  if not exists (
    select 1
    from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = v_user_id and f.addressee_id = p_friend_user_id)
        or (f.requester_id = p_friend_user_id and f.addressee_id = v_user_id)
      )
  ) then
    return jsonb_build_object('status', 'not_friend');
  end if;

  select up.status, up.last_seen_at
  into v_presence_status, v_presence_last_seen
  from public.user_presence up
  where up.user_id = p_friend_user_id;

  if v_presence_status is null then
    return jsonb_build_object('status', 'friend_offline');
  end if;

  if v_presence_status = 'dnd' then
    return jsonb_build_object('status', 'friend_dnd');
  end if;

  if v_presence_status = 'offline' or coalesce(v_presence_last_seen, to_timestamp(0)) < now() - interval '3 minutes' then
    return jsonb_build_object('status', 'friend_offline');
  end if;

  select li.id
  into v_invitation_id
  from public.lobby_invitations li
  where li.lobby_id = p_lobby_id
    and li.invitee_id = p_friend_user_id
    and li.status = 'pending'
  limit 1;

  if v_invitation_id is not null then
    return jsonb_build_object('status', 'already_pending', 'invitation_id', v_invitation_id);
  end if;

  insert into public.lobby_invitations (lobby_id, inviter_id, invitee_id, status, note)
  values (p_lobby_id, v_user_id, p_friend_user_id, 'pending', trim(coalesce(p_note, '')))
  returning id into v_invitation_id;

  select p.display_name
  into v_inviter_name
  from public.profiles p
  where p.id = v_user_id;

  insert into public.notifications (user_id, type, title, body, data)
  values (
    p_friend_user_id,
    'lobby_invite',
    'Invitation lobby',
    format('%s t''invite dans un lobby.', coalesce(v_inviter_name, 'Un joueur')),
    jsonb_build_object(
      'lobby_id', p_lobby_id,
      'invitation_id', v_invitation_id,
      'inviter_id', v_user_id
    )
  );

  return jsonb_build_object('status', 'invited', 'invitation_id', v_invitation_id, 'lobby_id', p_lobby_id);
end;
$$;

create or replace function public.respond_lobby_invitation(
  p_invitation_id uuid,
  p_accept boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_invitation public.lobby_invitations%rowtype;
  v_lobby public.game_lobbies%rowtype;
  v_player_count integer;
  v_points integer := 1000;
  v_tier_key text := 'rookie';
  v_invitee_name text;
begin
  if v_user_id is null then
    raise exception 'Utilisateur non authentifie';
  end if;

  select *
  into v_invitation
  from public.lobby_invitations li
  where li.id = p_invitation_id
    and li.invitee_id = v_user_id
  for update;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if v_invitation.status <> 'pending' then
    return jsonb_build_object('status', 'already_processed', 'invitation_status', v_invitation.status, 'lobby_id', v_invitation.lobby_id);
  end if;

  if not coalesce(p_accept, false) then
    update public.lobby_invitations
    set status = 'declined',
        responded_at = now(),
        updated_at = now()
    where id = v_invitation.id;

    select p.display_name
    into v_invitee_name
    from public.profiles p
    where p.id = v_user_id;

    insert into public.notifications (user_id, type, title, body, data)
    values (
      v_invitation.inviter_id,
      'lobby_invite_declined',
      'Invitation refusee',
      format('%s a refuse ton invitation de lobby.', coalesce(v_invitee_name, 'Un joueur')),
      jsonb_build_object('lobby_id', v_invitation.lobby_id, 'invitation_id', v_invitation.id)
    );

    return jsonb_build_object('status', 'declined', 'lobby_id', v_invitation.lobby_id);
  end if;

  select *
  into v_lobby
  from public.game_lobbies l
  where l.id = v_invitation.lobby_id
  for update;

  if not found then
    update public.lobby_invitations
    set status = 'expired',
        responded_at = now(),
        updated_at = now()
    where id = v_invitation.id;

    return jsonb_build_object('status', 'lobby_missing');
  end if;

  if v_lobby.status <> 'forming' then
    update public.lobby_invitations
    set status = 'expired',
        responded_at = now(),
        updated_at = now()
    where id = v_invitation.id;

    return jsonb_build_object('status', 'expired', 'lobby_id', v_lobby.id);
  end if;

  if exists (
    select 1
    from public.game_lobby_players p
    where p.lobby_id = v_lobby.id
      and p.user_id = v_user_id
  ) then
    update public.lobby_invitations
    set status = 'accepted',
        responded_at = now(),
        updated_at = now()
    where id = v_invitation.id;

    return jsonb_build_object('status', 'accepted', 'lobby_id', v_lobby.id);
  end if;

  select count(*)
  into v_player_count
  from public.game_lobby_players p
  where p.lobby_id = v_lobby.id;

  if v_player_count >= v_lobby.max_players then
    update public.lobby_invitations
    set status = 'expired',
        responded_at = now(),
        updated_at = now()
    where id = v_invitation.id;

    return jsonb_build_object('status', 'lobby_full', 'lobby_id', v_lobby.id);
  end if;

  select rp.points
  into v_points
  from public.ranked_profiles rp
  where rp.user_id = v_user_id
    and rp.scope_type = 'general'
    and rp.scope_key = 'general'
  limit 1;

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

  insert into public.game_lobby_players (lobby_id, user_id, points_snapshot, tier_key, is_ready)
  values (v_lobby.id, v_user_id, v_points, v_tier_key, false)
  on conflict (lobby_id, user_id) do nothing;

  update public.lobby_invitations
  set status = 'accepted',
      responded_at = now(),
      updated_at = now()
  where id = v_invitation.id;

  select p.display_name
  into v_invitee_name
  from public.profiles p
  where p.id = v_user_id;

  insert into public.notifications (user_id, type, title, body, data)
  values (
    v_invitation.inviter_id,
    'lobby_invite_accepted',
    'Invitation acceptee',
    format('%s a rejoint le lobby.', coalesce(v_invitee_name, 'Un joueur')),
    jsonb_build_object('lobby_id', v_lobby.id, 'invitation_id', v_invitation.id)
  );

  return jsonb_build_object('status', 'accepted', 'lobby_id', v_lobby.id);
end;
$$;

grant execute on function public.set_my_presence(text) to authenticated;
grant execute on function public.send_friend_request_by_display_name(text) to authenticated;
grant execute on function public.respond_friend_request(uuid, boolean) to authenticated;
grant execute on function public.invite_friend_to_lobby(uuid, uuid, text) to authenticated;
grant execute on function public.respond_lobby_invitation(uuid, boolean) to authenticated;