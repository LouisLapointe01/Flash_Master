# Flash Master

Flash Master est une plateforme d'apprentissage actif orientee deck + quiz + mode classe.
Le produit est pense pour une progression concrete: creation de contenu, revision intelligente,
competition, moderation communautaire, social learning, et pilotage par la data.

Ce README a 2 objectifs:

1. Te permettre de lancer le projet rapidement sans ambiguite.
2. Expliquer clairement la trajectoire produit: jusqu'ou on veut aller.

---

## Sommaire

- [Vision produit](#vision-produit)
- [Etat actuel](#etat-actuel)
- [Roadmap produit](#roadmap-produit)
- [Stack technique](#stack-technique)
- [Architecture du repo](#architecture-du-repo)
- [Installation locale](#installation-locale)
- [Configuration Supabase](#configuration-supabase)
- [Scripts utiles](#scripts-utiles)
- [Fonctionnement des modules](#fonctionnement-des-modules)
- [Performance](#performance)
- [Qualite, lint, build](#qualite-lint-build)
- [Deploiement](#deploiement)
- [Securite](#securite)
- [Troubleshooting](#troubleshooting)
- [Convention de contribution](#convention-de-contribution)

---

## Vision produit

Flash Master vise une experience premium desktop-first pour apprendre plus vite et mieux.

Principes directeurs:

- **Clarte cognitive**: interface lisible, hierarchie visuelle forte, zero bruit inutile.
- **Progression mesurable**: chaque session genere un signal de progression exploitable.
- **Contenu vivant**: decks et quizzes evoluent via suggestions et moderation communautaire.
- **Competition saine**: mode classe avec paliers, scopes general/categorie, et feedback explicite.
- **Social learning**: amis, associations, challenges prives ou publics.

---

## Etat actuel

Le socle fonctionnel est en place et optimise.

### Fonctionnalites implementees

- Authentification Supabase (login / register / forgot-password + callback OAuth).
- Dashboard principal avec navigation multi-modules.
- **Decks**:
  - creation, edition, lecture detail, session d'etude,
  - cartes texte + images (compression automatique),
  - categorie hierarchique (`category_path`).
- **Quizzes**:
  - creation, edition, detail, mode play,
  - score + recap,
  - mode classe et scope de classement.
- **Ranked**:
  - profils classes, points RP, tiers (Rookie → Grandmaster),
  - progression vers palier suivant,
  - historique de resultats.
- **Check communautaire**:
  - file de relecture des questions,
  - votes (`like` / `dislike` / `modify`),
  - integration auto selon seuil de checks.
- **Social**:
  - friendships, associations, challenges quiz.
- **Suggestions**:
  - proposition de diff structurel sur deck/quiz,
  - accept / refuse, notifications associees.
- **Explore**:
  - catalogue public decks/quizzes, copie de contenu.
- **Stats**:
  - sessions et precision, activite recente.
- Notifications realtime Supabase.
- Mode demo complet (routes `/demo/*` + jeu de donnees local).

### Optimisations recentes

- **Cache SWR** sur tous les hooks de donnees: zero refetch inutile lors des navigations.
- **`getSession()` au lieu de `getUser()`**: elimination d'un appel reseau (~100ms) a chaque chargement.
- **Mises a jour optimistes**: l'UI se met a jour instantanement sans attendre Supabase, revert automatique en cas d'erreur.
- **Banc de tests de performance**: benchmarks Vitest pour les 3 algorithmes critiques (SM-2, Ranked, Diff).

---

## Roadmap produit

Roadmap cible sur 4 horizons.

### Horizon A — Stabilisation produit (court terme)

- Durcir les flows critiques (auth, upload, creation contenu).
- Uniformiser les validations et erreurs user-facing.
- Couvrir les paths sensibles avec tests E2E smoke.
- Finaliser l'optimisation image + perf percue.

### Horizon B — Intelligence pedagogique (moyen terme)

- Recommandations de revision personnalisees.
- Planification de sessions adaptatives (niveau / temps / disponibilite).
- Suggestions de contenu auto-assistees par IA (question bank, distractors).
- Dashboard de retention et oubli prevu.

### Horizon C — Ecosysteme communautaire (moyen/long terme)

- Ligues classees et saisons.
- Templates d'associations (ecoles, cohortes, equipes).
- Moderation avancee (roles, quorum, anti-abus).
- Marketplace de packs pedagogiques verifies.

### Horizon D — Plateforme complete (long terme)

- Companion mobile natif (iOS/Android) avec mode offline.
- Session live multi-joueurs (salle, timer synchronise, classement live).
- API publique pour editeurs/integrations externes.
- Moteur analytics decisionnel (LTV learning, predictive success).

Definition de succes global:

- produit stable, fiable, rapide,
- progression utilisateur objectivable,
- catalogue communautaire de qualite,
- engagement social durable,
- boucle creation → moderation → diffusion totalement fluide.

---

## Stack technique

| Categorie | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 + Framer Motion |
| Data / Auth / Storage / Realtime | Supabase |
| Cache client | SWR |
| Benchmarks | Vitest |
| Lint | ESLint 9 |

---

## Architecture du repo

```text
flash-master/
  src/
    app/
      (auth)/             # Login, register, forgot-password, callback
      (dashboard)/        # Toutes les pages protegees
        check/
        dashboard/
        decks/
        explore/
        notifications/
        quizzes/
        ranked/
        settings/
        social/
        stats/
        suggestions/
      api/
        storage/upload/   # Upload images
      demo/               # Mode demo sans auth
      share/              # Partage public via token
    components/
      branding/           # Logo Flash Master
      flashcards/         # DeckForm, FlashcardForm, StudyCard
      illustrations/      # Illustrations CAPI (ambient, illustrations)
      layout/             # Sidebar, Topbar, BottomDockNav, Shell, Transitions
      quizzes/            # QuizForm, QuestionForm, QuizCard
      suggestions/        # DiffViewer
      ui/                 # Primitives (Button, Input, Textarea)
      explore/            # Catalogue public
      notifications/      # Centre de notifications
      stats/              # Composants statistiques
    lib/
      actions/            # Server actions (copy, suggestions)
      demo/               # Donnees et contexte demo
      hooks/
        use-decks.ts      # Decks + cache SWR + mises a jour optimistes
        use-flashcards.ts # CRUD flashcards + upload images
        use-quizzes.ts    # Quizzes + cache SWR + mises a jour optimistes
      supabase/           # Client, middleware, serveur
      utils/
        diff.ts           # Algorithme de diff structurel deck/quiz
        image-compression.ts
        ranked.ts         # Calcul tiers, delta RP, scopes
        spaced-repetition.ts  # Algorithme SM-2
        storage-upload.ts
      types.ts            # Types TypeScript partages
  supabase/
    migrations/
      001_initial_schema.sql
      002_ranked_social_review_taxonomy.sql
  benchmarks/             # Banc de tests de performance Vitest
    diff.bench.ts
    ranked.bench.ts
    spaced-repetition.bench.ts
    results/              # Resultats JSON des benchmarks
  scripts/
    migrate.mjs
    setup.mjs
  seed_content.js
  verify_supabase_setup.js
  vitest.config.ts
```

---

## Installation locale

### Prerequis

- Node.js 20+
- npm 10+
- Un projet Supabase actif

### 1) Installer les dependances

```bash
npm install
```

### 2) Configurer les variables d'environnement

Creer un fichier `.env.local` a la racine:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3) Appliquer les migrations SQL

Executer dans le SQL Editor Supabase, dans cet ordre:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_ranked_social_review_taxonomy.sql`

### 4) Lancer l'app

```bash
npm run dev
```

Application locale: `http://localhost:3000`

---

## Configuration Supabase

### Verification rapide

```bash
node verify_supabase_setup.js
```

Le script verifie:

- presence des variables env,
- acces aux tables principales,
- buckets storage,
- presence eventuelle d'un utilisateur de reference.

### Seed de contenu public

```bash
node seed_content.js
```

Ce script injecte des decks/quizzes generiques multi-categories pour enrichir le catalogue.

---

## Scripts utiles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de developpement local |
| `npm run build` | Build production Next.js |
| `npm run start` | Lancer le build de prod |
| `npm run lint` | Lint ESLint |
| `npm run bench` | Benchmarks de performance en mode watch |
| `npm run bench:run` | Benchmarks de performance (execution unique) |
| `node verify_supabase_setup.js` | Verifier env + DB + buckets |
| `node seed_content.js` | Injecter du contenu seed |

Notes:

- `scripts/migrate.mjs` est un helper d'instruction manuelle pour migration SQL.
- `scripts/setup.mjs` existe pour bootstrap mais ne doit pas etre utilise en production sans audit securite.

---

## Fonctionnement des modules

### 1) Decks

- Creation/edition de deck et cartes.
- Session d'etude avec algorithme SM-2 (spaced repetition).
- Support images sur recto/verso avec compression automatique.
- Cache SWR: les decks sont charges une seule fois et mis en cache.

### 2) Quizzes

- Authoring questions/reponses (QCM).
- Mode play rapide avec feedback immediat.
- Session en mode normal ou ranked.
- Cache SWR identique aux decks.

### 3) Ranked

- Classement global + par categorie.
- 8 tiers: Rookie → Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster.
- Delta RP calcule a chaque session selon les bonnes/mauvaises reponses et le niveau actuel.
- Progression vers palier suivant avec barre de progression.

### 4) Check communautaire

- Soumission de questions en file d'attente.
- Vote pair review (`like` / `dislike` / `modify`).
- Merge automatique selon seuil de checks requis.

### 5) Social

- Gestion des amis (invitations, acceptation, rejet).
- Groupes/associations avec roles (member/admin).
- Challenges de quiz (ranked ou training).

### 6) Suggestions

- Diff structurel sur deck/quiz (titre, description, cartes ajoutees/modifiees/supprimees).
- Flux recu/envoye.
- Accept/refuse + notifications automatiques.

### 7) Explore

- Recherche et decouverte de contenu public.
- Copie de deck/quiz vers espace personnel.

### 8) Stats

- KPI de progression (sessions, precision, streaks).
- Historique de sessions.
- Activite recente.

---

## Performance

### Algorithmes critiques

Les 3 algorithmes metiers ont ete benchmarkes avec Vitest:

| Algorithme | Performance cle |
|---|---|
| SM-2 (spaced repetition) | ~3M ops/s par carte, ~40K ops/s pour 100 cartes |
| Ranked (tiers, delta RP) | ~15-21M ops/s — negligeable en temps CPU |
| Diff deck/quiz | ~900K ops/s (5 cartes) → ~25K ops/s (200 cartes) — lineaire O(n) |

Lancer les benchmarks:

```bash
npm run bench:run
```

### Optimisations reseau

- **Cache SWR**: les listes de decks/quizzes sont mises en cache cote client. La navigation aller-retour ne declenche aucune requete Supabase supplementaire.
- **`getSession()` vs `getUser()`**: la session est lue depuis le cache local (~0ms) au lieu d'un appel reseau (~100ms).
- **Mises a jour optimistes**: les mutations (creation, modification, suppression) mettent a jour l'interface immediatement, sans attendre la confirmation Supabase. En cas d'erreur, l'etat est automatiquement restaure.

Le vrai goulot d'etranglement de l'application reste les requetes Supabase (~50-500ms). Ces optimisations reduisent le nombre de requetes et masquent leur latence.

---

## Qualite, lint, build

Validation minimum avant merge:

```bash
npm run lint
npm run build
```

Objectif CI cible:

- lint: 0 erreur
- typescript: 0 erreur
- build: success

---

## Deploiement

### Option recommandee

- Frontend: Vercel
- Backend/data: Supabase

### Etapes

1. Configurer les variables env dans Vercel.
2. Verifier que les migrations sont appliquees en prod.
3. Lancer un build de verification.
4. Monitorer logs auth/api/storage apres release.

---

## Securite

Regles essentielles:

- Ne jamais exposer la `SUPABASE_SERVICE_ROLE_KEY` cote client.
- Ne jamais committer de credentials hardcodes.
- Maintenir les policies RLS comme source de verite d'autorisation.
- Auditer regulierement les routes server/actions et uploads.

---

## Troubleshooting

### Build casse sur des types

- Verifier les contrats dans `src/lib/types.ts`.
- Verifier les fixtures demo (`src/lib/demo/data.ts`).
- Verifier les payloads intermediaires (`src/lib/utils/diff.ts`).

### Upload image ne fonctionne pas

- Verifier les buckets `avatars` et `card-images` dans Supabase Storage.
- Verifier `SUPABASE_SERVICE_ROLE_KEY`.
- Verifier les policies storage si personnalisees.

### Login / callback echoue

- Verifier l'URL de callback auth Supabase.
- Verifier la route `(auth)/auth/callback`.
- Verifier la coherence entre `NEXT_PUBLIC_SUPABASE_URL` et la cle anon.

### Les donnees ne se rechargent pas apres modification

- Le cache SWR est configure avec `revalidateOnFocus: false`.
- Pour forcer un rechargement manuel, appeler `fetchDecks()` ou `fetchQuizzes()`.
- En cas de probleme de cache, vider le localStorage du navigateur.

---

## Convention de contribution

Avant PR:

1. Faire des commits atomiques (objectif clair par commit).
2. Inclure contexte produit dans le message de PR.
3. Fournir preuve `lint + build`.
4. Documenter tout changement schema/db.

Style de dev:

- Priorite a la lisibilite.
- Zero regression fonctionnelle.
- UI premium desktop-first, non generique.

---

## Statut

Projet en acceleration active.

Le socle est suffisamment solide pour scaler vers:

- un vrai moteur d'apprentissage adaptatif,
- un ecosysteme social de competition/collaboration,
- une plateforme pedagogique complete multi-surfaces.
