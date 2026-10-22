# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server at localhost:5173 with HMR
npm run build        # Production build → build/client/ and build/server/
npm run typecheck    # React Router typegen + tsc (run before committing)
npm run preview      # Serve production build locally at localhost:4173
```

## Stack

- **React Router v7** (SPA mode — SSR is disabled via `react-router.config.ts`)
- **React 19**
- **Tailwind CSS v4** (configured via Vite plugin, not `tailwind.config.js`)
- **Radix UI** for accessible primitives
- **Vite PWA plugin** (service worker, installable)

## Route Structure

```
app/routes/
  home.tsx            # Landing page + game mode selection
  gamePlay.tsx        # Active game session (/play/:gameId)
  privacy-policy.tsx  # Static legal page
```

Routes are file-based. The `~/` path alias maps to `./app/` (configured in `tsconfig.json` and `vite.config.ts`).

## Key Directories

```
app/
  routes/       # Page-level route components
  components/   # Reusable UI components (Radix UI wrappers + game-specific)
  types/        # Shared TypeScript interfaces (Round, Actor, Answer)
  lib/          # Utilities: GA4 tracker, analytics helpers
```

## Analytics

Two parallel tracking mechanisms:
1. **Google Analytics 4** — via `app/lib/` tracker, uses `VITE_APP_GA4_MEASUREMENT_ID`
2. **MongoDB events** — POST to `/api/events` via the store-events Lambda

## Environment Variables

Set at build time (injected by CI/CD):
```
VITE_APP_GA4_MEASUREMENT_ID   # GA4 property ID
VITE_APP_API_URL              # e.g. https://ohitsthatguy.com
```

For local dev, create `apps/client/.env` with these values.

## Build Output & Deployment

`npm run build` produces `build/client/` (static assets). CI/CD syncs this folder to S3 and invalidates CloudFront. The app is a pure SPA — no server-side rendering at runtime.

## Tailwind v4 Notes

Tailwind is configured via the Vite plugin (`@tailwindcss/vite`), not a config file. Utility classes are tree-shaken at build time. There is no `tailwind.config.js` — customizations go in `vite.config.ts` or CSS files.
