import { z } from "zod";

import {
  ASSET_FEATURES,
  BUSINESS_TYPES,
  INVESTOR_TYPES,
  LICENCE_STATUSES,
  SELLER_TYPES,
  TIMELINES,
} from "@/constants";

/**
 * One schema per concept, shared by the form (react-hook-form resolver), the
 * Server Action and the Route Handler. A rule written here cannot be bypassed
 * by posting straight to the endpoint, which is the point: the UI is not a
 * validation layer.
 */

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

const password = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(200, "That is too long");

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Tell us your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password,
  // Managers are seeded, never self-registered.
  role: z.enum(["BUYER", "SELLER"]),
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export const buyerProfileSchema = z
  .object({
    companyName: z.string().trim().min(2).max(160),
    headline: z.string().trim().min(10, "One line on what you are looking for").max(180),
    about: z.string().trim().min(20, "Sellers need context to take you seriously").max(4000),
    websiteUrl: z.string().trim().url("Enter a full URL").max(300).optional().or(z.literal("")),
    country: z.string().trim().length(2, "Two-letter country code").toUpperCase(),
    investorType: z.enum(INVESTOR_TYPES),
    ticketMinEur: z.number({ invalid_type_error: "Enter an amount" }).min(0, "Cannot be negative").max(10_000_000_000),
    ticketMaxEur: z.number({ invalid_type_error: "Enter an amount" }).min(0).max(10_000_000_000),
    timeline: z.enum(TIMELINES),
    wantsOperatingOnly: z.boolean(),
    proofOfFundsReady: z.boolean(),
    investmentThesis: z.string().trim().max(4000).optional().or(z.literal("")),
    isPublished: z.boolean(),
    targetJurisdictions: z.array(z.string().max(8)).min(1, "Pick at least one jurisdiction"),
    targetCategories: z.array(z.string().max(32)).min(1, "Pick at least one licence type"),
    targetBusinessTypes: z.array(z.enum(BUSINESS_TYPES)),
  })
  .refine((data) => data.ticketMaxEur >= data.ticketMinEur, {
    message: "Maximum cheque size cannot be below the minimum",
    path: ["ticketMaxEur"],
  });

export const sellerProfileSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  headline: z.string().trim().min(10).max(180),
  about: z.string().trim().min(20).max(4000),
  websiteUrl: z.string().trim().url().max(300).optional().or(z.literal("")),
  country: z.string().trim().length(2).toUpperCase(),
  sellerType: z.enum(SELLER_TYPES),
  operatesIn: z.array(z.string().max(8)),
});

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

const currentYear = new Date().getFullYear();

export const assetSchema = z
  .object({
    title: z.string().trim().min(10, "Give the listing a descriptive title").max(180),
    summary: z.string().trim().min(20, "One or two lines buyers see in the list").max(400),
    description: z.string().trim().min(50, "Buyers need the detail").max(20_000),
    jurisdictionCode: z.string().trim().min(2).max(8),
    categoryCode: z.string().trim().min(2).max(32),
    businessType: z.enum(BUSINESS_TYPES),
    askingPriceEur: z.number().min(0).max(10_000_000_000).nullable(),
    revenueEur: z.number().min(0).max(10_000_000_000).nullable(),
    ebitdaEur: z.number().max(10_000_000_000).nullable(),
    licenceStatus: z.enum(LICENCE_STATUSES),
    regulator: z.string().trim().max(120).optional().or(z.literal("")),
    licenceIssuedYear: z.number().int().min(1900).max(currentYear).nullable(),
    yearEstablished: z.number().int().min(1800).max(currentYear).nullable(),
    employees: z.number().int().min(0).max(1_000_000).nullable(),
    activeClients: z.number().int().min(0).max(100_000_000).nullable(),
    hasPassporting: z.boolean(),
    reasonForSale: z.string().trim().max(2000).optional().or(z.literal("")),
    features: z.array(z.enum(ASSET_FEATURES)),
  })
  .refine(
    (data) =>
      data.licenceIssuedYear == null ||
      data.yearEstablished == null ||
      data.licenceIssuedYear >= data.yearEstablished,
    {
      message: "A licence cannot be issued before the company existed",
      path: ["licenceIssuedYear"],
    },
  )
  .refine(
    (data) =>
      data.ebitdaEur == null || data.revenueEur == null || data.ebitdaEur <= data.revenueEur,
    { message: "EBITDA cannot exceed revenue", path: ["ebitdaEur"] },
  );

