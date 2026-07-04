# Teach Us: Give Every Pull Request Its Own Real Database

Here's a small idea that's cheap to try and pays for itself almost immediately: stop
pointing every branch at one shared staging database, and instead give each pull
request its own — created automatically when the PR opens, torn down automatically
when it closes.

Shared staging databases rot in a very predictable way. Someone's half-finished
migration is still sitting on it. Someone else's manual test data is quietly messing
with a query you're trying to debug. And the one time you actually need to test a
destructive migration properly, you can't risk running it there, so you either test
against a local Postgres that's drifted from what production actually looks like, or
you skip testing that part and just hope CI catches it. Neither of those is really
testing the thing that's about to run in production.

The reason this is suddenly practical is that a few Postgres providers now do
copy-on-write branching — Neon is the one I used for this project, and there are
others. Branching a database takes seconds, not minutes, because it's a metadata
operation, not an actual copy of the data. Wired into CI, it looks roughly like this:
a PR opens, a GitHub Action branches the database and tags it with the PR number, the
preview deployment (which Vercel already gives you for the frontend) points its
`DATABASE_URL` at that branch, and every subsequent push re-runs migrations against
that same branch. If a migration is broken, it shows up as a red check on the PR that
introduced it — not as a mystery three PRs later on shared staging. When the PR
merges or closes, a second Action deletes the branch, and nothing lingers behind.

I picked Neon for this app partly with this in mind, not just because of the free
tier. The schema is small right now — two tables — which is exactly the moment to
build the habit, before there's a migration history messy enough that everyone's
scared to touch it.

Cost-wise it's cheap: branch storage is just the diff from the parent, so it scales
with how much test data a branch touches, not how many branches exist. The real cost
is a bit of CI time — branching, migrating, seeding adds maybe 10-20 seconds per
run — plus some one-time plumbing to get the branch URL into the preview environment.

But the actual payoff isn't the tooling, it's the behavior it changes. People stop
asking "is it safe to test this against staging?" because the question stops making
sense — every PR already is its own staging. Migrations get caught before merge
instead of after. Schema review happens on the PR diff instead of in a Slack thread
after something's already broken. And "it works on my machine" stops being a
meaningfully different claim from "it works in CI," because CI is finally testing
against the same kind of database, freshly seeded, every single time.
