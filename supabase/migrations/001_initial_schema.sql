-- ============================================
-- Flash_Master — Complete Database Schema
-- ============================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ============================================
-- PROFILES
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  block_suggestions boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view any profile"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- DECKS
-- ============================================
create table public.decks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  category text not null default '',
  visibility text not null default 'private' check (visibility in ('private', 'public', 'link_only')),
  share_token text unique,
  block_suggestions boolean not null default false,
  original_deck_id uuid references public.decks(id) on delete set null,
  copy_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.decks enable row level security;

create policy "Owner can do anything with own decks"
  on public.decks for all using (auth.uid() = owner_id);

create policy "Anyone can view public decks"
  on public.decks for select using (visibility = 'public');

create policy "Anyone can view link_only decks by token"
  on public.decks for select using (visibility = 'link_only' and share_token is not null);

-- ============================================
-- FLASHCARDS
-- ============================================
create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  front_text text not null default '',
  back_text text not null default '',
  explanation text not null default '',
  front_image_url text,
  back_image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.flashcards enable row level security;

create policy "Users can manage flashcards of own decks"
  on public.flashcards for all
  using (exists (select 1 from public.decks where decks.id = flashcards.deck_id and decks.owner_id = auth.uid()));

create policy "Anyone can view flashcards of public decks"
  on public.flashcards for select
  using (exists (select 1 from public.decks where decks.id = flashcards.deck_id and decks.visibility = 'public'));

create policy "Anyone can view flashcards of link_only decks"
  on public.flashcards for select
  using (exists (select 1 from public.decks where decks.id = flashcards.deck_id and decks.visibility = 'link_only'));

-- ============================================
-- FLASHCARD PROGRESS
-- ============================================
create table public.flashcard_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  proficiency integer not null default 0 check (proficiency between 0 and 10),
  ease_factor real not null default 2.5,
  interval_days integer not null default 0,
  next_review timestamptz not null default now(),
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, flashcard_id)
);

alter table public.flashcard_progress enable row level security;

create policy "Users can manage own progress"
  on public.flashcard_progress for all using (auth.uid() = user_id);

-- ============================================
-- STUDY SESSIONS
-- ============================================
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  deck_id uuid not null references public.decks(id) on delete cascade,
  cards_studied integer not null default 0,
  cards_correct integer not null default 0,
  duration_seconds integer not null default 0,
  completed_at timestamptz not null default now()
);

alter table public.study_sessions enable row level security;

create policy "Users can manage own study sessions"
  on public.study_sessions for all using (auth.uid() = user_id);

-- ============================================
-- QUIZZES
-- ============================================
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  category text not null default '',
  visibility text not null default 'private' check (visibility in ('private', 'public', 'link_only')),
  share_token text unique,
  block_suggestions boolean not null default false,
  original_quiz_id uuid references public.quizzes(id) on delete set null,
  copy_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quizzes enable row level security;

create policy "Owner can do anything with own quizzes"
  on public.quizzes for all using (auth.uid() = owner_id);

create policy "Anyone can view public quizzes"
  on public.quizzes for select using (visibility = 'public');

create policy "Anyone can view link_only quizzes by token"
  on public.quizzes for select using (visibility = 'link_only' and share_token is not null);

-- ============================================
-- QUIZ QUESTIONS
-- ============================================
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null default '',
  image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.quiz_questions enable row level security;

create policy "Users can manage questions of own quizzes"
  on public.quiz_questions for all
  using (exists (select 1 from public.quizzes where quizzes.id = quiz_questions.quiz_id and quizzes.owner_id = auth.uid()));

create policy "Anyone can view questions of public quizzes"
  on public.quiz_questions for select
  using (exists (select 1 from public.quizzes where quizzes.id = quiz_questions.quiz_id and quizzes.visibility = 'public'));

create policy "Anyone can view questions of link_only quizzes"
  on public.quiz_questions for select
  using (exists (select 1 from public.quizzes where quizzes.id = quiz_questions.quiz_id and quizzes.visibility = 'link_only'));

-- ============================================
-- QUIZ ANSWERS
-- ============================================
create table public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  answer_text text not null default '',
  is_correct boolean not null default false,
  position integer not null default 0
);

alter table public.quiz_answers enable row level security;

