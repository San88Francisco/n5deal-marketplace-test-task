# N5Deal — marketplace prototype

A working prototype of a FinTech M&A marketplace: buyers publish a structured
acquisition mandate, sellers list licensed financial companies, and the platform
ranks each side against the other. Platform managers moderate both, with an
audit trail.

Built as a technical assignment. All data is fictional.

- **Architecture and the reasoning behind it:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Stack:** Next.js 15 (App Router) · TypeScript · MySQL 8.4 + Prisma · Tailwind
  · react-hook-form + Zod · Gemini

---

## Running it locally

**Prerequisites:** Node 20+, Docker (for MySQL).

```bash
# 1. install
npm install

# 2. environment
cp .env.example .env          # defaults work as-is for local development

# 3. database (MySQL 8.4 in Docker)
npm run db:up
npm run db:migrate            # applies prisma/migrations
npm run db:seed               # demo data for all three roles

# 4. run
npm run dev                   # http://localhost:3000
```

If port 3000 is taken: `npx next dev -p 3100`.

Other useful scripts:

| Command | What it does |
| --- | --- |
| `npm test` | Unit tests (Vitest) for the match-scoring engine |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | Drop, re-migrate and re-seed |
| `npm run db:down` | Stop the MySQL container |

## Deployment

Vercel for the app, TiDB Cloud Starter for the database — a MySQL-compatible
serverless tier, so the deployed environment runs the same engine as local
development rather than swapping to Postgres for hosting reasons.

Environment variables on the host:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Append `?sslaccept=strict&connection_limit=1` — TiDB requires TLS, and each serverless instance must hold a single connection or the pool is exhausted under load |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `GEMINI_API_KEY` | Optional; without it the AI features degrade to keyword search |

Migrations and seed data are applied against the remote database once, from a
machine that has the repository:

```bash
DATABASE_URL="<remote url>" npx prisma migrate deploy
DATABASE_URL="<remote url>" npx tsx prisma/seed.ts
```

One constraint worth knowing: the Vercel Hobby plan caps a function at 10
seconds. A Gemini call takes most of that, so the AI endpoints sit close to the
ceiling — they fall back to the deterministic path on timeout rather than
failing the request.

### Demo accounts

Password for all three: `n5deal-demo-2026` (they are also listed on the sign-in
page, one click fills the form).

| Role | Email | What they show |
| --- | --- | --- |
| Buyer | `buyer@n5deal.demo` | A funded EMI mandate, live match scores, a watchlist and an open thread |
| Seller | `seller@n5deal.demo` | Three listings including a draft, plus the ranked buyer directory |
| Platform manager | `manager@n5deal.demo` | Moderation console with a suspended seller already in the audit trail |

The seed also contains a suspended seller and a suspended listing, so the
moderation and "not available" paths can be seen without breaking anything.

### AI features

Set `GEMINI_API_KEY` in `.env` to enable them. **Without a key the app works
fully** — natural-language search falls back to keyword search and match
explanations are simply not offered. The ranking itself never depends on the
model.

---

## Key technical decisions

Short version; the full reasoning is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

**One Next.js application, not a separate API.** The repo started as a
Next.js + NestJS workspace and I collapsed it. There is exactly one consumer of
this API, a live URL is a required deliverable, and the company's stack is
Next.js/Node.js + MySQL — not NestJS + Postgres. Business logic still lives in a
layered `src/server/` module tree; Route Handlers and Server Actions are thin
adapters over it.

**Server-side sessions instead of JWT.** A platform manager has to be able to
suspend a participant and have it take effect *immediately*. A stateless token
stays valid until it expires. With a session row the guard re-reads the user's
status on every request, so a suspension applies on their very next click. That
one product requirement is what ruled out the obvious library setup.

**Join tables, not JSON columns.** MySQL has no scalar arrays. Jurisdictions,
licence categories and asset features are the primary filter axes of this
marketplace, so they are real, indexable join tables rather than a JSON blob
that `WHERE ... IN (...)` cannot use.

**Filters live in the URL.** Every faceted view is shareable, bookmarkable and
survives a refresh for free, and the server component does the querying — there
is no client-side data fetching in the catalogue at all.

