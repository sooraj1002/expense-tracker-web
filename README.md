# Tracker Web

Web companion for the expense tracker backend/Android app. Built with Next.js (App Router), Tailwind CSS, React Query, and cookie-based auth aligned with the Go API.

## Getting Started

```bash
npm install
npm run dev
# open http://localhost:3000
```

Environment:
- `NEXT_PUBLIC_API_BASE_URL` – Browser-facing API base URL. Default is `/api`, so the web app can sit behind a reverse proxy or Next rewrite and keep the API same-origin.
- `INTERNAL_API_ORIGIN` – Server-side backend origin used by the Next.js rewrite layer. Local dev can use `http://127.0.0.1:8082`; the Docker deployment in this repo uses `http://backend:8080`.

## Features (initial scaffold)
- Auth pages (login/signup) with cookie token handling + refresh attempts.
- App shell with nav to dashboard, expenses, accounts, categories, reports, settings.
- Operational expense/account/category management plus reporting/export flows.
- React Query provider wired for client-side caching and future optimistic updates.

## Scripts
- `npm run dev` – start dev server.
- `npm run build` – production build.
- `npm run start` – start production server.
- `npm run lint` – lint sources.

## Notes
- Design reuses mobile cues: bold cards, soft gradients, and a brand palette that will align with the Android app.
- Tokens are stored in cookies; unauthorized responses trigger a refresh attempt and then redirect flows in the UI.