create policy "Users can manage answers of own quiz questions"
  on public.quiz_answers for all
  using (exists (
    select 1 from public.quiz_questions q
    join public.quizzes qz on qz.id = q.quiz_id
    where q.id = quiz_answers.question_id and qz.owner_id = auth.uid()
  ));

create policy "Anyone can view answers of public quiz questions"
  on public.quiz_answers for select
  using (exists (
    select 1 from public.quiz_questions q
    join public.quizzes qz on qz.id = q.quiz_id
    where q.id = quiz_answers.question_id and qz.visibility = 'public'
  ));

create policy "Anyone can view answers of link_only quiz questions"
  on public.quiz_answers for select
  using (exists (
    select 1 from public.quiz_questions q
    join public.quizzes qz on qz.id = q.quiz_id
    where q.id = quiz_answers.question_id and qz.visibility = 'link_only'
  ));

-- ============================================
-- QUIZ SESSIONS
-- ============================================
create table public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null default 0,
  total_questions integer not null default 0,
  duration_seconds integer not null default 0,
  completed_at timestamptz not null default now()
);

alter table public.quiz_sessions enable row level security;

create policy "Users can manage own quiz sessions"
  on public.quiz_sessions for all using (auth.uid() = user_id);

-- ============================================
-- SUGGESTIONS
-- ============================================
create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  target_deck_id uuid references public.decks(id) on delete cascade,
  target_quiz_id uuid references public.quizzes(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  title text not null default '',
  description text not null default '',
  diff_payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (target_deck_id is not null and target_quiz_id is null) or
    (target_deck_id is null and target_quiz_id is not null)
  )
);

alter table public.suggestions enable row level security;

create policy "Authors can manage own suggestions"
  on public.suggestions for all using (auth.uid() = author_id);

create policy "Deck owners can view suggestions for their decks"
  on public.suggestions for select
  using (exists (select 1 from public.decks where decks.id = suggestions.target_deck_id and decks.owner_id = auth.uid()));

create policy "Deck owners can update suggestions for their decks"
  on public.suggestions for update
  using (exists (select 1 from public.decks where decks.id = suggestions.target_deck_id and decks.owner_id = auth.uid()));

create policy "Quiz owners can view suggestions for their quizzes"
  on public.suggestions for select
  using (exists (select 1 from public.quizzes where quizzes.id = suggestions.target_quiz_id and quizzes.owner_id = auth.uid()));

create policy "Quiz owners can update suggestions for their quizzes"
  on public.suggestions for update
  using (exists (select 1 from public.quizzes where quizzes.id = suggestions.target_quiz_id and quizzes.owner_id = auth.uid()));

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null default '',
  data jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can manage own notifications"
  on public.notifications for all using (auth.uid() = user_id);

-- Enable realtime for notifications
alter publication supabase_realtime add table public.notifications;

-- ============================================
-- INDEXES
-- ============================================
create index idx_decks_owner on public.decks(owner_id);
create index idx_decks_visibility on public.decks(visibility) where visibility = 'public';
create index idx_decks_share_token on public.decks(share_token) where share_token is not null;
create index idx_flashcards_deck on public.flashcards(deck_id);
create index idx_flashcard_progress_user on public.flashcard_progress(user_id);
create index idx_flashcard_progress_next_review on public.flashcard_progress(user_id, next_review);
create index idx_study_sessions_user on public.study_sessions(user_id);
create index idx_quizzes_owner on public.quizzes(owner_id);
create index idx_quizzes_visibility on public.quizzes(visibility) where visibility = 'public';
create index idx_quiz_questions_quiz on public.quiz_questions(quiz_id);
create index idx_quiz_sessions_user on public.quiz_sessions(user_id);
create index idx_suggestions_target_deck on public.suggestions(target_deck_id) where target_deck_id is not null;
create index idx_suggestions_target_quiz on public.suggestions(target_quiz_id) where target_quiz_id is not null;
create index idx_notifications_user_unread on public.notifications(user_id) where read = false;

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_decks_updated_at before update on public.decks
  for each row execute function public.set_updated_at();
create trigger set_flashcards_updated_at before update on public.flashcards
  for each row execute function public.set_updated_at();
create trigger set_flashcard_progress_updated_at before update on public.flashcard_progress
  for each row execute function public.set_updated_at();
create trigger set_quizzes_updated_at before update on public.quizzes
  for each row execute function public.set_updated_at();
create trigger set_suggestions_updated_at before update on public.suggestions
  for each row execute function public.set_updated_at();
