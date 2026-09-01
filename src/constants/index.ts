export * from "./domain";
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
