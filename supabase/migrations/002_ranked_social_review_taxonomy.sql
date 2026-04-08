-- ============================================
-- Ranked, Social, Community Check, Taxonomy
-- ============================================

-- Multi-level categories support
alter table if exists public.decks
  add column if not exists category_path text[] not null default '{}';

alter table if exists public.quizzes
  add column if not exists category_path text[] not null default '{}';

alter table if exists public.flashcards
  add column if not exists category_path text[] not null default '{}';

alter table if exists public.quiz_questions
  add column if not exists category_path text[] not null default '{}';

-- ============================================
-- RANKED PROFILES
-- ============================================
create table if not exists public.ranked_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  scope_type text not null check (scope_type in ('general', 'category')),
  scope_key text not null,
  points integer not null default 1000,
  wins integer not null default 0,
  losses integer not null default 0,
  games_played integer not null default 0,
  best_points integer not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, scope_type, scope_key)
);

alter table public.ranked_profiles enable row level security;

drop policy if exists "Anyone can view ranked profiles" on public.ranked_profiles;
create policy "Anyone can view ranked profiles"
  on public.ranked_profiles for select using (true);

drop policy if exists "Users can insert own ranked profiles" on public.ranked_profiles;
create policy "Users can insert own ranked profiles"
  on public.ranked_profiles for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own ranked profiles" on public.ranked_profiles;
create policy "Users can update own ranked profiles"
  on public.ranked_profiles for update using (auth.uid() = user_id);

create index if not exists idx_ranked_profiles_scope_points
  on public.ranked_profiles(scope_type, scope_key, points desc);

create index if not exists idx_ranked_profiles_user
  on public.ranked_profiles(user_id);

-- ============================================
-- RANKED MATCH RESULTS
-- ============================================
create table if not exists public.ranked_match_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  scope_type text not null check (scope_type in ('general', 'category')),
  scope_key text not null,
  points_before integer not null,
  points_after integer not null,
  delta integer not null,
  correct_answers integer not null,
  total_questions integer not null,
  created_at timestamptz not null default now()
);

alter table public.ranked_match_results enable row level security;

drop policy if exists "Users can view own ranked results" on public.ranked_match_results;
create policy "Users can view own ranked results"
  on public.ranked_match_results for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own ranked results" on public.ranked_match_results;
create policy "Users can insert own ranked results"
  on public.ranked_match_results for insert with check (auth.uid() = user_id);

create index if not exists idx_ranked_match_results_user_created
  on public.ranked_match_results(user_id, created_at desc);

create index if not exists idx_ranked_match_results_scope_created
  on public.ranked_match_results(scope_type, scope_key, created_at desc);

-- ============================================
-- FRIENDSHIPS
-- ============================================
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

alter table public.friendships enable row level security;

drop policy if exists "Users can view related friendships" on public.friendships;
create policy "Users can view related friendships"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "Users can create friendship requests" on public.friendships;
create policy "Users can create friendship requests"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

drop policy if exists "Users can update related friendships" on public.friendships;
create policy "Users can update related friendships"
  on public.friendships for update
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "Users can delete related friendships" on public.friendships;
create policy "Users can delete related friendships"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create index if not exists idx_friendships_requester on public.friendships(requester_id);
create index if not exists idx_friendships_addressee on public.friendships(addressee_id);

-- ============================================
-- ASSOCIATIONS
-- ============================================
create table if not exists public.associations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text not null default '',
  category_path text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.associations enable row level security;

drop policy if exists "Anyone can view associations" on public.associations;
create policy "Anyone can view associations"
  on public.associations for select using (true);

drop policy if exists "Users can create associations" on public.associations;
create policy "Users can create associations"
  on public.associations for insert with check (auth.uid() = created_by);

drop policy if exists "Owners can update associations" on public.associations;
create policy "Owners can update associations"
  on public.associations for update using (auth.uid() = created_by);

create table if not exists public.association_memberships (
  id uuid primary key default gen_random_uuid(),
  association_id uuid not null references public.associations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  unique (association_id, user_id)
);

alter table public.association_memberships enable row level security;

drop policy if exists "Anyone can view association memberships" on public.association_memberships;
create policy "Anyone can view association memberships"
  on public.association_memberships for select using (true);

