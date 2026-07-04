# Acowale CRM Machine Test — Feedback Platform

A small customer feedback tool: a public form where anyone can leave feedback, and an
admin console where the team can actually do something with it. React + Vite on the
frontend, Node/Express + PostgreSQL on the backend.

> Live app: _add your deployed URL here_
> Repository: _add your public repo URL here_

## What's actually in here

```
Acowale/
  client/    React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts
  server/    Node + TypeScript + Express + PostgreSQL (pg + node-pg-migrate)
```

The public side is one page — submit feedback, pick a category, optionally leave an
email. The admin side is behind a login and has five sections: **Overview** (the
usual stat tiles plus category/status/trend charts and a recent-feedback table),
**Feedback** (the full list, searchable and filterable, with inline status changes),
**Analytics** (a deeper cut of the same data — category, status, a 30-day activity
heatmap, a percentage table), **Users** (who's actually leaving feedback, ranked by
volume, plus an anonymous count), and **Settings** (change your password). All of it
talks to a small REST API — see below — backed by two Postgres tables, `feedback` and
`admin_users`.

## Why this stack, briefly

React and Node were specified, so the interesting choices were around them. Vite
because there's no server-rendering need here and Next would be overhead I'd
configure and then ignore. Express on the backend for the same reason — a handful of
routes doesn't need a more opinionated framework. TypeScript on both sides because the
dashboard's data shapes are shared conceptually between client and server, and I'd
rather the compiler catch a typo than a demo. Postgres because the dashboard is
basically `GROUP BY` and `date_trunc` — that's what a relational database is for.
Raw SQL with `node-pg-migrate` instead of an ORM, since five-ish queries don't need
one and it made the test setup simpler. JWT over cookies because the client and API
sit on different domains and cookies would mean fighting CORS for no real benefit at
this scale. Pino for logs, Zod for validation on both the env config and request
bodies, Vitest + Supertest + an in-memory Postgres (`pg-mem`) for tests, so the whole
suite runs without a real database or any secrets.

The longer version of all of this — including what I'd do differently — is in
[DECISIONS.md](./DECISIONS.md).

## API surface

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | none | Checks the DB is actually reachable, not just that the process is alive |
| `POST` | `/api/feedback` | none, rate-limited | Submit feedback: `{ category, message, email? }` |
| `GET` | `/api/feedback` | admin | List feedback — `category`, `status`, `search`, `page`, `pageSize` |
| `PATCH` | `/api/feedback/:id/status` | admin | Update a feedback item's status |
| `GET` | `/api/analytics/summary` | admin | Total count, category/status breakdowns, 30-day trend |
| `GET` | `/api/analytics/submitters` | admin | Submitters ranked by volume, plus an anonymous count |
| `POST` | `/api/auth/login` | none, rate-limited | `{ email, password }` → `{ token, email }` |
| `PATCH` | `/api/auth/password` | admin | Change your own password |

Errors all come back in the same shape: `{ "error": { "message": ..., "code": ... } }`.

## Running it yourself

You'll need Node 20+ and a Postgres database somewhere — a free [Neon](https://neon.tech)
project is the easiest way to get one without installing Postgres locally.

```bash
npm install                            # installs client + server, npm workspaces
cp server/.env.example server/.env     # fill in DATABASE_URL, JWT_SECRET, etc.
cp client/.env.example client/.env     # VITE_API_BASE_URL, defaults to localhost:4000

cd server
npm run migrate:up                     # creates the feedback + admin_users tables
npm run seed:admin                     # creates one admin from ADMIN_EMAIL/ADMIN_PASSWORD

cd ..
npm run dev                            # runs client (5173) and server (4000) together
```

Feedback form is at `http://localhost:5173`, admin login at
`http://localhost:5173/admin/login`.

Tests (`npm run test -w server`) run against an in-memory Postgres, so you don't need
a real database or any secrets to get a green run.

## Deploying it (this is configured, but I haven't pushed a live URL — see below)

- **Server → Render**: root dir `server`, build command
  `npm install && npm run build && npm run migrate:up`, start command `npm run start`,
  health check at `/health`. There's a `render.yaml` with the full config. Set
  `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN` as secrets.
- **Client → Vercel**: root dir `client`, Vite preset. Set `VITE_API_BASE_URL` to
  wherever the server ends up. `client/vercel.json` has the SPA rewrite React Router
  needs.
- **Database → Neon**: free project, drop the pooled connection string into
  `DATABASE_URL` on Render.

## Production-readiness, honestly assessed

Env vars are validated on boot with Zod, so a misconfigured deploy fails loudly at
startup instead of quietly on the first request. Errors all funnel through one
handler with one JSON shape, no stack traces leaking in production. Every write
endpoint validates its input. Logging is structured (Pino), and the health check
actually pings the database instead of just confirming the process didn't crash.
There's JWT auth on the whole admin surface, rate limiting on the public submission
and login endpoints, and a GitHub Actions workflow that lints, typechecks, tests, and
builds both packages on every push.

Where it's genuinely thin: there's no external monitoring or alerting wired up
(logs and the health check are what you get), and the rate limiter is in-process, so
it stops being meaningful the moment this runs on more than one server. Both are
called out in DECISIONS.md rather than papered over.

## How this actually got built

Server first — env config, then the DB layer, then services and routes, tests along
the way, checked with `npm test`/`typecheck`/`build` before moving to the next piece.
Then the client: scaffold, API client, auth context, pages, charts. The admin
console went through a few real redesign passes rather than landing right the first
time — a first pass that was fine but forgettable, then a deliberate pivot to a
darker, denser "console" feel once it was clear "fine" wasn't the bar, and a couple of
rounds after that fixing things that were wrong rather than just different: chart
colors that clashed, a zero-value bar that silently disappeared instead of showing
empty, and a mobile viewport where the entire admin sidebar vanished with nothing to
replace it. Small thing worth mentioning — the category chart is a set of horizontal
bars, not a pie or donut, because with six categories a pie chart is exactly the kind
of thing that's hard to read at a glance; the bars use a fixed color per category
everywhere in the UI, so the same category always looks the same whether you're
looking at a chart, a table row, or a filter dropdown.

More detail on the decisions behind all of this is in [DECISIONS.md](./DECISIONS.md),
and there's a short write-up of an idea for Acowale's engineering practice in
[TEACH_US.md](./TEACH_US.md).
