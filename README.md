# Flash Master

Flash Master est une plateforme d'apprentissage active orientee deck + quiz + mode classe.
Le produit est pense pour une progression concrete: creation de contenu, revision intelligente,
competition, moderation communautaire, social learning, et pilotage par la data.

Ce README a 2 objectifs:

1. Te permettre de lancer le projet rapidement sans ambiguite.
2. Expliquer clairement la trajectoire produit: jusqu'ou on veut aller.

---

## Sommaire

- [Vision produit](#vision-produit)
- [Etat actuel](#etat-actuel)
- [Roadmap produit (jusquou-on-va)](#roadmap-produit-jusquou-on-va)
- [Stack technique](#stack-technique)
- [Architecture du repo](#architecture-du-repo)
- [Installation locale](#installation-locale)
- [Configuration Supabase](#configuration-supabase)
- [Scripts utiles](#scripts-utiles)
- [Fonctionnement des modules](#fonctionnement-des-modules)
- [Qualite, lint, build](#qualite-lint-build)
- [Deploiement](#deploiement)
- [Securite](#securite)
- [Troubleshooting](#troubleshooting)
- [Convention de contribution](#convention-de-contribution)

---

## Vision produit

Flash Master vise une experience premium desktop-first pour apprendre plus vite et mieux.

Principes directeurs:

- Clarte cognitive: interface lisible, hierarchie visuelle forte, zero bruit inutile.
- Progression mesurable: chaque session doit generer un signal de progression exploitable.
- Contenu vivant: decks et quizzes evoluent via suggestions + moderation communautaire.
- Competition saine: mode classe avec paliers, scopes general/categorie, et feedback explicite.
- Social learning: amis, associations, challenges prives ou publics.

---

## Etat actuel

Le socle fonctionnel est deja en place.

### Fonctionnalites implementees

- Authentification Supabase (login/register/forgot-password + callback).
- Dashboard principal avec navigation multi-modules.
- Decks:
	- creation, edition, lecture detail, session d'etude,
	- cartes texte + images,
	- categorie + categorie hierarchique (`category_path`).
- Quizzes:
	- creation, edition, detail, mode play,
	- score + recap,
	- mode classe et scope de classement.
- Ranked:
	- profils classes,
	- points RP, tiers, progression vers palier suivant,
	- historique de resultats.
- Check communautaire:
	- file de relecture des questions,
	- votes (`like` / `dislike` / `modify`),
	- integration auto selon seuil de checks.
- Social:
	- friendships,
	- associations,
	- challenges quiz.
- Suggestions:
	- proposition de diff,
	- accept/refuse,
	- notifications associees.
- Explore:
	- catalogue public decks/quizzes,
	- copie de contenu.
- Stats:
	- sessions et precision,
	- activite recente.
- Notifications realtime Supabase.
- Mode demo complet (routes `/demo/*` + jeu de donnees local).

---

## Roadmap produit (jusqu'ou on va)

Roadmap cible sur 4 horizons.

### Horizon A - Stabilisation produit (court terme)

- Durcir les flows critiques (auth, upload, creation contenu).
- Uniformiser les validations et erreurs user-facing.
- Couvrir les paths sensibles avec tests E2E smoke.
- Finaliser l'optimisation image + perf percue.

### Horizon B - Intelligence pedagogique (moyen terme)

- Recommandations de revision personnalisees.
- Planification de sessions adaptatives (niveau/temps/disponibilite).
- Suggestions de contenu auto-assistees par IA (question bank, distractors).
- Dashboard de retention et oubli prevu.

### Horizon C - Ecosysteme communautaire (moyen/long terme)

- Ligues classees et saisons.
- Templates d'associations (ecoles, cohortes, equipes).
- Moderation avancée (roles, quorum, anti-abus).
- Marketplace de packs pedagogiques verifies.

### Horizon D - Plateforme complete (long terme)

- Companion mobile natif (iOS/Android) avec mode offline.
- Session live multi-joueurs (salle, timer synchronise, classement live).
- API publique pour editeurs/integrations externes.
- Moteur analytics decisionnel (LTV learning, predictive success).

Definition de succes global:

- produit stable, fiable, rapide,
- progression utilisateur objectivable,
- catalogue communautaire de qualite,
- engagement social durable,
- boucle creation -> moderation -> diffusion totalement fluide.

---

## Stack technique

- Framework: Next.js 16 (App Router).
- Language: TypeScript.
- UI: React 19 + Tailwind CSS 4 + Framer Motion.
- Data/Auth/Storage/Realtime: Supabase.
- Validation/lint: ESLint + TypeScript checks.

---

## Architecture du repo

```text
flash-master/
	src/
		app/
			(auth)/
			(dashboard)/
			api/
			demo/
			share/
		components/
			branding/
			flashcards/
			layout/
			quizzes/
			suggestions/
			ui/
		lib/
			actions/
			demo/
			hooks/
			supabase/
			utils/
			types.ts
	supabase/
		migrations/
			001_initial_schema.sql
			002_ranked_social_review_taxonomy.sql
	scripts/
		migrate.mjs
		setup.mjs
	seed_content.js
	verify_supabase_setup.js
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

- `npm run dev`: serveur local.
- `npm run lint`: lint ESLint.
- `npm run build`: build production Next.js.
- `npm run start`: run build de prod.
- `node verify_supabase_setup.js`: check env + DB + buckets.
- `node seed_content.js`: injecter du contenu seed.

Notes:

- `scripts/migrate.mjs` est un helper d'instruction manuelle pour migration SQL.
- `scripts/setup.mjs` existe pour bootstrap mais ne doit pas etre utilise en production sans audit securite.

---

## Fonctionnement des modules

### 1) Decks

- Creation/edition de deck et cartes.
- Session d'etude avec progression individuelle.
- Support images sur recto/verso.

### 2) Quizzes

- Authoring questions/reponses.
- Mode play rapide avec feedback.
- Session en mode normal ou ranked.

### 3) Ranked

- Classement global + par categorie.
- Delta RP calcule a chaque session.
- Tiers et progression palier.

### 4) Check communautaire

- Soumission de questions en file d'attente.
- Vote pair review.
- Merge auto selon seuil de checks.

### 5) Social

- Gestion amis.
- Groupes/associations.
- Challenges de quiz.

### 6) Suggestions

- Diff structurel sur deck/quiz.
- Flux recu/envoye.
- Accept/refuse + notifications.

### 7) Explore

- Recherche de contenu public.
- Copie vers espace personnel.

### 8) Stats

- KPI de progression.
- Historique de sessions.
- Activite recente.

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
- Ne jamais commit de credentials hardcoded.
- Maintenir les policies RLS comme source de verite d'autorisation.
- Auditer regulierement les routes server/actions et uploads.

---

## Troubleshooting

### Build casse sur des types

- Verifier les contrats dans `src/lib/types.ts`.
- Verifier les fixtures demo (`src/lib/demo/data.ts`).
- Verifier les payloads intermediaires (`src/lib/utils/diff.ts`).

### Upload image ne fonctionne pas

- Verifier les buckets `avatars` et `card-images`.
- Verifier `SUPABASE_SERVICE_ROLE_KEY`.
- Verifier les policies storage si personnalisees.

### Login / callback echoue

- Verifier URL de callback auth Supabase.
- Verifier route `(auth)/auth/callback`.
- Verifier coherence `NEXT_PUBLIC_SUPABASE_URL` et cle anon.

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