// ---------------------------------------------------------------------------
// Search / filtering
// ---------------------------------------------------------------------------

/** Comma-separated query params ("LT,MT") arrive as strings; normalise to arrays. */
const csv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (value == null) return [] as string[];
    const parts = Array.isArray(value) ? value : value.split(",");
    return parts.map((part) => part.trim()).filter(Boolean);
  });

export const assetFilterSchema = z.object({
  q: z.string().trim().max(200).optional(),
  jurisdictions: csv,
  categories: csv,
  businessTypes: csv,
  licenceStatuses: csv,
  features: csv,
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  /** Listings without a price are "on request" — they must not be silently
   *  dropped when a buyer sets a budget ceiling. */
  includeOnRequest: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => value === undefined || value === "true" || value === true),
  validatedOnly: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => value === "true" || value === true),
  sort: z.enum(["recent", "price_asc", "price_desc", "match"]).default("recent"),
  page: z.coerce.number().int().min(1).default(1),
});

export const buyerFilterSchema = z.object({
  q: z.string().trim().max(200).optional(),
  jurisdictions: csv,
  categories: csv,
  businessTypes: csv,
  investorTypes: csv,
  timelines: csv,
  ticketMin: z.coerce.number().min(0).optional(),
  proofOfFundsOnly: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => value === "true" || value === true),
  /** When set, the directory is ranked by fit against this listing. */
  forAssetId: z.string().trim().max(40).optional(),
  sort: z.enum(["recent", "match", "ticket_desc"]).default("recent"),
  page: z.coerce.number().int().min(1).default(1),
});

export const participantFilterSchema = z.object({
  q: z.string().trim().max(200).optional(),
  role: z.enum(["BUYER", "SELLER", "PLATFORM_MANAGER"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "REMOVED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

// ---------------------------------------------------------------------------
// Messaging & moderation
// ---------------------------------------------------------------------------

export const startConversationSchema = z.object({
  assetId: z.string().trim().max(40).optional(),
  counterpartyId: z.string().trim().min(1).max(40),
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10, "Write at least a sentence").max(10_000),
});

export const replySchema = z.object({
  conversationId: z.string().trim().min(1).max(40),
  body: z.string().trim().min(1).max(10_000),
});

export const moderationSchema = z.object({
  type: z.enum([
    "USER_SUSPEND",
    "USER_REINSTATE",
    "USER_REMOVE",
    "ASSET_SUSPEND",
    "ASSET_REINSTATE",
    "SELLER_VERIFY",
  ]),
  targetUserId: z.string().trim().max(40).optional(),
  targetAssetId: z.string().trim().max(40).optional(),
  // A written reason is mandatory: the audit trail is worthless without it.
  reason: z.string().trim().min(10, "Record why you are doing this").max(2000),
});

export const smartQuerySchema = z.object({
  query: z.string().trim().min(3, "Describe what you are looking for").max(500),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type BuyerProfileInput = z.infer<typeof buyerProfileSchema>;
export type SellerProfileInput = z.infer<typeof sellerProfileSchema>;
export type AssetInput = z.infer<typeof assetSchema>;
export type AssetFilters = z.infer<typeof assetFilterSchema>;
export type BuyerFilters = z.infer<typeof buyerFilterSchema>;
export type ParticipantFilters = z.infer<typeof participantFilterSchema>;
export type ModerationInput = z.infer<typeof moderationSchema>;
