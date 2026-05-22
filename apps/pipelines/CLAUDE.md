# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

Pre-generate game content by pulling data from the TMDB API and seeding MongoDB. Lambdas do not generate content at request time — all rounds and game sets are created here and stored in MongoDB.

## Commands

```bash
# Create MongoDB collections (run once, defines schema/indexes)
npm run collection:actors
npm run collection:rounds
npm run collection:leaderboards
npm run collection:gameset

# Seed data into collections
npm run seed:actors       # Fetch actor profiles from TMDB
npm run seed:rounds       # Generate ACTOR_TO_MOVIE round sets
npm run seed:game         # Generate standard + classic game sets
```

Scripts run with `ts-node` + `tsconfig-paths` for path alias resolution.

## Key Source Directories

```
src/
  domain/game/
    game.service.ts     # generateStandardGameSet(), generateClassicChallenge()
    rounds.service.ts   # Individual round builders per QuestionType
    game.types.ts       # Discriminated union types for rounds/actors/titles
  infra/
    tmdb/tmdb.ts        # TMDB API client (actor profiles, credits, discovery)
    db/
      repositories/     # RoundsRepo, ActorsRepo, GamesetRepo
      collections/      # Collection creation scripts with schema validation
```

## Game Generation Logic

### `game.service.ts`

- **`generateStandardGameSet()`**: 5 `ACTOR_TO_MOVIE` rounds — 2 easy, 3 hard. Tracks used actor/title IDs to prevent duplicates within a set.
- **`generateClassicChallenge()`**: 8 rounds — 4 `ACTOR_TO_MOVIE`, 4 `MOVIE_TO_ACTOR`, 2 `ACTOR_IN_MOVIE_TF` (true/false). Mixed difficulty.

Difficulty is determined by actor popularity thresholds defined in the domain logic.

### `rounds.service.ts`

Each `QuestionType` has a dedicated builder. Builders select a correct answer and generate distractor choices from the pool of actors/titles in MongoDB.

### `tmdb.ts`

Wraps the TMDB REST API. Key methods:
- Fetch actor profile + filmography (movies and TV credits)
- Discover titles by genre/decade
- Fetch similar/recommended titles
- Generate image URLs at specified sizes (profile, poster)

All requests use `TMDB_API_KEY` from env. Default language is `TMDB_LANG` (fallback: `en-US`).

## Data Model Summary

**Actor**: `{ tmdb_id, name, popularity, image? }`

**Title**: `{ id, name, medium: "movie"|"tv", year?, genres, popularity, posterUrl? }`

**Round (MongoDB doc)**:
```typescript
{
  type: "ACTOR_TO_MOVIE" | "MOVIE_TO_ACTOR" | "POPULARITY" | "ACTOR_IN_MOVIE_TF"
  difficulty: "easy" | "hard"
  timeLimitSec: number
  actor?: Actor
  title?: Title
  choices: Actor[] | Title[]
  correctId: number
  correctAnswer?: "YES" | "NO" | "HIGHER" | "LOWER"
  createdAt: Date
}
```

## Environment Variables

```
MONGODB_URI      # MongoDB Atlas connection string
MONGODB_DB       # Database name
TMDB_API_KEY     # TMDB v3 API key
TMDB_LANG        # Language for TMDB responses (default: en-US)
```

Create a `.env` file at `apps/pipelines/.env` for local runs.

## Seeding Order

For a fresh database, run in this order:
1. All `collection:*` scripts (creates collections + indexes)
2. `seed:actors` (populate actor pool — rounds reference actors)
3. `seed:rounds` (generate rounds — game sets reference rounds)
4. `seed:game` (assemble game sets from seeded rounds)
