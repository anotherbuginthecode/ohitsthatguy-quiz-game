# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Oh It's That Guy" is a serverless quiz game where users identify actors and movies. The stack is:

- **Frontend**: React Router v7 SPA → S3 + CloudFront CDN
- **Backend**: 4 AWS Lambda functions (Node.js 22, Docker/ECR) behind API Gateway HTTP API
- **Database**: MongoDB Atlas
- **Data Pipeline**: TypeScript scripts that pull from TMDB API and seed MongoDB
- **IaC**: Terraform for all AWS resources

## Monorepo Structure

```
apps/
  backend/        # Lambda functions (get-actors, get-rounds, get-gameset, store-events)
  client/         # React Router SPA
  pipelines/      # TMDB → MongoDB seed scripts
infra/
  backend/        # Terraform: API Gateway, Lambda, IAM
  client/         # Terraform: S3, CloudFront, Route53, ACM
```

Each app is independently buildable — there is no shared package or workspace hoisting at the root.

## Architecture & Data Flow

```
Browser
  → React Router SPA (apps/client)
    → API Gateway HTTP API
      → Lambda (apps/backend)
        → MongoDB Atlas

Pipelines (apps/pipelines)
  → TMDB API
    → MongoDB Atlas (pre-generate game sets)
```

Game content is **pre-generated** by pipelines and stored in MongoDB. Lambdas only fetch — they do not generate rounds at request time.

## Game Modes & Round Types

Round types: `ACTOR_TO_MOVIE`, `MOVIE_TO_ACTOR`, `POPULARITY`, `ACTOR_IN_MOVIE_TF`

- **Standard Mode**: 5 rounds (2 easy + 3 hard, all `ACTOR_TO_MOVIE`)
- **Classic Challenge**: 8 rounds (mixed types, mixed difficulty, 2 true/false)

## MongoDB Collections

`actors`, `rounds`, `gamesets`, `events`, `leaderboards`

## Environment Variables

### Backend Lambdas
```
MONGODB_URI
MONGODB_DB
```

### Client
```
VITE_APP_GA4_MEASUREMENT_ID
VITE_APP_API_URL
```

### Pipelines
```
MONGODB_URI
MONGODB_DB
TMDB_API_KEY
TMDB_LANG   # default: en-US
```

## Deployment

- **Client**: Automatically deployed on push to `main` via GitHub Actions (build → S3 sync → CloudFront invalidation)
- **Backend Lambdas**: Manual deploy via `apps/backend/deploy.sh` (Docker build → ECR push → Lambda update)
- **Infrastructure**: Terraform, state stored in S3 bucket `ohitsthatguy-tfstate` (eu-west-1)

## API Routes

```
GET  /api/actors   → get-actors Lambda
GET  /api/rounds   → get-rounds Lambda
GET  /api/gameset  → get-gameset Lambda
POST /api/events   → store-events Lambda
```

CORS is configured for `localhost:5173` and `ohitsthatguy.xyz`.
