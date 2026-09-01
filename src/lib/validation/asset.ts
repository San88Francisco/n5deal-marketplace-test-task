import { z } from "zod";

import { ASSET_FEATURES, BUSINESS_TYPES, LICENCE_STATUSES } from "@/constants";
import { optionalText } from "@/lib/validation/shared";

const currentYear = new Date().getFullYear();

const nullableMoney = z.number().min(0).max(10_000_000_000).nullable();
const nullableYear = (min: number) => z.number().int().min(min).max(currentYear).nullable();

export const assetSchema = z
  .object({
    title: z.string().trim().min(10, "Give the listing a descriptive title").max(180),
    summary: z.string().trim().min(20, "One or two lines buyers see in the list").max(400),
    description: z.string().trim().min(50, "Buyers need the detail").max(20_000),
    jurisdictionCode: z.string().trim().min(2).max(8),
    categoryCode: z.string().trim().min(2).max(32),
    businessType: z.enum(BUSINESS_TYPES),
    askingPriceEur: nullableMoney,
    revenueEur: nullableMoney,
    ebitdaEur: z.number().max(10_000_000_000).nullable(),
    licenceStatus: z.enum(LICENCE_STATUSES),
    regulator: optionalText(120),
    licenceIssuedYear: nullableYear(1900),
    yearEstablished: nullableYear(1800),
    employees: z.number().int().min(0).max(1_000_000).nullable(),
    activeClients: z.number().int().min(0).max(100_000_000).nullable(),
    hasPassporting: z.boolean(),
    reasonForSale: optionalText(2000),
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
    (data) => data.ebitdaEur == null || data.revenueEur == null || data.ebitdaEur <= data.revenueEur,
    { message: "EBITDA cannot exceed revenue", path: ["ebitdaEur"] },
  );

export type AssetInput = z.infer<typeof assetSchema>;
