-- ============================================
-- 004: Monetization, Admin Roles & Content Sync
-- ============================================

-- 1. Extend Profiles for Monetization and Roles
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'admin');
  end if;
end $$;

alter table public.profiles 
  add column if not exists role public.user_role not null default 'user',
  add column if not exists is_premium boolean not null default false,
  add column if not exists action_points integer not null default 50,
  add column if not exists last_points_refresh timestamptz not null default now();

-- 2. Link Decks and Quizzes for Syncing
alter table public.decks add column if not exists linked_quiz_id uuid references public.quizzes(id) on delete set null;
alter table public.quizzes add column if not exists linked_deck_id uuid references public.decks(id) on delete set null;

-- 3. Sync Trigger: Quiz Question -> Flashcard
create or replace function public.sync_quiz_question_to_flashcard()
returns trigger
language plpgsql
security definer
as $$
declare
  v_deck_id uuid;
begin
  -- Find linked deck
  select linked_deck_id into v_deck_id
  from public.quizzes
  where id = new.quiz_id;

  if v_deck_id is not null then
    insert into public.flashcards (deck_id, front_text, back_text, position)
    values (v_deck_id, new.question_text, 'Réponse à définir (depuis Quiz)', new.position);
  end if;
  
  return new;
end;
$$;

drop trigger if exists trg_sync_quiz_question_to_flashcard on public.quiz_questions;
create trigger trg_sync_quiz_question_to_flashcard
  after insert on public.quiz_questions
  for each row execute function public.sync_quiz_question_to_flashcard();

-- 4. Sync Trigger: Flashcard -> Quiz Question
create or replace function public.sync_flashcard_to_quiz_question()
returns trigger
language plpgsql
security definer
as $$
declare
  v_quiz_id uuid;
  v_question_id uuid;
begin
  -- Find linked quiz
  select linked_quiz_id into v_quiz_id
  from public.decks
  where id = new.deck_id;

  if v_quiz_id is not null then
    insert into public.quiz_questions (quiz_id, question_text, position)
    values (v_quiz_id, new.front_text, new.position)
    returning id into v_question_id;

    -- Add a default correct answer from the back of the flashcard
    insert into public.quiz_answers (question_id, answer_text, is_correct, position)
    values (v_question_id, new.back_text, true, 0);
  end if;
  
  return new;
end;
$$;

drop trigger if exists trg_sync_flashcard_to_quiz_question on public.flashcards;
create trigger trg_sync_flashcard_to_quiz_question
  after insert on public.flashcards
  for each row execute function public.sync_flashcard_to_quiz_question();

-- 5. RLS for Admin
create policy "Admins can do everything"
  on public.profiles
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
