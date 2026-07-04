# Engineering Decision Log

A few notes before the actual answers: I went back and forth on a couple of these
choices more than the write-up below lets on. I'm giving you the reasoning I settled
on, not a transcript of every option I considered.

**Why this stack?** React and Node were given, so the only real decisions were
everything wrapped around them. I went with Vite instead of Next because there's
nothing here that needs server rendering — it's a form and a dashboard, two route
groups, and Next's routing/data-fetching machinery would just be dead weight I'd have
to configure and then ignore. Same logic on the backend: Express instead of Nest or
Fastify. Five routes and some middleware don't need a framework with opinions about
how my app should be organized. TypeScript everywhere mostly because the analytics
response shape gets used on both sides of the wire, and I'd rather have the compiler
yell at me for a typo'd field name than find it during a demo.

**Why Postgres?** Because the whole dashboard is basically `GROUP BY` and
`date_trunc`. Category breakdown, status breakdown, a 30-day trend — that's three
SQL aggregates, and a relational database is built for exactly that. I thought about
Mongo for about five minutes and decided against it — the aggregation pipeline to get
the same three numbers is just more code, and the data doesn't have a shape that
benefits from being document-shaped (every feedback row looks the same). Neon as the
host because it's Postgres with a real free tier and nothing to keep alive myself.

**Why is it structured this way?** Two separate npm workspaces, `client` and
`server`, not one shared-package monorepo. There isn't enough shared code to justify
it — a couple of TypeScript interfaces — so I just duplicated the `Feedback` shape
once in `client/src/api/types.ts` instead of building tooling to share it. On the
server side it's the usual routes-then-services-then-db layering, and the one thing
I'd actually call a decision (rather than a default) is that the services take a
`Queryable` interface instead of importing the `pg` pool directly. That's the reason
the test suite could swap in an in-memory Postgres for tests without touching any
real code.

**What did I cut corners on?** A few things, roughly in order of how much they bug
me:

JWT sits in `localStorage` instead of an httpOnly cookie. It's simpler for a SPA
talking to an API on a different domain — no CORS/cookie dance — and I can live with
it for a single-admin tool. I wouldn't defend it for anything bigger (more on this in
Q9). I used raw SQL with `node-pg-migrate` instead of an ORM, which means a typo'd
column name blows up at runtime instead of at compile time — fine for five queries,
would probably regret it at fifty. Rate limiting is in-memory, which means it quietly
stops working the moment this runs on more than one server instance. There's no
audit trail on status changes — an admin can flip something from open to resolved and
there's no record of who did it or when. And pagination is offset-based, which is
simple and completely fine now, and will get slow eventually.

**One more week?** Cookies instead of localStorage, with proper CSRF handling and
short-lived tokens that refresh. An actual audit log on status changes, and more than
one admin account with roles, since right now everyone shares one login. Rate
limiting backed by something shared across instances instead of per-process memory.
Some real end-to-end tests instead of just API-level ones. And I'd want actual
tracing, not just log lines, so a slow request is something I can diagnose instead of
guess at.

**Hardest bug?** Not even close — it was the test database silently returning the
same UUID for every row I inserted. Second insert in a test would fail with a
duplicate-key error on the primary key, which makes no sense until you realize
`gen_random_uuid()` was being called once and then reused for every row, because the
in-memory Postgres engine I was testing against (`pg-mem`) treats registered
functions as pure by default and folds them into a constant. There's a flag for that
(`impure: true`) but finding it took writing a throwaway test that inserted two rows
and printed the actual UUIDs side by side before I even knew what I was looking for.

**AI tools?** Claude Code, the whole way through — planning, writing both sides of
the app, the tests, and this document.

**One place it actually helped:** the bug above. Instead of guessing at fixes it
wrote an isolated reproduction that pulled the insert logic out of the HTTP layer
entirely, logged the raw UUIDs, and worked backward from the stack trace to the real
cause — a library assumption, not a bug in my code. That's the difference between
staring at a flaky-looking test for twenty minutes and fixing it in five.

**One place I pushed back:** the localStorage-for-JWT call. It's the pragmatic
default for a SPA and an API on different domains, and I kept it because this app has
exactly one admin and the extra plumbing wasn't worth it this time. But I don't think
it should be anyone's default past a single-user MVP — any XSS in any dependency
leaks the session straight out of localStorage. Cookies with `SameSite`/`Secure` and
a CSRF token is the version I'd actually want once there's more than one person
logging in.

**What breaks first at 100,000 users?** The rate limiter, honestly, before anything
else. It lives in process memory, so the second this runs on more than one server
instance the limit effectively multiplies by however many instances are up, and it
resets completely on every deploy — the spam protection just quietly stops doing
anything, right when traffic would make it matter most. After that it's not really
a code problem, it's the free-tier ceilings: Render's free instance spins down when
idle so the first request after a quiet spell eats a cold start, and Neon's free tier
caps how many connections and how much compute you get. Both of those need a paid
tier before real traffic shows up, no code change required. Further down the list —
the `COUNT(*)` on the feedback list is going to get expensive once that table has
millions of rows in it. Not today's problem.

**One thing I'd change about the assignment itself:** the brief is intentionally
open-ended, and I think that's the right call for seeing how someone actually thinks
instead of how well they follow instructions. But it also means two people spending
the same four hours can hand back completely different-looking submissions — one
adds auth and skips tests, another does the opposite — and there's no way to tell
from the outside whether a missing bonus point means "ran out of time" or "decided it
wasn't worth doing." A single line pinning a rough time-box, even a loose one, would
keep the open-endedness while making those trade-offs legible to whoever's reading it
after the fact.
