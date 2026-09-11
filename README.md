# Civora

**From City Problems to Smarter Actions.**

Civora is a browser-based AI Smart City Assistant that helps citizens, students, institutions, and community groups turn vaguely described urban problems into practical, safe, measurable action plans.

## Overview

Civora combines a focused Gemini system prompt, automatic SDG 11 domain routing, six specialist modes, action commands, and browser-scoped conversation history. The public `POST /chat` endpoint also accepts a minimal stateless request for the Next Gen Chatbot Arena evaluator.

## SDG 11 alignment

Civora is deliberately constrained to **UN Sustainable Development Goal 11 — Sustainable Cities and Communities**. Its supported areas are sustainable mobility, traffic, waste reduction and management, pollution awareness, public spaces, greenery, walkability, accessibility, and urban drainage or waterlogging. It is not a general-purpose assistant or a broad SDG 6 assistant.

## Problem and solution

Urban concerns are often expressed as observations—“traffic is terrible near our university”—without a diagnosis, responsible next step, or way to measure improvement. Civora turns those observations into:

- a careful issue assessment and priority;
- plausible contributing factors clearly marked as uncertain;
- safe quick wins and a realistic action plan;
- stakeholder roles; and
- measurable indicators without invented baselines.

## Core features

- ChatGPT-inspired responsive chat interface
- Smart Auto detection for multi-domain urban problems
- Persistent specialist mode per conversation
- Multiple browser-scoped conversations with rename and delete controls
- Keyboard-accessible slash command palette
- Safe Markdown rendering
- Concise, uncertainty-aware, safety-focused guidance
- Stateless Arena API that does not depend on the database
- Supabase persistence through server-only credentials

### Specialist commands

`/auto`, `/mobility`, `/waste`, `/pollution`, `/spaces`, and `/water` select a persistent specialist. `/analyze`, `/quickfix`, `/plan`, `/stakeholders`, `/impact`, and `/help` request a one-time response format without changing the specialist.

## Chat persistence and privacy

On first use, the browser creates a random UUID in `localStorage` under `civora-client-id`. It is used only for browser-scoped conversation persistence. It is **not authentication** and is not represented as an account security boundary. The server verifies the supplied client ID before every conversation read or mutation. Supabase service credentials never enter the client bundle.

Without Supabase variables, the server uses an in-memory development store so the UI can be evaluated locally; that data disappears when the process restarts.

## Accessibility

The interface targets WCAG 2.2 AA where practical: semantic landmarks, a skip link, visible focus styles, labelled icon buttons, accessible Radix dialogs and menus, live loading/error regions, 44px controls, keyboard command navigation, and reduced-motion support. In the composer, use Enter to send, Shift+Enter for a new line, arrow keys to navigate commands, and Escape to close the command palette.

## Architecture

```text
React + Vite browser
        │
        ▼
Node + Express API ─────► Gemini API
        │
        └───────────────► Supabase PostgreSQL
```

The frontend never calls Gemini or privileged Supabase APIs directly.

## Tech stack

- React 19, Vite, TypeScript
- Tailwind CSS, shadcn-style local primitives, Radix UI, Lucide React
- Node.js, Express, TypeScript, Zod, Helmet
- Official `@google/genai` Node SDK
- Supabase PostgreSQL

## Setup

Requirements: Node.js 20 or newer, a Gemini API key, and optionally a Supabase project.

```bash
npm install
cp .env.example server/.env
printf 'VITE_API_URL=http://localhost:3001\n' > client/.env
```

Fill in `server/.env`. Do not commit it.

### Environment variables

| Variable | Location | Required | Purpose |
|---|---|---:|---|
| `VITE_API_URL` | Client | Yes | Public Express API base URL |
| `PORT` | Server | No | API port; defaults to `3001` |
| `GEMINI_API_KEY` | Server | Yes | Gemini API credential |
| `GEMINI_MODEL` | Server | No | Defaults to `gemini-2.5-flash` |
| `SUPABASE_URL` | Server | Production history | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Production history | Server-only service role key |
| `CLIENT_ORIGIN` | Server | Yes | Comma-separated allowed browser origins |

### Supabase setup

Open the Supabase SQL editor and run [`supabase/schema.sql`](supabase/schema.sql). The schema enables RLS without public browser policies because all database access goes through the backend. Add the project URL and service role key only to the backend environment.

### Gemini setup

Create a Gemini API key in Google AI Studio and set `GEMINI_API_KEY` on the server. The model can be changed with `GEMINI_MODEL`. Civora uses a 25-second timeout, restrained temperature, and bounded output.

