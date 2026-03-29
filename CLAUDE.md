# Expense Tracker — Next.js Frontend

## Purpose
Web UI for the expense tracker. Works on desktop and mobile (including Android). Shows expenses, accounts, categories, spending summaries. Also hosts the voice mode UI that connects to the Fedora voice server.

## Stack
- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4** — uses CSS vars (`var(--color-brand)`, `var(--color-surface)`, `var(--color-muted)`, etc.) not raw colours
- **TanStack React Query** — all server state, mutations, cache invalidation
- **Zod** — form validation
- **js-cookie** — read/write JWT cookies
- **lucide-react** — icons (already installed, use these before adding new icon libs)

## Running
```bash
npm run dev     # development
npm run build   # production build
npm run start   # serve production build
```

Docker (from expenses-stack/):
```bash
docker compose build frontend && docker compose up -d --force-recreate frontend
```

Note: `NEXT_PUBLIC_*` env vars are baked in at **build time**, not runtime. Rebuild the container after changing them.

## Key structure
```
src/app/(app)/          — authenticated pages (expenses, dashboard, accounts, categories, reports, settings)
src/app/(auth)/         — login, signup
src/components/layout/app-shell.tsx  — main layout, header, sidebar nav, voice button
src/components/ui/      — shared UI primitives (Button, etc.)
src/components/voice/   — VoiceButton, VoiceMode
src/hooks/use-queries.ts — all React Query hooks (fetch + mutations)
src/hooks/use-voice.ts  — voice mode state machine + WebSocket + MediaRecorder
src/lib/api-client.ts   — fetch wrapper, Bearer token injection, auto token refresh
src/lib/types.ts        — all TypeScript types (Category, Account, Expense, etc.)
```

## Auth pattern
- Tokens stored in cookies: `tracker_access` (access), `tracker_refresh` (refresh)
- `api-client.ts` reads `tracker_access` via `js-cookie` and sets `Authorization: Bearer`
- On 401, auto-refresh via `POST /api/auth/refresh`, then retry once
- API base URL: `NEXT_PUBLIC_API_BASE_URL` (default `/api`) — proxied to backend via Next.js rewrites

## Adding new API calls
Follow the pattern in `api-client.ts` — use `apiFetch<ApiEnvelope<T>>()`, unwrap with `unwrapData()`. Add a React Query hook in `use-queries.ts`.

## Styling conventions
- Rounded corners: `rounded-2xl` (inner), `rounded-3xl` (cards/panels)
- Surfaces: `bg-[var(--color-surface)]`, borders: `ring-1 ring-[var(--color-border)]/70`
- Brand colour: `var(--color-brand)` (active nav, primary buttons)
- Muted text: `text-[var(--color-muted-foreground)]`
- Font: Space Grotesk

## Voice mode
- `useVoice()` hook owns all state — single instance in `AppShell`, passed as prop to `VoiceMode`
- Status machine: `idle → waking → listening → processing → confirming → speaking → listening`
- `waking`: calls `POST VOICE_SERVER_URL/wake` (blocks until model loaded, ~10-20s first time)
- `listening`: MediaRecorder sends WebM/Opus chunks every 250ms over WebSocket
- `confirming`: server resolved expense details, user sees a preview card and clicks Add/Cancel
- Voice server URL: `NEXT_PUBLIC_VOICE_SERVER_URL` (set to Fedora machine's Tailscale IP:8765)
- Do NOT call `useVoice()` in VoiceMode — it receives the instance as a prop from AppShell

## Installing on Android (Pixel 9) via ADB

The web app runs as a PWA. To access the local dev server from your Pixel during development:

**1. Enable USB debugging on the Pixel**
Settings → About Phone → tap Build Number 7 times → Developer Options → USB Debugging ON

**2. Connect and verify**
```bash
adb devices
# Should show your device serial number
```

**3. Forward the port**
```bash
# Forward phone's localhost:3000 → dev machine's localhost:3000
adb reverse tcp:3000 tcp:3000

# Also forward the voice server port if testing voice mode locally
adb reverse tcp:8765 tcp:8765
```

**4. Open in Chrome on the Pixel**
Navigate to `http://localhost:3000`

**5. Install as PWA**
Chrome menu (⋮) → "Add to Home screen" → Install

The PWA will appear as a standalone app icon. It uses the production deployment via Tailscale in normal use — ADB port forwarding is only needed for local dev/testing.

**Useful ADB commands**
```bash
adb reverse --list           # see active forwards
adb reverse --remove-all     # clear all forwards
adb logcat | grep Chrome     # see browser console logs
```

## Environment variables
```
NEXT_PUBLIC_API_BASE_URL=/api
INTERNAL_API_ORIGIN=http://backend:8080   (server-side proxy target)
NEXT_PUBLIC_VOICE_SERVER_URL=http://<fedora-tailscale-ip>:8765
NODE_ENV=production
PORT=3000
```

## Network
The frontend container uses `network_mode: service:ts-frontend` (shares Tailscale container's network namespace). This means:
- No ports are directly exposed on the frontend container
- Traffic comes in via Tailscale
- The browser connects to the voice server directly by its Tailscale IP — no proxy needed
