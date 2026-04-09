# Claude Context Pack - Flash Master

Version du contexte: 2026-04-09
Portee: Vue complete du projet, architecture, conventions, et etat fonctionnel recent.

---

## 1) Resume executif

Flash Master est une plateforme d apprentissage active orientee quiz + decks + mode classe, avec une direction artistique jeu video (HUD arcade neon) et une priorite desktop.

Objectifs produit:
- progression mesurable (sessions, score, RP, tiers)
- creation de contenu (decks, quizzes)
- competition (ranked, matchmaking)
- social learning (amis, associations, challenges)
- moderation communautaire (check + suggestions)

Etat global:
- socle produit stable et riche
- infra Supabase en place (auth, db, storage, realtime)
- systeme ranked/lobby/matchmaking present en base + UI
- coverage tests utilitaires + benchmarks perf

---

## 2) Regles de lecture pour Claude

Toujours prendre en compte les fichiers de controle suivants:
- AGENTS.md: regles Next.js specifiques au projet
- CLAUDE.md: point d entree de contexte
- FRONTEND_MASTER_PROMPT.md: direction UI gameplay immersive

Important:
- Next.js est en version recente avec differences potentielles de conventions.
- Consulter les docs embarquees dans node_modules/next/dist/docs quand un doute API/behavior existe.

---

## 3) Stack et versions

Framework et runtime:
- Next.js 16.2.2 (App Router)
- React 19.2.4
- TypeScript 5 (strict)

UI:
- Tailwind CSS 4
- Framer Motion
- Lucide icons
- clsx

Data:
- Supabase (auth + postgres + storage + realtime)
- @supabase/ssr
- @supabase/supabase-js

Qualite:
- ESLint 9
- Vitest 4.1.3 (tests unitaires + bench)

Scripts principaux:
- npm run dev
- npm run build
- npm run start
- npm run lint
- npm run test
- npm run test:watch
- npm run bench
- npm run bench:run
- npm run quality:full

---

## 4) Architecture du repo (lecture rapide)

Racine:
- src/: app + composants + libs
- supabase/migrations/: schema SQL
- benchmarks/: bench utilitaires
- docs/: doc architecture complementaire
- scripts/: setup/migrate