### Running locally

```bash
npm run dev
```

Open `http://localhost:5173`. The API listens on `http://localhost:3001`.

Quality checks:

```bash
npm run typecheck
npm test
npm run build
npm run lint
```

## API documentation

### Arena endpoint — `POST /chat`

No authentication or conversation metadata is required.

```json
{
  "message": "Design a simple sustainable-city action plan for reducing traffic and waste in a local community."
}
```

Every successful response includes:

```json
{
  "response": "..."
}
```

Optional frontend fields are `conversationId`, `clientId`, and `mode`. If conversation metadata is omitted, Civora uses Smart Auto and does not access Supabase.

### Other endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Returns `{ "status": "ok" }` |
| `POST` | `/conversations` | Create a browser-scoped conversation |
| `GET` | `/conversations?clientId=...` | List conversations |
| `GET` | `/conversations/:id?clientId=...` | Read one conversation |
| `PATCH` | `/conversations/:id` | Rename or change mode; `clientId` is in the body |
| `DELETE` | `/conversations/:id?clientId=...` | Delete a conversation and its messages |
| `GET` | `/conversations/:id/messages?clientId=...` | Read messages |

## Operating modes

### Stateless mode (Gemini only)

Requires only `GEMINI_API_KEY`. Supports `POST /chat`, the core chatbot, and Arena evaluator requests. Conversations are not persisted and the UI shows a warning banner. This mode is fully functional for evaluation.

```bash
# Minimal server/.env for stateless mode
GEMINI_API_KEY=your_key_here
```

### Persistent mode (Gemini + Supabase)

Requires `GEMINI_API_KEY` plus the two Supabase variables. Adds full chat history, multiple browser-scoped conversations, rename/delete, and saved specialist modes. The UI seamlessly falls back to stateless mode when persistence is temporarily unavailable.

## Deployment

### Frontend — Vercel

1. Connect the repository; set **Root Directory** to `client`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`

> **Important:** `VITE_API_URL` is injected at build time. Redeploy the frontend whenever you change it.

### Backend — Render

1. Build command: `npm install && npm run build -w server`
2. Start command: `npm start -w server`
3. Health check path: `/health`
4. Set all environment variables in the Render dashboard:

| Variable | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | **Yes** | Without this chatbot returns 503 |
| `GEMINI_MODEL` | No | Defaults to `gemini-2.5-flash` |
| `SUPABASE_URL` | No | Omit for stateless/in-memory mode |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Omit for stateless/in-memory mode |
| `CLIENT_ORIGIN` | Yes | Comma-separated Vercel URL(s) |
| `PORT` | No | Render sets this automatically |

After deploying both services, verify:

```bash
curl https://your-backend.onrender.com/health
# Expected: {"status":"ok"}

curl -X POST https://your-backend.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How can a neighborhood reduce traffic?"}'
# Expected: {"response":"..."}
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Composer loads but Civora shows amber warning banner | `/conversations` or Supabase is unreachable | Check backend logs; chat still works in stateless mode. Use Retry button. |
| Red "cannot reach the server" banner | Backend is down or VITE_API_URL is wrong | Verify `/health` is reachable; check Render deployment |
| UI shows "Civora API not configured" | `VITE_API_URL` missing in production Vercel build | Set env var in Vercel dashboard and redeploy frontend |
| POST /chat returns 503 | `GEMINI_API_KEY` not set on backend | Add it in Render environment variables |
| POST /chat returns 502 | Gemini API error or timeout | Check API key validity; try again |
| CORS error in browser console on `/conversations` | `CLIENT_ORIGIN` not set or wrong URL | Set `CLIENT_ORIGIN=https://your-app.vercel.app` on Render |

## Competition compliance

Civora treats evaluator requests exactly like ordinary user requests. It does not identify judge prompts, manipulate scoring, inject evaluators, expose credentials, or interfere with other participants. The external API is unauthenticated by design, while secrets and privileged database access stay on the server.

## Limitations

- Civora has no live traffic, AQI, sensor, municipal, mapping, or emergency feed.
- Location-specific rules and responsible departments must be verified using official local sources.
- The browser client ID provides continuity, not authenticated identity.
- Recommendations are planning support, not engineering, legal, or emergency instructions.
- Conversation summaries are schema-ready; current context is bounded to the ten most recent messages.

## Future improvements

After the competition-critical path is stable: optional streaming, deterministic long-chat summaries, official city-data integrations, conversation search, and richer impact tracking.
