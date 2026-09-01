import "server-only";

import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

import { BUSINESS_TYPES, LICENCE_STATUSES } from "@/constants";
import { safeJsonParse } from "@/utils/json";
import type { MatchResult } from "@/server/matching/score";

const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";

const clientCache: { current?: GoogleGenAI | null } = {};

function getClient(): GoogleGenAI | null {
  if (clientCache.current === undefined) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    clientCache.current = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  return clientCache.current;
}

export function isAiEnabled(): boolean {
  return getClient() !== null;
}

async function withRetry<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    const status = (error as { status?: number })?.status;
    if (status !== 503 && status !== 429) throw error;

    await new Promise((resolve) => setTimeout(resolve, 1200));
    return call();
  }
}

const parsedQuerySchema = z.object({
  jurisdictions: z.array(z.string().max(8)).max(20).default([]),
  categories: z.array(z.string().max(32)).max(20).default([]),
  businessTypes: z.array(z.enum(BUSINESS_TYPES)).max(10).catch([]).default([]),
  licenceStatuses: z.array(z.enum(LICENCE_STATUSES)).max(3).catch([]).default([]),
  priceMin: z.number().min(0).max(10_000_000_000).nullable().default(null),
  priceMax: z.number().min(0).max(10_000_000_000).nullable().default(null),
  validatedOnly: z.boolean().default(false),
  keywords: z.string().max(200).nullable().default(null),
  interpretation: z.string().max(300),
});

export type ParsedQuery = z.infer<typeof parsedQuerySchema>;

export type SmartQueryResult =
  { ok: true; filters: ParsedQuery } | { ok: false; reason: "disabled" | "failed" | "unparsable" };

export async function parseSmartQuery(
  query: string,
  taxonomy: {
    jurisdictions: { code: string; name: string }[];
    categories: { code: string; name: string }[];
  },
): Promise<SmartQueryResult> {
  const ai = getClient();
  if (!ai) return { ok: false, reason: "disabled" };

  const jurisdictionList = taxonomy.jurisdictions.map((j) => `${j.code} (${j.name})`).join(", ");
  const categoryList = taxonomy.categories.map((c) => `${c.code} (${c.name})`).join(", ");

  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: MODEL,
        contents: query,
        config: {
          systemInstruction: [
            "You convert a plain-English search request into filters for a marketplace of regulated financial companies and licences.",
            "Only use codes from the lists provided. If the request does not mention something, leave that filter empty — never guess.",
            "Amounts are in EUR. Interpret 'under 2m' as priceMax 2000000, 'at least 500k' as priceMin 500000.",
            "'Trading', 'operating' or 'live' means licenceStatuses ACTIVE. 'Shelf', 'clean shell' or 'dormant' means DORMANT — a 'clean record' or 'clean history' is not a licence status.",
            "Put anything you could not map to a filter into keywords, or null if nothing is left.",
            "interpretation is one short sentence, addressed to the user, describing what you filtered for.",
            `Jurisdiction codes: ${jurisdictionList}`,
            `Licence category codes: ${categoryList}`,
          ].join("\n"),

          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              jurisdictions: { type: Type.ARRAY, items: { type: Type.STRING } },
              categories: { type: Type.ARRAY, items: { type: Type.STRING } },
              businessTypes: {
                type: Type.ARRAY,
                items: { type: Type.STRING, enum: [...BUSINESS_TYPES] },
              },
              licenceStatuses: {
                type: Type.ARRAY,
                items: { type: Type.STRING, enum: [...LICENCE_STATUSES] },
              },
              priceMin: { type: Type.NUMBER, nullable: true },
              priceMax: { type: Type.NUMBER, nullable: true },
              validatedOnly: { type: Type.BOOLEAN },
              keywords: { type: Type.STRING, nullable: true },
              interpretation: { type: Type.STRING },
            },
            required: ["validatedOnly", "interpretation"],
            propertyOrdering: [
              "jurisdictions",
              "categories",
              "businessTypes",
              "licenceStatuses",
              "priceMin",
              "priceMax",
              "validatedOnly",
              "keywords",
              "interpretation",
            ],
          },
        },
      }),
    );

    const text = response.text?.trim();
    if (!text) return { ok: false, reason: "unparsable" };

    const parsed = parsedQuerySchema.safeParse(safeJsonParse(text));
    if (!parsed.success) return { ok: false, reason: "unparsable" };

    const validJurisdictions = new Set(taxonomy.jurisdictions.map((j) => j.code));
    const validCategories = new Set(taxonomy.categories.map((c) => c.code));

    return {
      ok: true,
      filters: {
        ...parsed.data,
        jurisdictions: parsed.data.jurisdictions.filter((code) => validJurisdictions.has(code)),
        categories: parsed.data.categories.filter((code) => validCategories.has(code)),
      },
    };
  } catch (error) {
    console.error("[ai] parseSmartQuery failed", error);
    return { ok: false, reason: "failed" };
  }
}

export type MatchBrief = {
  assetTitle: string;
  jurisdiction: string;
  category: string;
  licenceStatus: string;
  askingPriceEur: number | null;
  summary: string;
};

export async function explainMatch(params: {
  thesis: string;
  match: MatchResult;
  asset: MatchBrief;
}): Promise<string | null> {
  const ai = getClient();
  if (!ai) return null;

  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: MODEL,
        contents: [
          `Buyer thesis: ${params.thesis}`,
          "",
          `Listing: ${params.asset.assetTitle}`,
          `Jurisdiction: ${params.asset.jurisdiction}`,
          `Licence: ${params.asset.category} (${params.asset.licenceStatus})`,
          `Asking price: ${
            params.asset.askingPriceEur == null
              ? "on request"
              : `EUR ${params.asset.askingPriceEur.toLocaleString("en-GB")}`
          }`,
          `Summary: ${params.asset.summary}`,
          "",
          `Match score: ${params.match.score}/100`,
          `Positive factors: ${params.match.reasons.join("; ") || "none"}`,
          `Concerns: ${params.match.concerns.join("; ") || "none"}`,
        ].join("\n"),
        config: {
          systemInstruction: [
            "You advise a buyer on a fintech M&A marketplace.",
            "You are given a listing, the buyer's investment thesis, and a match score that has ALREADY been calculated. Never recalculate or dispute the score.",
            "Write two or three sentences: what genuinely fits the thesis, then the single most important reservation.",
            "Be concrete and sober. No marketing language, no bullet points, no headings.",
            "If the concerns list is empty, still name the main diligence question a buyer should ask.",
          ].join("\n"),
          maxOutputTokens: 900,
        },
      }),
    );

    return response.text?.trim() || null;
  } catch (error) {
    console.error("[ai] explainMatch failed", error);
    return null;
  }
}
