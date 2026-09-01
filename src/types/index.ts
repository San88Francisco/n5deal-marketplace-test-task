import type {
  ASSET_FEATURES,
  MATCH_BANDS,
  ASSET_STATUSES,
  BUSINESS_TYPES,
  INVESTOR_TYPES,
  LICENCE_STATUSES,
  ROLES,
  SELLER_TYPES,
  TIMELINES,
  USER_STATUSES,
} from "@/constants";

/**
 * Types shared across layers. Anything that describes a single module's
 * internals stays with that module; what travels between server, action and
 * component lives here.
 */

export type UserRole = (typeof ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type InvestorType = (typeof INVESTOR_TYPES)[number];
export type AcquisitionTimeline = (typeof TIMELINES)[number];
export type SellerType = (typeof SELLER_TYPES)[number];
export type BusinessType = (typeof BUSINESS_TYPES)[number];
export type LicenceStatus = (typeof LICENCE_STATUSES)[number];
export type AssetStatus = (typeof ASSET_STATUSES)[number];
export type AssetFeatureCode = (typeof ASSET_FEATURES)[number];
export type MatchBand = (typeof MATCH_BANDS)[number];

/** What every Server Action returns to a form. */
export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Actions that report success rather than redirecting. */
export type SaveResult = { ok: true } | { ok: false; error: string };

/** One page of results from a paginated query. */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
};

/** Query-string values as Next.js hands them to a page. */
export type SearchParams = Record<string, string | string[] | undefined>;

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

/** Reference-table rows, as passed into forms and filter sidebars. */
export type JurisdictionOption = {
  code: string;
  name: string;
  region?: string;
};

export type CategoryOption = {
  code: string;
  name: string;
};

export type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

export type FilterGroupConfig = {
  key: string;
  title: string;
  options: FilterOption[];
};

export type ContactableRole = Extract<UserRole, "BUYER" | "SELLER">;