drop policy if exists "Users can join associations" on public.association_memberships;
create policy "Users can join associations"
  on public.association_memberships for insert with check (auth.uid() = user_id);

drop policy if exists "Users can leave associations" on public.association_memberships;
create policy "Users can leave associations"
  on public.association_memberships for delete using (auth.uid() = user_id);

create index if not exists idx_associations_slug on public.associations(slug);
create index if not exists idx_association_memberships_user on public.association_memberships(user_id);

create or replace function public.handle_association_owner_membership()
returns trigger as $$
begin
  insert into public.association_memberships (association_id, user_id, role)
  values (new.id, new.created_by, 'admin')
  on conflict (association_id, user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_association_created on public.associations;
create trigger on_association_created
  after insert on public.associations
  for each row execute function public.handle_association_owner_membership();

-- ============================================
-- CHALLENGES (RANKED/TRAINING)
-- ============================================
create table if not exists public.quiz_challenges (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  opponent_id uuid references public.profiles(id) on delete set null,
  association_id uuid references public.associations(id) on delete set null,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  mode text not null check (mode in ('ranked', 'training')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (opponent_id is null or opponent_id <> creator_id)
);

alter table public.quiz_challenges enable row level security;

drop policy if exists "Users can view visible challenges" on public.quiz_challenges;
create policy "Users can view visible challenges"
  on public.quiz_challenges for select
  using (
    auth.uid() = creator_id
    or auth.uid() = opponent_id
    or (
      association_id is not null
      and exists (
        select 1 from public.association_memberships m
        where m.association_id = quiz_challenges.association_id
          and m.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Users can create own challenges" on public.quiz_challenges;
create policy "Users can create own challenges"
  on public.quiz_challenges for insert with check (auth.uid() = creator_id);

drop policy if exists "Users can update own or targeted challenges" on public.quiz_challenges;
create policy "Users can update own or targeted challenges"
  on public.quiz_challenges for update
  using (auth.uid() = creator_id or auth.uid() = opponent_id);

create index if not exists idx_quiz_challenges_creator on public.quiz_challenges(creator_id, created_at desc);
create index if not exists idx_quiz_challenges_opponent on public.quiz_challenges(opponent_id, created_at desc);
create index if not exists idx_quiz_challenges_status on public.quiz_challenges(status);

-- ============================================
-- QUESTION REVIEW QUEUE (50 checks)
-- ============================================
create table if not exists public.question_review_queue (
  id uuid primary key default gen_random_uuid(),
  target_quiz_id uuid not null references public.quizzes(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  question_text text not null,
  image_url text,
  answers jsonb not null default '[]'::jsonb,
  category_path text[] not null default '{}',
  checks_required integer not null default 50,
  likes integer not null default 0,
  dislikes integer not null default 0,
  modifications integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  merged_question_id uuid references public.quiz_questions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.question_review_queue enable row level security;

drop policy if exists "Anyone can view review queue" on public.question_review_queue;
create policy "Anyone can view review queue"
  on public.question_review_queue for select using (true);

drop policy if exists "Users can submit review queue items" on public.question_review_queue;
create policy "Users can submit review queue items"
  on public.question_review_queue for insert with check (auth.uid() = author_id);

drop policy if exists "Authors can update pending queue items" on public.question_review_queue;
create policy "Authors can update pending queue items"
  on public.question_review_queue for update
  using (auth.uid() = author_id and status = 'pending');

create table if not exists public.question_review_votes (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references public.question_review_queue(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('like', 'dislike', 'modify')),
  modification_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (queue_id, reviewer_id)
);

alter table public.question_review_votes enable row level security;

drop policy if exists "Anyone can view review votes" on public.question_review_votes;
create policy "Anyone can view review votes"
  on public.question_review_votes for select using (true);

drop policy if exists "Users can vote once per queue item" on public.question_review_votes;
create policy "Users can vote once per queue item"
  on public.question_review_votes for insert with check (auth.uid() = reviewer_id);

drop policy if exists "Users can update own review vote" on public.question_review_votes;
create policy "Users can update own review vote"
  on public.question_review_votes for update using (auth.uid() = reviewer_id);

create index if not exists idx_question_review_queue_status_created
  on public.question_review_queue(status, created_at asc);

create index if not exists idx_question_review_votes_queue
  on public.question_review_votes(queue_id);

create or replace function public.apply_review_vote(
  p_queue_id uuid,
  p_action text,
  p_modification_payload jsonb default '{}'::jsonb
)
returns public.question_review_queue
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_queue public.question_review_queue;
  v_likes integer;
  v_dislikes integer;
  v_modifications integer;
  v_total integer;
  v_new_question_id uuid;
  v_next_position integer;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Utilisateur non authentifie';
  end if;

  if p_action not in ('like', 'dislike', 'modify') then
    raise exception 'Action invalide: %', p_action;
  end if;

  select *
  into v_queue
  from public.question_review_queue
  where id = p_queue_id
  for update;

  if not found then
    raise exception 'Question de revue introuvable';
  end if;

  if v_queue.status <> 'pending' then
    return v_queue;
  end if;

  insert into public.question_review_votes (queue_id, reviewer_id, action, modification_payload)
  values (p_queue_id, v_user_id, p_action, coalesce(p_modification_payload, '{}'::jsonb))
  on conflict (queue_id, reviewer_id)
  do update set
    action = excluded.action,
    modification_payload = excluded.modification_payload,
    created_at = now();

  select
    count(*) filter (where action = 'like'),
    count(*) filter (where action = 'dislike'),
    count(*) filter (where action = 'modify')
  into v_likes, v_dislikes, v_modifications
  from public.question_review_votes
  where queue_id = p_queue_id;

  update public.question_review_queue
  set
    likes = coalesce(v_likes, 0),
    dislikes = coalesce(v_dislikes, 0),
    modifications = coalesce(v_modifications, 0),
    updated_at = now()
  where id = p_queue_id;

  select *
  into v_queue
  from public.question_review_queue
  where id = p_queue_id;

  v_total := v_queue.likes + v_queue.dislikes + v_queue.modifications;

  if v_total >= v_queue.checks_required then
    if v_queue.likes >= v_queue.dislikes then
      select coalesce(max(position), -1) + 1
      into v_next_position
      from public.quiz_questions
      where quiz_id = v_queue.target_quiz_id;

      insert into public.quiz_questions (
        quiz_id,
        question_text,
        image_url,
        position,
        category_path
      )
      values (
        v_queue.target_quiz_id,
        v_queue.question_text,
        v_queue.image_url,
        v_next_position,
        v_queue.category_path
      )
      returning id into v_new_question_id;

      insert into public.quiz_answers (question_id, answer_text, is_correct, position)
      select
        v_new_question_id,
        coalesce(answer_item->>'text', ''),
        coalesce((answer_item->>'is_correct')::boolean, false),
        row_number() over () - 1
      from jsonb_array_elements(v_queue.answers) as answer_item;

      update public.question_review_queue
      set
        status = 'approved',
        merged_question_id = v_new_question_id,
        updated_at = now()
      where id = p_queue_id;
    else
      update public.question_review_queue
      set
        status = 'rejected',
        updated_at = now()
      where id = p_queue_id;
    end if;
  end if;

  return (
    select q
    from public.question_review_queue q
    where q.id = p_queue_id
  );
end;
$$;

grant execute on function public.apply_review_vote(uuid, text, jsonb) to authenticated;

-- ============================================
-- UPDATED_AT TRIGGERS (new tables)
-- ============================================
drop trigger if exists set_ranked_profiles_updated_at on public.ranked_profiles;
create trigger set_ranked_profiles_updated_at before update on public.ranked_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_friendships_updated_at on public.friendships;
create trigger set_friendships_updated_at before update on public.friendships
  for each row execute function public.set_updated_at();

drop trigger if exists set_associations_updated_at on public.associations;
create trigger set_associations_updated_at before update on public.associations
  for each row execute function public.set_updated_at();

drop trigger if exists set_quiz_challenges_updated_at on public.quiz_challenges;
create trigger set_quiz_challenges_updated_at before update on public.quiz_challenges
  for each row execute function public.set_updated_at();

drop trigger if exists set_question_review_queue_updated_at on public.question_review_queue;
create trigger set_question_review_queue_updated_at before update on public.question_review_queue
  for each row execute function public.set_updated_at();
