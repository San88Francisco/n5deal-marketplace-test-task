import { z } from "zod";

import { ASSET_SORTS, ASSET_STATUSES, BUYER_SORTS, ROLES, USER_STATUSES } from "@/constants";
import { booleanParam, csv, pageParam } from "@/lib/validation/shared";

const searchTerm = z.string().trim().max(200).optional();

export const assetFilterSchema = z.object({
  q: searchTerm,
  jurisdictions: csv,
  categories: csv,
  businessTypes: csv,
  licenceStatuses: csv,
  features: csv,
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  includeOnRequest: booleanParam(true),
  validatedOnly: booleanParam(),
  sort: z.enum(ASSET_SORTS).default(ASSET_SORTS[0]),
  page: pageParam,
});

export const buyerFilterSchema = z.object({
  q: searchTerm,
  jurisdictions: csv,
  categories: csv,
  businessTypes: csv,
  investorTypes: csv,
  timelines: csv,
  ticketMin: z.coerce.number().min(0).optional(),
  proofOfFundsOnly: booleanParam(),
  forAssetId: z.string().trim().max(40).optional(),
  sort: z.enum(BUYER_SORTS).default(BUYER_SORTS[0]),
  page: pageParam,
});

export const participantFilterSchema = z.object({
  q: searchTerm,
  role: z.enum(ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  page: pageParam,
});

export const managedAssetFilterSchema = z.object({
  q: searchTerm,
  status: z.enum(ASSET_STATUSES).optional(),
  page: pageParam,
});

export type AssetFilters = z.infer<typeof assetFilterSchema>;
export type BuyerFilters = z.infer<typeof buyerFilterSchema>;
export type ParticipantFilters = z.infer<typeof participantFilterSchema>;
export type ManagedAssetFilters = z.infer<typeof managedAssetFilterSchema>;
