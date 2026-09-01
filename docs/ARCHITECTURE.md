# Architecture

This document explains what I built, and — more importantly — why. It is written
as the specification I worked from, not as documentation reverse-engineered
afterwards.

## 1. How I read the assignment

The brief describes three roles and a handful of verbs (publish, browse, filter,
contact, suspend). Taken literally that is a CRUD app. Taken as a product, the
interesting question is different: **N5Deal is a two-sided marketplace in a
relationship-driven industry where the scarce resource is not listings, it is
relevance.** A buyer looking for an EMI in the EEA does not want 200 listings,
they want the four that match their mandate, their cheque size and their
timeline.

So the spine of the product I built is:

> a structured profile of what each side wants → indexable filters over that
> structure → a match score that ranks the other side → a contact thread that
> preserves the context of *what* the conversation is about.

Everything else — moderation, authentication, messaging — supports that spine.

### Deliberate scope decisions

| Included | Left out (and why) |
| --- | --- |
| Three roles with real, separated permissions | Email delivery — nothing to demo, adds infra |
| Structured buyer mandate + asset taxonomy | File uploads / data rooms — big surface, low signal |
| Faceted search on both sides | Payments, escrow — out of prototype scope |
| Threaded contact between buyer and seller | Real-time messaging — polling is enough to show the flow |
| Moderation with an audit trail | Notifications centre |
| AI matching with a deterministic fallback | Full-text relevance ranking (see §6) |

## 2. Why one Next.js application

The repository originally had a `frontend` (Next.js) + `backend` (NestJS)
workspace split. I collapsed it. Reasons, in order of weight:

1. **Deployability inside the budget.** A live URL is a required deliverable.
   One Next.js app on Vercel plus a managed MySQL is a 20-minute deploy; two
   services with CORS, two sets of env vars and a separate container host is
   half a day I would rather spend on the product.
2. **Stack alignment.** N5Deal runs Next.js / React / TypeScript / Node.js and
   MySQL. NestJS and PostgreSQL were my scaffolding choices, not theirs.
3. **The API boundary was not earning its keep.** There is exactly one consumer
   of this API — this web app. A network hop between two TypeScript codebases
   that share the same types buys nothing here.

What replaces it is not "no backend", it is a **layered server module**:

```
src/
  app/            routes only — every page delegates to components and server modules
  server/         the backend, one folder per bounded context
    auth/           sessions, password hashing, guards
    assets/         listing queries and mutations
    buyers/         buyer directory and profiles
    conversations/  threads between the two sides
    moderation/     manager actions, all writing to the audit trail
    matching/       scoring engine + AI layer
    profiles/       profile mutations
    db.ts           Prisma singleton
  routes/         every URL, as typed helpers
  constants/      closed sets, labels, form and table configs
  types/          what travels between layers
  utils/          cn, format, json, url, array, domain predicates
  mappers/        record → form values
  lib/validation/ Zod schemas, one file per concept
  components/
    rhf/            form-field wrappers over react-hook-form
    ui/             primitives, one component per file
    filters/        shared facet parts
    <feature>/      feature components
```

Three conventions worth naming. **No route string is written inline** — everything
goes through `ROUTES`, so renaming a path is a compile error rather than a silent
dead link. **No status literal is written inline either** — `USER_STATUS.ACTIVE`,
`ASSET_STATUS.PUBLISHED` and friends come from `constants/domain.ts`, which also
derives the tuples the Zod enums are built from, so the database, the schemas and
the UI cannot drift apart. And **the form layer is one pattern, not per-form
code**: a `RHFForm` provider plus field wrappers (`RHFInput`, `RHFSelect`,
`RHFMultiSelect`, …) that all resolve their error/warning/hint state through a
single `getFieldHelperState`.

Repeated UI is data, not markup: filter sidebars, form steps, table columns and
match sections are declared as config arrays in `constants/` and rendered with a
`.map()`, so adding a facet or a column is a one-line change in one place.



Route Handlers and Server Actions are thin: they parse input with Zod,
call a guard, delegate to a module, and map the result to a response. No
business logic lives in a page or a component. If this ever needs to become a
standalone service, the `src/server` tree moves out largely unchanged.

**Reads** go through React Server Components calling the server modules
directly — no HTTP round trip for data the server is already rendering.
**Writes** go through Server Actions, except where a genuine JSON API is more
appropriate (matching, which is called from the client on demand).

## 3. Persistence and the data model

MySQL 8.4 via Prisma. The full schema is in `prisma/schema.prisma`; the
decisions worth defending:

**Join tables instead of JSON columns.** MySQL has no scalar array type. The
lazy fix is a JSON column of jurisdiction codes. I used real join tables
(`buyer_target_jurisdictions`, `buyer_target_categories`,
`buyer_target_business_types`, `asset_features`) because these are exactly the
columns users filter on, and a JSON column cannot be indexed usefully for
`WHERE jurisdiction IN (...)`. This is the difference between a data model that
survives 50k listings and one that does not.

**Reference tables, not enums, for the taxonomy.** Jurisdictions and licence
categories live in tables. N5Deal operates in 30+ jurisdictions and that list
moves with regulation; adding Georgia should be an INSERT, not a migration.
Conversely `BusinessType`, `InvestorType` and the status fields *are* enums —
they are closed sets that only change when the product changes.

**Three-state user lifecycle.** `ACTIVE / SUSPENDED / REMOVED`. Removal is a
soft delete. A hard delete would either orphan or cascade away conversations and
moderation history, and in a regulated-industry marketplace "who removed this
participant and why" must remain answerable. Suspension is reversible and hides
the participant everywhere public; removal is terminal.

