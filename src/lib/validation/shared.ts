import { z } from "zod";

export const optionalUrl = z
  .string()
  .trim()
  .url("Enter a full URL")
  .max(300)
  .optional()
  .or(z.literal(""));

export const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const countryCode = z.string().trim().length(2, "Two-letter country code").toUpperCase();

export const money = (message = "Enter an amount") =>
  z.number({ invalid_type_error: message }).min(0, "Cannot be negative").max(10_000_000_000);

export const csv = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (value == null) return [] as string[];

    const parts = Array.isArray(value) ? value : value.split(",");
    return parts.map((part) => part.trim()).filter(Boolean);
  });

export const booleanParam = (fallback = false) =>
  z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined) return fallback;
      return value === "true" || value === true;
    });

export const pageParam = z.coerce.number().int().min(1).default(1);
