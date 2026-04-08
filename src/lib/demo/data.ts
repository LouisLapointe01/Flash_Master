import type { Deck, Flashcard, Quiz, QuizQuestion, QuizAnswer, StudySession, QuizSession, Notification, Profile } from "@/lib/types";

export const DEMO_USER_ID = "demo-user-00000000-0000-0000-0000-000000000001";

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  display_name: "Utilisateur Démo",
  avatar_url: null,
  block_suggestions: false,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

export const DEMO_FLASHCARDS: Flashcard[] = [
  { id: "fc-1", deck_id: "deck-1", front_text: "Bonjour", back_text: "Hello", explanation: "Salutation courante", front_image_url: null, back_image_url: null, category_path: ["Langues", "Anglais"], position: 0, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "fc-2", deck_id: "deck-1", front_text: "Merci", back_text: "Thank you", explanation: "Remerciement", front_image_url: null, back_image_url: null, category_path: ["Langues", "Anglais"], position: 1, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "fc-3", deck_id: "deck-1", front_text: "Au revoir", back_text: "Goodbye", explanation: "", front_image_url: null, back_image_url: null, category_path: ["Langues", "Anglais"], position: 2, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "fc-4", deck_id: "deck-1", front_text: "S'il vous plaît", back_text: "Please", explanation: "Forme de politesse", front_image_url: null, back_image_url: null, category_path: ["Langues", "Anglais"], position: 3, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "fc-5", deck_id: "deck-1", front_text: "Excusez-moi", back_text: "Excuse me", explanation: "", front_image_url: null, back_image_url: null, category_path: ["Langues", "Anglais"], position: 4, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },

  { id: "fc-6", deck_id: "deck-2", front_text: "H₂O", back_text: "Eau (dihydrogène monoxyde)", explanation: "2 atomes d'hydrogène + 1 atome d'oxygène", front_image_url: null, back_image_url: null, category_path: ["Sciences", "Chimie"], position: 0, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "fc-7", deck_id: "deck-2", front_text: "NaCl", back_text: "Chlorure de sodium (sel)", explanation: "Sel de table", front_image_url: null, back_image_url: null, category_path: ["Sciences", "Chimie"], position: 1, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "fc-8", deck_id: "deck-2", front_text: "CO₂", back_text: "Dioxyde de carbone", explanation: "Gaz à effet de serre", front_image_url: null, back_image_url: null, category_path: ["Sciences", "Chimie"], position: 2, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "fc-9", deck_id: "deck-2", front_text: "Fe", back_text: "Fer (numéro atomique 26)", explanation: "Métal de transition", front_image_url: null, back_image_url: null, category_path: ["Sciences", "Chimie"], position: 3, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },

  { id: "fc-10", deck_id: "deck-3", front_text: "1789", back_text: "Révolution française", explanation: "Prise de la Bastille le 14 juillet", front_image_url: null, back_image_url: null, category_path: ["Histoire", "Dates"], position: 0, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "fc-11", deck_id: "deck-3", front_text: "1492", back_text: "Découverte de l'Amérique", explanation: "Christophe Colomb", front_image_url: null, back_image_url: null, category_path: ["Histoire", "Dates"], position: 1, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
  { id: "fc-12", deck_id: "deck-3", front_text: "1945", back_text: "Fin de la Seconde Guerre mondiale", explanation: "Capitulation de l'Allemagne nazie", front_image_url: null, back_image_url: null, category_path: ["Histoire", "Dates"], position: 2, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z" },
];

export const DEMO_DECKS: Deck[] = [
  {
    id: "deck-1", owner_id: DEMO_USER_ID, title: "Français → Anglais", description: "Expressions courantes du quotidien",
    tags: ["français", "anglais", "A2"], category: "Langues", category_path: ["Langues", "Anglais"], visibility: "public", share_token: "demo-share-1",
    block_suggestions: false, original_deck_id: null, copy_count: 12,
    created_at: "2025-01-01T00:00:00Z", updated_at: "2025-03-15T00:00:00Z",
    flashcards: DEMO_FLASHCARDS.filter((f) => f.deck_id === "deck-1"),
    profiles: DEMO_PROFILE,
  },
  {
    id: "deck-2", owner_id: DEMO_USER_ID, title: "Chimie — Formules", description: "Les formules chimiques essentielles",
    tags: ["chimie", "sciences"], category: "Sciences", category_path: ["Sciences", "Chimie"], visibility: "private", share_token: null,
    block_suggestions: false, original_deck_id: null, copy_count: 0,
    created_at: "2025-02-01T00:00:00Z", updated_at: "2025-03-20T00:00:00Z",
    flashcards: DEMO_FLASHCARDS.filter((f) => f.deck_id === "deck-2"),
    profiles: DEMO_PROFILE,
  },
  {
    id: "deck-3", owner_id: DEMO_USER_ID, title: "Dates historiques", description: "Les dates clés de l'histoire",
    tags: ["histoire", "dates"], category: "Histoire", category_path: ["Histoire", "Dates"], visibility: "public", share_token: "demo-share-3",
    block_suggestions: false, original_deck_id: null, copy_count: 5,
    created_at: "2025-03-01T00:00:00Z", updated_at: "2025-03-25T00:00:00Z",
    flashcards: DEMO_FLASHCARDS.filter((f) => f.deck_id === "deck-3"),
    profiles: DEMO_PROFILE,
  },
];

const quizAnswers: QuizAnswer[] = [
  { id: "qa-1", question_id: "qq-1", answer_text: "Paris", is_correct: true, position: 0 },
  { id: "qa-2", question_id: "qq-1", answer_text: "Lyon", is_correct: false, position: 1 },
  { id: "qa-3", question_id: "qq-1", answer_text: "Marseille", is_correct: false, position: 2 },
  { id: "qa-4", question_id: "qq-1", answer_text: "Toulouse", is_correct: false, position: 3 },

  { id: "qa-5", question_id: "qq-2", answer_text: "Jupiter", is_correct: true, position: 0 },
  { id: "qa-6", question_id: "qq-2", answer_text: "Saturne", is_correct: false, position: 1 },
  { id: "qa-7", question_id: "qq-2", answer_text: "Neptune", is_correct: false, position: 2 },
  { id: "qa-8", question_id: "qq-2", answer_text: "Uranus", is_correct: false, position: 3 },

  { id: "qa-9", question_id: "qq-3", answer_text: "Oxygène", is_correct: false, position: 0 },
  { id: "qa-10", question_id: "qq-3", answer_text: "Azote", is_correct: true, position: 1 },
  { id: "qa-11", question_id: "qq-3", answer_text: "Hydrogène", is_correct: false, position: 2 },
  { id: "qa-12", question_id: "qq-3", answer_text: "Carbone", is_correct: false, position: 3 },

  { id: "qa-13", question_id: "qq-4", answer_text: "Léonard de Vinci", is_correct: true, position: 0 },
  { id: "qa-14", question_id: "qq-4", answer_text: "Michel-Ange", is_correct: false, position: 1 },
  { id: "qa-15", question_id: "qq-4", answer_text: "Raphaël", is_correct: false, position: 2 },
  { id: "qa-16", question_id: "qq-4", answer_text: "Botticelli", is_correct: false, position: 3 },
];

const quizQuestions: QuizQuestion[] = [
  { id: "qq-1", quiz_id: "quiz-1", question_text: "Quelle est la capitale de la France ?", image_url: null, category_path: ["Divers", "Culture générale"], position: 0, created_at: "2025-01-01T00:00:00Z", quiz_answers: quizAnswers.filter((a) => a.question_id === "qq-1") },
  { id: "qq-2", quiz_id: "quiz-1", question_text: "Quelle est la plus grande planète du système solaire ?", image_url: null, category_path: ["Divers", "Culture générale"], position: 1, created_at: "2025-01-01T00:00:00Z", quiz_answers: quizAnswers.filter((a) => a.question_id === "qq-2") },
  { id: "qq-3", quiz_id: "quiz-1", question_text: "Quel gaz compose principalement l'atmosphère terrestre ?", image_url: null, category_path: ["Divers", "Culture générale"], position: 2, created_at: "2025-01-01T00:00:00Z", quiz_answers: quizAnswers.filter((a) => a.question_id === "qq-3") },
  { id: "qq-4", quiz_id: "quiz-1", question_text: "Qui a peint la Joconde ?", image_url: null, category_path: ["Divers", "Culture générale"], position: 3, created_at: "2025-01-01T00:00:00Z", quiz_answers: quizAnswers.filter((a) => a.question_id === "qq-4") },
];

export const DEMO_QUIZZES: Quiz[] = [
  {
    id: "quiz-1", owner_id: DEMO_USER_ID, title: "Culture générale", description: "Testez vos connaissances générales !",
    tags: ["culture", "général"], category: "Divers", category_path: ["Divers", "Culture générale"], visibility: "public", share_token: "demo-quiz-1",
    block_suggestions: false, original_quiz_id: null, copy_count: 8,
    created_at: "2025-02-15T00:00:00Z", updated_at: "2025-03-20T00:00:00Z",
    quiz_questions: quizQuestions,
    profiles: DEMO_PROFILE,
  },
];

export const DEMO_STUDY_SESSIONS: StudySession[] = [
  { id: "ss-1", user_id: DEMO_USER_ID, deck_id: "deck-1", cards_studied: 5, cards_correct: 4, duration_seconds: 180, completed_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: "ss-2", user_id: DEMO_USER_ID, deck_id: "deck-2", cards_studied: 4, cards_correct: 3, duration_seconds: 150, completed_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "ss-3", user_id: DEMO_USER_ID, deck_id: "deck-1", cards_studied: 5, cards_correct: 5, duration_seconds: 120, completed_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "ss-4", user_id: DEMO_USER_ID, deck_id: "deck-3", cards_studied: 3, cards_correct: 2, duration_seconds: 90, completed_at: new Date(Date.now() - 86400000 * 5).toISOString() },
];

export const DEMO_QUIZ_SESSIONS: QuizSession[] = [
  { id: "qs-1", user_id: DEMO_USER_ID, quiz_id: "quiz-1", score: 3, total_questions: 4, duration_seconds: 120, completed_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: "qs-2", user_id: DEMO_USER_ID, quiz_id: "quiz-1", score: 4, total_questions: 4, duration_seconds: 95, completed_at: new Date(Date.now() - 86400000 * 4).toISOString() },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "notif-1", user_id: DEMO_USER_ID, type: "deck_copied", title: "Deck copié", body: "Marie a copié votre deck \"Français → Anglais\"", data: {}, read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "notif-2", user_id: DEMO_USER_ID, type: "suggestion_received", title: "Nouvelle suggestion", body: "Pierre a soumis une suggestion pour \"Chimie — Formules\"", data: {}, read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "notif-3", user_id: DEMO_USER_ID, type: "suggestion_accepted", title: "Suggestion acceptée", body: "Votre suggestion pour \"Dates historiques\" a été acceptée !", data: {}, read: true, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
];