**Money is `DECIMAL(18,2)`, in EUR, always.** Never a float. A single currency
for the prototype with the column typed for real amounts; multi-currency would
mean storing an amount plus a currency code plus a rate-at-time-of-quote, which
is a whole feature.

**One conversation per (buyer, seller, asset).** Enforced by a unique
constraint. Clicking "Contact" twice must land in the existing thread, not
create a second one — otherwise the inbox degrades into duplicates on day one.
`assetId` is nullable because a seller contacting a buyer from the directory is
not talking about one specific listing yet.

**`referenceCode` as a public integer.** N5Deal's own listings are quoted as
`#750`. Internal ids stay cuids; the reference code is the human handle.

## 4. Authentication and authorisation

Custom, server-side sessions rather than a library, and rather than JWT. The
reasoning is a product constraint, not preference:

> A platform manager must be able to suspend a participant **and have it take
> effect immediately.**

A stateless JWT stays valid until it expires. A suspended user would keep
browsing, keep messaging, keep appearing, until their token aged out. With a
session row, the guard re-reads the user's status on every request, and a
suspension takes effect on the participant's very next click. That single
requirement rules out the default Auth.js credentials setup, so I wrote the
~120 lines instead.

Mechanics: bcrypt password hashing; a 256-bit random token in an
`httpOnly`, `sameSite=lax`, `secure`-in-production cookie; only the SHA-256
hash of that token is stored, so a database leak does not hand over live
sessions; sessions expire and are cleaned up lazily.

Authorisation is a set of server-side guards (`requireUser`, `requireRole`)
called inside the server modules — never in a component and never only in
middleware. Middleware does a cheap cookie check to redirect anonymous traffic;
it is UX, not security. The real check is next to the data.

## 5. Product flows

**Buyer.** Sign up → guided profile: mandate (jurisdictions, licence
categories, business types), cheque size, timeline, free-text thesis → browse
`/assets` with facets → asset detail → contact seller (thread opens pre-filled
with the listing context) → watchlist.

**Seller.** Sign up → company profile → publish a listing through a multi-step
form with per-step validation → see it in "My listings" as a draft, publish when
ready → browse the buyer directory, filtered and ranked by fit against a chosen
listing → contact a buyer.

**Platform manager.** A console with three tabs (buyers, sellers, assets),
each searchable and filterable, plus a moderation queue. Every action requires
a written reason and is appended to the audit trail, which is visible on each
participant's detail view.

The one UX decision I want to call out: the seller's buyer directory is not a
flat list. It is ranked *against a selected listing*, because "browse buyers" in
the abstract is useless — a seller always browses buyers **for** something.

## 6. Search and filtering

Faceted filters are composed into a single Prisma `where` and pushed into
URL search params, so a filtered view is shareable, bookmarkable and survives
refresh. Pagination is offset-based; keyset pagination would be the right call
at scale but offset is honest at this data volume.

Text search uses `LIKE` over title/summary rather than a MySQL `FULLTEXT`
index. I prototyped the fulltext index and removed it: combining
`MATCH ... AGAINST` with eight optional facets means dropping to raw SQL and
rebuilding the filter composition by hand, and at demo data volume it buys
nothing measurable. At real volume the answer is not fulltext either — it is a
dedicated search index. Documented rather than half-built.

## 7. AI functionality

Two features, both designed so that **the product works with the API key
absent**:

**Match scoring (deterministic).** A pure function scores a buyer against an
asset on jurisdiction overlap, licence category, business type, cheque-size fit,
operating-vs-dormant preference and timeline, and returns a score plus the
human-readable reasons behind it. It is a plain function with unit tests — no
network, no latency, no non-determinism. This powers the ranking in both
directions.

**AI explanation and natural-language filtering (Gemini).** On top of the
deterministic score, Gemini turns a free-text query ("EMI in the Baltics under
two million, already trading") into a structured filter object — requested with
`responseSchema` and then re-validated with Zod, so a hallucinated jurisdiction
code is dropped before it can reach a query — and writes a short rationale for a
listing using the buyer's thesis text. If `GEMINI_API_KEY` is unset or the call
fails, the UI falls back to the deterministic path with a notice.

The split is the point: the LLM does language, not arithmetic. Ranking that
users act on stays explainable and testable.

## 8. Edge cases handled

- Suspending a user takes effect on their next request; their listings leave the
  public index and their threads become read-only.
- A removed participant's conversations survive, rendered as "participant no
  longer on the platform".
- Contacting the same seller about the same asset twice reuses the thread.
- An asset whose seller is suspended is hidden from search even if the asset
  itself is `PUBLISHED`.
- A buyer with `ticketMin > ticketMax` is rejected at the schema level, not by
  the UI alone.
- A manager cannot suspend or remove themselves, and cannot remove another
  manager.
- Deleted assets keep their conversations via `onDelete: SetNull`.
- Listings priced "on request" (`askingPriceEur = null`) are not silently
  dropped by a price-range filter.

## 9. What I would do next

In priority order: keyset pagination and a real search index; an outbox +
notification service for message emails; file uploads with a permissioned data
room per deal; multi-currency with stored rates; rate limiting on contact
actions to stop broker spam; end-to-end tests over the three role journeys;
migrating the moderation audit trail into a general append-only event log that
the Laravel side can also write to, which is the natural seam for the
legacy-to-Next.js migration described in the role.
