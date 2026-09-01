export * from "./domain";
export * from "./forms";
export * from "./moderation";
export * from "./labels";

export const CATALOGUE_PAGE_SIZE = 9;

export const ADMIN_PAGE_SIZE = 15;

export const MATCH_SORT_SCAN_LIMIT = 200;

export const SESSION_TTL_DAYS = 7;

export const BCRYPT_ROUNDS = 10;

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

export const SELLER_LISTING_COLUMNS = [
  "Listing",
  "Status",
  "Price",
  "Engagement",
  "Updated",
  "",
] as const;

export const PARTICIPANT_COLUMNS = [
  "Participant",
  "Role",
  "Status",
  "Detail",
  "Joined",
  "",
] as const;

export const MANAGED_LISTING_COLUMNS = [
  "Listing",
  "Seller",
  "Status",
  "Price",
  "Updated",
  "",
] as const;

export const PARTICIPANT_FILTER_SELECTS = [
  {
    key: "role",
    label: "Role",
    options: [
      { value: "", label: "All roles" },
      { value: "BUYER", label: "Buyers" },
      { value: "SELLER", label: "Sellers" },
      { value: "PLATFORM_MANAGER", label: "Managers" },
    ],
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "", label: "All statuses" },
      { value: "ACTIVE", label: "Active" },
      { value: "SUSPENDED", label: "Suspended" },
      { value: "REMOVED", label: "Removed" },
    ],
  },
];

export const MANAGED_LISTING_FILTER_SELECTS = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "", label: "All statuses" },
      { value: "PUBLISHED", label: "Published" },
      { value: "UNDER_OFFER", label: "Under offer" },
      { value: "DRAFT", label: "Draft" },
      { value: "SOLD", label: "Sold" },
      { value: "SUSPENDED", label: "Suspended" },
      { value: "ARCHIVED", label: "Archived" },
    ],
  },
];
