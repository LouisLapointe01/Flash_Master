# Architecture Jeu Quiz (V1)

## 1) Categories principales (HUD)
- Menu principal: `Lobby` (lancer une partie)
- Ranked: matchmaking competitif
- Entrainement: global / categorie / sous-categorie
- Mes quizzes
- Mes decks
- Soumettre une question

## 2) Modes de partie
- `Ranked`
  - Matchmaking par tiers proches uniquement
  - Calcul de points base sur score, niveau adverse, rythme de match et pauses
- `Entrainement`
  - Selection par `Global`, `Categorie`, `Sous-categorie`
  - Affichage du volume disponible (`nombre de questions`, `nombre de quiz`)

## 3) Matchmaking par tiers
Compatibilite appliquee sur tiers adjacents:
- Rookie <-> Bronze
- Bronze <-> Rookie / Silver
- Silver <-> Bronze / Gold
- Gold <-> Silver / Platinum
- Platinum <-> Gold / Diamond
- Diamond <-> Platinum / Master
- Master <-> Diamond / Grandmaster
- Grandmaster <-> Master

Regle: pas de pairing hors voisinage direct.

## 4) Lobbies
- Capacite max: `30` joueurs
- Duree cible: `15 minutes` (`900s`)
- Pauses: budget limite par lobby (10% du temps cible, borne)
- Etats lobby: `forming`, `countdown`, `in_progress`, `paused`, `finished`, `cancelled`

## 5) Classement (gain/perte)
Le delta de points est compose de:
- Composante de performance (type elo) selon score du joueur vs niveau adverse
- Bonus de precision (accuracy)
- Ajustement de rythme (si la partie reste proche de la duree cible)
- Penalite si trop de pauses
- Clamp de securite pour eviter les swings extremes

## 6) Visibilite / partage contenu
- Un deck/quiz peut etre consulte:
  - via lien de partage
  - en public
  - entre amis si contenu public
- La navigation de modules reste centralisee dans la barre principale (pas de duplication de boutons dans chaque page)

## 7) Implémentation V1 (code)
- Règles ranked + tiers: `src/lib/utils/ranked.ts`
- Matchmaking/lobby helpers: `src/lib/utils/matchmaking.ts`
- Entrainement par scopes + compteurs: `src/lib/utils/training.ts`
- Typage domaine: `src/lib/types.ts`
- Schema SQL lobby/matchmaking: `supabase/migrations/003_game_matchmaking_lobbies.sql`
