const toEnum = <T extends readonly string[]>(values: T) =>
  Object.fromEntries(values.map((value) => [value, value])) as { [K in T[number]]: K };

export const ROLES = ["BUYER", "SELLER", "PLATFORM_MANAGER"] as const;
export const USER_STATUSES = ["ACTIVE", "SUSPENDED", "REMOVED"] as const;
export const AUTH_STATUSES = ["anonymous", "suspended", "active"] as const;

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

export const ASSET_SORTS = ["recent", "match", "price_asc", "price_desc"] as const;
export const BUYER_SORTS = ["recent", "match", "ticket_desc"] as const;
export const MATCH_BANDS = ["strong", "good", "partial", "weak"] as const;

export const USER_ROLE = toEnum(ROLES);
export const USER_STATUS = toEnum(USER_STATUSES);
export const AUTH_STATUS = toEnum(AUTH_STATUSES);
export const INVESTOR_TYPE = toEnum(INVESTOR_TYPES);
export const TIMELINE = toEnum(TIMELINES);
export const SELLER_TYPE = toEnum(SELLER_TYPES);
export const BUSINESS_TYPE = toEnum(BUSINESS_TYPES);
export const LICENCE_STATUS = toEnum(LICENCE_STATUSES);
export const ASSET_STATUS = toEnum(ASSET_STATUSES);
export const ASSET_FEATURE = toEnum(ASSET_FEATURES);
export const MODERATION_ACTION = toEnum(MODERATION_ACTION_TYPES);
export const ASSET_SORT = toEnum(ASSET_SORTS);
export const BUYER_SORT = toEnum(BUYER_SORTS);
export const MATCH_BAND_VALUE = toEnum(MATCH_BANDS);

export const PUBLIC_ASSET_STATUSES = [
  ASSET_STATUS.PUBLISHED,
  ASSET_STATUS.UNDER_OFFER,
  ASSET_STATUS.SOLD,
] as const;

export const SELLER_MANAGED_STATUSES = [
  ASSET_STATUS.DRAFT,
  ASSET_STATUS.PUBLISHED,
  ASSET_STATUS.UNDER_OFFER,
  ASSET_STATUS.SOLD,
  ASSET_STATUS.ARCHIVED,
] as const;

export const CONTACTABLE_ROLES = [USER_ROLE.BUYER, USER_ROLE.SELLER] as const;
