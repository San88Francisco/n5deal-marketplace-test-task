import { z } from "zod";

import { BUSINESS_TYPES, INVESTOR_TYPES, SELLER_TYPES, TIMELINES } from "@/constants";
import { countryCode, money, optionalText, optionalUrl } from "@/lib/validation/shared";

export const buyerProfileSchema = z
  .object({
    companyName: z.string().trim().min(2).max(160),
    headline: z.string().trim().min(10, "One line on what you are looking for").max(180),
    about: z.string().trim().min(20, "Sellers need context to take you seriously").max(4000),
    websiteUrl: optionalUrl,
    country: countryCode,
    investorType: z.enum(INVESTOR_TYPES),
    ticketMinEur: money(),
    ticketMaxEur: money(),
    timeline: z.enum(TIMELINES),
    wantsOperatingOnly: z.boolean(),
    proofOfFundsReady: z.boolean(),
    investmentThesis: optionalText(4000),
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
  websiteUrl: optionalUrl,
  country: countryCode,
  sellerType: z.enum(SELLER_TYPES),
  operatesIn: z.array(z.string().max(8)),
});

export type BuyerProfileInput = z.infer<typeof buyerProfileSchema>;
export type SellerProfileInput = z.infer<typeof sellerProfileSchema>;