**Deterministic matching, AI on top.** The score is a pure, unit-tested function
over jurisdiction, licence type, business model, cheque size, operating
preference and validation status. Gemini writes prose about a score it did not
compute, and turns a sentence into filters. The LLM does language; it never
decides the ranking.

**Soft deletion everywhere.** Removing a participant keeps the row, so
conversations and the moderation audit trail stay referentially intact — in a
regulated-industry marketplace, "who removed this and why" has to remain
answerable.

---

## Assumptions I made

The brief is deliberately open, so these are my calls rather than requirements:

- **The scarce resource is relevance, not listings.** A buyer does not want 200
  results, they want the four that fit their mandate. That reading shaped the
  whole product: structured mandates → indexable filters → ranking → contact.
- **Sellers browse buyers *for* a listing**, never in the abstract. The buyer
  directory is therefore ranked against a selected asset, not a flat list.
- **One currency (EUR).** Multi-currency means storing amount + currency +
  rate-at-quote-time, which is a feature of its own.
- **Managers are seeded, not self-registered**, and cannot moderate each other or
  themselves — that is an admin operation, not marketplace moderation.
- **Sold listings stay visible.** Comparable pricing is one of the few public
  signals in M&A; hiding them makes the market look thinner than it is.
- **"Price on request" is not a missing value.** Those listings stay in a
  budget-filtered result unless the buyer explicitly excludes them, and they
  score neutrally rather than badly.
- **Verification is granted, never claimed.** Only a platform manager can set the
  Verified badge, after KYB.
- **Email delivery, file uploads/data rooms and escrow are out of scope** — high
  surface area, low signal for judging the decisions this assignment is about.

## Edge cases handled

- Suspending a user ends their sessions immediately; their listings leave the
  public index and their threads become read-only, while the history stays
  readable. They see *why* they are locked out, not a generic error.
- An asset whose seller is suspended disappears from search even though the
  asset row itself is still `PUBLISHED`.
- Contacting the same seller about the same listing twice reuses the thread
  (enforced by a unique constraint), rather than fragmenting the inbox.
- A removed participant's conversations survive and render as "participant no
  longer on the platform".
- `ticketMin > ticketMax`, EBITDA above revenue, and a licence issued before the
  company existed are all rejected at the schema level, not by the UI alone.
- A malformed query string renders the default listing page instead of an error.
- A seller cannot edit a suspended listing back into visibility.
- Owners and managers viewing a listing do not inflate its view counter.

## AI tools I used

- **Claude Code** — the majority of the implementation, working from a spec I
  wrote first (`docs/ARCHITECTURE.md`) rather than prompting feature by feature.
  I directed the product and architecture decisions; the model wrote and
  iterated on the code under those constraints.
- **Gemini (`@google/genai`)** — inside the product itself, for
  natural-language search and match rationales.

Where I overrode the generated output: the collapse of the NestJS/PostgreSQL
scaffolding into a single MySQL app, the session-vs-JWT decision, the join-table
data model, keeping ranking deterministic rather than asking a model to rank,
and dropping a `FULLTEXT` index that could not combine cleanly with eight
optional facets. The generated first pass also used a stale Gemini model id and
`z.coerce` in the form schemas (which silently breaks the resolver's input/output
types) — both caught by running the thing rather than by reading it.

## What I would improve with more time

In priority order:

1. **End-to-end tests** over the three role journeys. Unit tests cover the
   scoring engine; the flows themselves are currently verified by hand.
2. **A real search index.** `LIKE` over title/summary is honest at this data
   volume and wrong at scale.
3. **Keyset pagination**, and precomputing match scores into a column so
   match-sorted pages page in SQL rather than in memory.
4. **Notifications** — an outbox plus email for new messages; right now the
   inbox only updates when you open it.
5. **File uploads and a permissioned data room per deal**, which is the next
   thing this product would actually need.
6. **Rate limiting** on contact actions, to stop broker spam.
7. **Multi-language support** — the UI copy is centralised enough to lift into
   `next-intl`, but it is not done.
8. **A general append-only event log** replacing the moderation-specific audit
   table — the natural seam for the PHP/Laravel-to-Next.js migration.
