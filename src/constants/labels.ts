/**
 * Enum value → human copy. Single source, so a status reads identically on a
 * card, in a table and in an audit entry.
 */

export const LICENCE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Operating",
  IN_APPLICATION: "In application",
  DORMANT: "Licence only",
};

export const ASSET_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  UNDER_OFFER: "Under offer",
  SOLD: "Sold",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

export const USER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  REMOVED: "Removed",
};

export const TIMELINE_LABEL: Record<string, string> = {
  IMMEDIATE: "Immediate (under 3 months)",
  SHORT: "3–6 months",
  MEDIUM: "6–12 months",
  EXPLORING: "Exploring",
};

/** Longer form, used where the field is being chosen rather than read back. */
export const TIMELINE_OPTION_LABEL: Record<string, string> = {
  IMMEDIATE: "Immediate — under 3 months",
  SHORT: "3–6 months",
  MEDIUM: "6–12 months",
  EXPLORING: "Exploring, no fixed horizon",
};

export const FEATURE_LABEL: Record<string, string> = {
  STAFF: "Staff",
  OFFICE: "Office",
  BANK_ACCOUNTS: "Bank accounts",
  MULTI_CURRENCY: "Multi-currency",
  SOFTWARE_PLATFORM: "Software platform",
  PAYMENT_RAILS: "Payment rails",
  CLIENT_BASE: "Client base",
  SECURITY_AUDIT: "Security audit",
};

export const MATCH_BAND_LABEL: Record<string, string> = {
  strong: "Strong match",
  good: "Good match",
  partial: "Partial match",
  weak: "Weak match",
};
