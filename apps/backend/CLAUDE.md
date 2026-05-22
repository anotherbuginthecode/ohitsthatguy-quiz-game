# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

Four independent Lambda functions, each its own Node package:

```
get-actors/       # Returns 3 random actors from MongoDB
get-rounds/       # Returns 6 random rounds (5 game + 1 second chance)
get-gameset/      # Returns a complete game set with questions
store-events/     # POST endpoint for analytics/telemetry events
```

Each function has: `src/index.ts`, `package.json`, `tsconfig.json`, `Dockerfile`.

## Commands

Run these from within a specific function directory (e.g., `apps/backend/get-actors/`):

```bash
npm install        # Install dependencies
npm run build      # esbuild: src/index.ts → dist/index.js (minified)
```

Deploy all functions (from `apps/backend/`):
```bash
./deploy.sh        # Docker build → push to ECR → Lambda function updated
```

## Build & Packaging

- **Build tool**: esbuild bundles TypeScript to a single `dist/index.js`
- **Lambda packaging**: Docker multi-stage (compile in Node image, copy dist + node_modules to runtime image)
- **Runtime**: Node.js 22 on AWS Lambda

## Key Patterns

### Lambda Handler Shape
Each `src/index.ts` exports an `APIGatewayProxyHandlerV2`. CORS headers are injected manually in every response — both success and error paths include:
```
Access-Control-Allow-Origin: <origin or *>
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### MongoDB Connection
Lambdas connect using `MONGODB_URI` and `MONGODB_DB` env vars. The connection is created outside the handler function for reuse across warm invocations. Collections are accessed via the `mongodb` driver directly (no ODM).

### Validation
`store-events` uses Zod schemas to validate the incoming POST body before writing to MongoDB.

### Random Sampling
Rounds and actors are selected from MongoDB using the `$sample` aggregation stage for O(1) random retrieval.

## Adding a New Lambda

1. Create a new directory under `apps/backend/`
2. Copy `package.json`, `tsconfig.json`, `Dockerfile` from an existing function and adapt
3. Implement `src/index.ts` exporting `APIGatewayProxyHandlerV2`
4. Add Terraform resources in `infra/backend/` (see existing `get-actors.tf` as template)
5. Add a route to API Gateway in `infra/backend/main.tf`
