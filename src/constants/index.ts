export * from "./domain";
export * from "./forms";
export * from "./moderation";
export * from "./labels";

/** Cards per page in the two public catalogues. */
export const CATALOGUE_PAGE_SIZE = 9;

/** Rows per page in the manager tables — denser layout, so more of them. */
export const ADMIN_PAGE_SIZE = 15;

/**
 * How many rows a match-sorted query pulls before ranking in memory. The score
 * is not a column, so it cannot be ordered in SQL; this caps the cost until the
 * score is precomputed.
 */
export const MATCH_SORT_SCAN_LIMIT = 200;

export const SESSION_TTL_DAYS = 7;

export const BCRYPT_ROUNDS = 10;

/** Password for every seeded demo account. Printed by `npm run db:seed`. */
export const DEMO_PASSWORD = "n5deal-demo-2026";

export const DEFAULT_CURRENCY = "EUR";

export const DEFAULT_LOCALE = "en-GB";

export const MATCH_SECTIONS = [
  {
    band: "strong",
    title: "Strong matches",
    hint: "These line up with your mandate on jurisdiction, licence type and budget.",
  },
  {
    band: "good",
    title: "Worth a look",
    hint: "Close, but one axis is off — usually price or business model.",
  },
  {
    band: "partial",
    title: "Partial matches",
    hint: "Included for completeness. Expect at least one significant mismatch.",
  },
] as const;

export const SIGN_UP_ROLE_OPTIONS = [
  { value: "BUYER", title: "Buyer", hint: "Looking to acquire a licensed company" },
  { value: "SELLER", title: "Seller", hint: "Listing a company or licence for sale" },
] as const;
