# Tracker Web

Web companion for the expense tracker backend/Android app. Built with Next.js (App Router), Tailwind CSS, React Query, and cookie-based auth aligned with the Go API.

## Getting Started

```bash
npm install
npm run dev
# open http://localhost:3000
```

Environment:
- `NEXT_PUBLIC_API_BASE_URL` – Backend base URL. Default fallback in this repo is `http://shadywrldserver:8082/api`. Cookies + bearer auth are sent on every request.

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