App routes:
- src/app/(auth): login/register/forgot/callback
- src/app/(dashboard): dashboard, decks, quizzes, ranked, training, stats, social, etc.
- src/app/api/storage/upload/route.ts: upload image
- src/app/share/deck/[token], src/app/share/quiz/[token]: partage contenu
- src/app/demo/*: mode demo local

Composants:
- src/components/layout: shell, topbar, navigation, icons HUD
- src/components/lobby: launcher de modes
- src/components/flashcards, quizzes, branding, ui

Lib:
- src/lib/hooks: data loading + cache SWR + optimistic UI
- src/lib/utils: logique metier (ranked, training, matchmaking, diff, access, spaced repetition)
- src/lib/actions: actions serveur (copy, suggestions)
- src/lib/supabase: clients browser/server/middleware
- src/lib/types.ts: types domaine centraux

---

## 5) Direction UI/UX actuelle

Theme global:
- style arcade dark neon avec tokens CSS
- variables de theme dans src/app/globals.css
- support theme dark/light via data-theme sur html + localStorage

Comportement shell:
- src/components/layout/dashboard-shell.tsx
  - mode normal: app-shell + topbar HUD
  - mode arena (route contenant /play): shell minimal et focus gameplay

Topbar HUD:
- src/components/layout/topbar.tsx
  - contexte de page dynamique par route
  - toggle theme
  - rank hud (tier + elo)
  - notifications realtime
  - logout

Dashboard principal:
- src/app/(dashboard)/dashboard/page.tsx
  - lobby mode launcher au centre
  - briques rapides pour modules secondaires

Navigation iconographique:
- src/components/layout/hud-icons.tsx
  - set d icones SVG custom style HUD

---

## 6) Domain model central (types)

Fichier: src/lib/types.ts

Types cle:
- Visibility: private | public | link_only
- RankedScopeType: general | category
- LobbyMode: ranked | training
- LobbyStatus: forming | countdown | in_progress | paused | finished | cancelled
- MatchmakingStatus: searching | matched | cancelled

Interfaces principales:
- Deck, Flashcard, FlashcardProgress, StudySession
- Quiz, QuizQuestion, QuizAnswer, QuizSession
- RankedProfile, RankedMatchResult, RankedMatchQueueEntry
- GameLobby, GameLobbyPlayer, LobbyPauseEvent
- Friendship, Association, AssociationMembership, QuizChallenge
- QuestionReviewQueueItem, QuestionReviewVote

---

## 7) Base de donnees - migrations

### 7.1) 001_initial_schema.sql

Couvre le socle:
- profiles + trigger creation profile a l inscription
- decks + flashcards + flashcard_progress + study_sessions
- quizzes + questions + answers + quiz_sessions
- suggestions + notifications + storage policies
- RLS et policies de base
- trigger generique set_updated_at

### 7.2) 002_ranked_social_review_taxonomy.sql

Ajouts fonctionnels:
- category_path sur decks/quizzes/flashcards/questions
- ranked_profiles
- ranked_match_results
- friendships
- associations + memberships
- quiz_challenges
- question_review_queue + question_review_votes
- fonction apply_review_vote

### 7.3) 003_game_matchmaking_lobbies.sql

Ajouts gameplay temps reel:
- game_lobbies
- game_lobby_players
- ranked_match_queue
- lobby_pause_events

Policies et index:
- RLS sur lobbies/players/queue/pause events
- index queue scope/status, lobbies status/scope

Triggers et fonctions:
- enforce_lobby_capacity: empeche depassement max_players
- tier_index_from_key: mapping tier text -> index
- enqueue_ranked_match: insertion queue + matching + creation lobby + attachement joueurs
- cancel_ranked_queue: annule la recherche active utilisateur

Grants:
- execute sur enqueue_ranked_match et cancel_ranked_queue pour role authenticated

---

## 8) Systeme ranked (logique metier)

Fichier: src/lib/utils/ranked.ts

Constantes:
- TARGET_MATCH_DURATION_SECONDS = 900
- DEFAULT_LOBBY_MAX_PLAYERS = 30

Tiers:
- rookie, bronze, silver, gold, platinum, diamond, master, grandmaster

Fonctions majeures:
- getTierFromPoints
- getNextTier
- getTierProgress
- getAllowedOpponentTierKeys
- areTiersCompatible
- normalizeCategoryScope
- parseCategoryPath
- getRankedScopeTargets

Calcul de delta:
- computeRankedDeltaFromScore
  - composante elo (expectedScore / actualScore / k factor)
  - bonus precision
  - ajustement rythme (par rapport a duree cible)
  - penalite pauses
  - clamp delta [-95, 95]
- computeRankedDelta
  - wrapper simplifie + gainPerCorrect/lossPerWrong

---

## 9) Matchmaking (logique utilitaire pure)

Fichier: src/lib/utils/matchmaking.ts

Fonctions:
- canJoinLobby(currentPlayers, maxPlayers)
- getLobbyPauseBudgetSeconds(targetDurationSeconds)
- findBestRankedMatchCandidate(queue, target, now)

Heuristique candidate:
- filtre sur scopeType/scopeKey identiques
- filtre sur compatibilite de tier
- score fit = pointsGap - min(waitSeconds, 120)
- tri par fitScore asc, puis pointsGap asc, puis waitSeconds desc

---

## 10) Mode ranked - flux UI actuel

Fichier: src/app/(dashboard)/ranked/page.tsx

Chargement initial:
- recup user auth
- charge quizzes publics
- charge entree active de ranked_match_queue (searching ou matched)

Etat local:
- queueStatus: idle/searching/matched
- queueLobbyId
- queueScopeLabel
- queueMessage
- busyMatchmaking
- syncingQueue

Actions:
- handleJoinQueue:
  - scope general ou category selon filtre
  - appel RPC enqueue_ranked_match
  - met a jour etat queue
- handleCancelQueue:
  - appel RPC cancel_ranked_queue
  - reset etat local
- syncQueueState:
  - relit queue active
- polling auto:
  - si searching, refresh toutes les 3500ms

Navigation:
- si matched + lobby id => bouton Ouvrir le lobby vers /ranked/lobby/[lobbyId]

---

## 11) Lobby ranked - flux UI actuel

Fichier: src/app/(dashboard)/ranked/lobby/[lobbyId]/page.tsx

Chargement:
- get user auth
- lecture game_lobbies + game_lobby_players
- polling toutes les 4000ms

Actions joueur:
- handleToggleReady: update is_ready du slot joueur
- handleLeaveLobby: delete du slot joueur puis redirect /ranked
- refresh manuel

Etat derive:
- mySlot
- readyCount
- everyoneReady
- affichage statut lobby/scope/cadence

Etat actuel du demarrage de match:
- le readiness local est visible
- transition auto du lobby vers in_progress quand tous prets: pas encore implementee

---

## 12) Mode entrainement (nouveau flux)

Fichiers:
- src/lib/utils/training.ts
- src/app/(dashboard)/training/page.tsx

Logique:
- buildTrainingScopeOptions agrège les quizzes en scopes hierarchiques
- inclut un scope global
- calcule questionCount et quizCount par scope
- preserve un sampleQuizId pour lancer rapidement une session

Page training:
- charge quizzes publics + proprietaire utilisateur
- construit les scopes
- affiche liste global/categorie/sous-categorie avec volume
- bouton lancer vers /quizzes/[id]/play?mode=training&scope=...

---

## 13) Securite acces partage

Fichiers:
- src/lib/utils/access.ts
- src/app/share/deck/[token]/page.tsx
- src/app/share/quiz/[token]/page.tsx

Regles:
- owner: toujours autorise
- public: autorise
- link_only: autorise seulement avec token valide
- private: refuse pour non-owner

Tests:
- src/lib/utils/access.test.ts

---

## 14) Tests unitaires disponibles

Dossier: src/lib/utils/*.test.ts

Suites presentes:
- access.test.ts
- diff.test.ts
- matchmaking.test.ts
- ranked.test.ts
- spaced-repetition.test.ts
- training.test.ts

Notes:
- les tests matchmaking valident capacite, pause budget, et choix de meilleur candidat
- les tests ranked couvrent tiers, compatibilite, scopes, delta, bornes de securite
- les tests training couvrent aggregation de scopes et dedup

---

## 15) Benchmarks disponibles

Dossier: benchmarks/*.bench.ts

Suites presentes:
- diff.bench.ts
- matchmaking.bench.ts
- ranked.bench.ts
- spaced-repetition.bench.ts
- training.bench.ts

Config:
- vitest.config.ts exporte les resultats bench vers benchmarks/results/results.json

---

## 16) Config technique utile

next.config.ts:
- turbopack root explicite
- remotePatterns images base sur hostname Supabase + localhost

tsconfig.json:
- strict mode
- alias path @/* -> ./src/*
- moduleResolution bundler

layout global:
- src/app/layout.tsx
  - fonts Google Fraunces + Manrope
  - script inline pour charger data-theme depuis localStorage
  - DemoProvider global

---

## 17) Runbook operationnel rapide

Demarrage:
1) npm install
2) config .env.local
3) appliquer migrations 001 -> 002 -> 003
4) npm run dev

Verification:
- npm run lint
- npm run test
- npm run bench:run
- npm run quality:full

Utilitaires:
- node verify_supabase_setup.js
- node seed_content.js

---

## 18) Points d attention / dette active

Matchmaking/lobby:
- readiness visible mais pas de transition serveur automatique in_progress
- polling utilise sur ranked/lobby (realtime direct possible plus tard)

Gameplay:
- orchestration complete pre-match -> match -> post-match a finaliser
- synchronisation multi-joueurs en temps reel (state room) non finalisee

Observabilite:
- manque d instrumentation metier sur funnels ranked/training

---

## 19) Priorites recommandees (tech)

Priorite 1:
- ajouter RPC start_ranked_lobby_if_ready
- appeler cette RPC apres toggle ready et pendant sync
- verrouillage transactionnel pour eviter double demarrage

Priorite 2:
- brancher subscription realtime Supabase sur game_lobbies et game_lobby_players
- garder polling en fallback uniquement

Priorite 3:
- brancher resultat de manche vers ranked_match_results + update ranked_profiles

Priorite 4:
- tests SQL/integration pour flux queue -> lobby -> start

---

## 20) Index des fichiers cles

Produit / docs:
- README.md
- docs/GAME_ARCHITECTURE.md
- FRONTEND_MASTER_PROMPT.md

Contexte agent:
- AGENTS.md
- CLAUDE.md
- CLAUDE_CONTEXT.md

Matchmaking / ranked:
- src/app/(dashboard)/ranked/page.tsx
- src/app/(dashboard)/ranked/lobby/[lobbyId]/page.tsx
- src/lib/utils/ranked.ts
- src/lib/utils/matchmaking.ts
- supabase/migrations/003_game_matchmaking_lobbies.sql

Training:
- src/app/(dashboard)/training/page.tsx
- src/lib/utils/training.ts

UI/HUD:
- src/app/globals.css
- src/components/layout/topbar.tsx
- src/components/layout/dashboard-shell.tsx
- src/components/lobby/lobby-mode-launcher.tsx
- src/components/layout/hud-icons.tsx

Qualite:
- src/lib/utils/*.test.ts
- benchmarks/*.bench.ts
- vitest.config.ts

---

## 21) Notes de coherence produit

Le projet vise une experience premium non SaaS generic:
- desktop-first
- visuel editorial + jeu
- lobby/HUD tres visible
- eviter rendu template

Concretement, lors des evolutions UI:
- conserver la DA arcade neon
- garder les interactions rapides (hover/active nerveux)
- maintenir lisibilite gameplay sur ecrans de jeu
- ne pas reintroduire une navigation lourde en mode /play

---

## 22) Etat recent de reference (snapshot)

Ajouts majeurs recents confirmes:
- scripts test + quality full dans package.json
- migration 003 matchmaking/lobbies
- page ranked avec file et sync statut
- page lobby dediee avec ready/leave
- page training scope-driven
- refonte HUD/topbar/theme tokens
- ajout de tests utilitaires et benchmarks complementaires

Ce snapshot sert de base de travail pour toute prochaine intervention Claude.
