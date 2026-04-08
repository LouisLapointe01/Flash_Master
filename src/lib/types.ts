export type Visibility = "private" | "public" | "link_only";
export type SuggestionStatus = "pending" | "accepted" | "rejected";
export type RankedScopeType = "general" | "category";
export type ChallengeMode = "ranked" | "training";
export type ChallengeStatus = "pending" | "accepted" | "completed" | "cancelled";
export type FriendshipStatus = "pending" | "accepted" | "rejected";
export type ReviewAction = "like" | "dislike" | "modify";
export type ReviewQueueStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  block_suggestions: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deck {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  category_path: string[];
  visibility: Visibility;
  share_token: string | null;
  block_suggestions: boolean;
  original_deck_id: string | null;
  copy_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  flashcards?: Flashcard[];
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front_text: string;
  back_text: string;
  explanation: string;
  front_image_url: string | null;
  back_image_url: string | null;
  category_path: string[];
  position: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  proficiency: number;
  ease_factor: number;
  interval_days: number;
  next_review: string;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  deck_id: string;
  cards_studied: number;
  cards_correct: number;
  duration_seconds: number;
  completed_at: string;
}

export interface Quiz {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  category_path: string[];
  visibility: Visibility;
  share_token: string | null;
  block_suggestions: boolean;
  original_quiz_id: string | null;
  copy_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  quiz_questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  image_url: string | null;
  category_path: string[];
  position: number;
  created_at: string;
  quiz_answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  position: number;
}

export interface QuizSession {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  duration_seconds: number;
  completed_at: string;
}

export interface Suggestion {
  id: string;
  author_id: string;
  target_deck_id: string | null;
  target_quiz_id: string | null;
  status: SuggestionStatus;
  title: string;
  description: string;
  diff_payload: DiffPayload;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface DiffPayload {
  deck_changes?: Record<string, { old: string; new: string }>;
  modified_cards?: {
    id: string;
    changes: Record<string, { old: string; new: string }>;
  }[];
  added_cards?: Omit<Flashcard, "id" | "deck_id" | "created_at" | "updated_at">[];
  removed_card_ids?: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface RankedProfile {
  id: string;
  user_id: string;
  scope_type: RankedScopeType;
  scope_key: string;
  points: number;
  wins: number;
  losses: number;
  games_played: number;
  best_points: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface RankedMatchResult {
  id: string;
  user_id: string;
  quiz_id: string;
  scope_type: RankedScopeType;
  scope_key: string;
  points_before: number;
  points_after: number;
  delta: number;
  correct_answers: number;
  total_questions: number;
  created_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  addressee?: Profile;
}

export interface Association {
  id: string;
  created_by: string;
  slug: string;
  name: string;
  description: string;
  category_path: string[];
  created_at: string;
  updated_at: string;
}

export interface AssociationMembership {
  id: string;
  association_id: string;
  user_id: string;
  role: "member" | "admin";
  created_at: string;
  associations?: Association;
}

export interface QuizChallenge {
  id: string;
  creator_id: string;
  opponent_id: string | null;
  association_id: string | null;
  quiz_id: string;
  mode: ChallengeMode;
  status: ChallengeStatus;
  created_at: string;
  updated_at: string;
  quizzes?: Quiz;
  creator?: Profile;
  opponent?: Profile;
}

export interface QuestionReviewQueueItem {
  id: string;
  target_quiz_id: string;
  author_id: string;
  question_text: string;
  image_url: string | null;
  answers: { text: string; is_correct: boolean }[];
  category_path: string[];
  checks_required: number;
  likes: number;
  dislikes: number;
  modifications: number;
  status: ReviewQueueStatus;
  merged_question_id: string | null;
  created_at: string;
  updated_at: string;
  quizzes?: Pick<Quiz, "id" | "title" | "category" | "category_path">;
  profiles?: Profile;
}

export interface QuestionReviewVote {
  id: string;
  queue_id: string;
  reviewer_id: string;
  action: ReviewAction;
  modification_payload: Record<string, unknown>;
  created_at: string;
}
