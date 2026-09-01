/**
 * The closed sets the product is built on.
 *
 * These mirror the Prisma enums. They live here rather than being imported from
 * `@prisma/client` because client components need them too, and pulling the
 * Prisma runtime into the browser bundle for a list of six strings is a bad
 * trade.
 */

export const ROLES = ["BUYER", "SELLER", "PLATFORM_MANAGER"] as const;

export const USER_STATUSES = ["ACTIVE", "SUSPENDED", "REMOVED"] as const;

export const INVESTOR_TYPES = [
  "STRATEGIC",
  "PRIVATE_EQUITY",
  "VENTURE_CAPITAL",
  "FAMILY_OFFICE",
  "ANGEL",
  "CORPORATE",
  "OTHER",
] as const;

export const TIMELINES = ["IMMEDIATE", "SHORT", "MEDIUM", "EXPLORING"] as const;

export const SELLER_TYPES = ["OWNER", "BROKER", "ADVISORY_FIRM"] as const;

export const BUSINESS_TYPES = [
  "PAYMENT",
  "FINTECH",
  "CRYPTO",
  "BANKING",
  "FOREX",
  "GAMING",
  "OTHER",
] as const;

export const LICENCE_STATUSES = ["ACTIVE", "IN_APPLICATION", "DORMANT"] as const;

export const ASSET_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "UNDER_OFFER",
  "SOLD",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const ASSET_FEATURES = [
  "STAFF",
  "OFFICE",
  "BANK_ACCOUNTS",
  "MULTI_CURRENCY",
  "SOFTWARE_PLATFORM",
  "PAYMENT_RAILS",
  "CLIENT_BASE",
  "SECURITY_AUDIT",
] as const;

export const MODERATION_ACTION_TYPES = [
  "USER_SUSPEND",
  "USER_REINSTATE",
  "USER_REMOVE",
  "ASSET_SUSPEND",
  "ASSET_REINSTATE",
  "SELLER_VERIFY",
] as const;

/** Statuses a listing can hold and still appear in the public marketplace. */
export const PUBLIC_ASSET_STATUSES = ["PUBLISHED", "UNDER_OFFER", "SOLD"] as const;

/** The lifecycle transitions a seller may drive themselves — SUSPENDED is a
 *  platform-manager decision and deliberately absent. */
export const SELLER_MANAGED_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "UNDER_OFFER",
  "SOLD",
  "ARCHIVED",
] as const;
