import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import { BUSINESS_TYPES, LICENCE_STATUSES } from "@/lib/validation";
import type { MatchResult } from "@/server/matching/score";

/**
 * The AI layer.
 *
 * Design rule: the LLM does language, never arithmetic. It turns a sentence
 * into a filter object and writes a rationale for a score computed elsewhere.
 * Ranking stays in ./score.ts where it is deterministic and unit-tested.
 *
 * Every function here degrades to a usable result when ANTHROPIC_API_KEY is
 * absent or the call fails, because a demo that dies without a key is not a
 * demo.
 */

const MODEL = "claude-opus-5";

let client: Anthropic | null | undefined;

function getClient(): Anthropic | null {
  if (client !== undefined) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  client = apiKey ? new Anthropic({ apiKey }) : null;
  return client;
}

export function isAiEnabled(): boolean {
  return getClient() !== null;
}

// ---------------------------------------------------------------------------
// Natural-language filtering
// ---------------------------------------------------------------------------

/**
 * The model's output is validated against this before it reaches the database.
 * A hallucinated jurisdiction code or an invented field is dropped here rather
 * than turned into a query.
 */
const parsedQuerySchema = z.object({
  jurisdictions: z.array(z.string().max(8)).max(20).default([]),
  categories: z.array(z.string().max(32)).max(20).default([]),
  businessTypes: z.array(z.enum(BUSINESS_TYPES)).max(10).default([]),
  licenceStatuses: z.array(z.enum(LICENCE_STATUSES)).max(3).default([]),
  priceMin: z.number().min(0).max(10_000_000_000).nullable().default(null),
  priceMax: z.number().min(0).max(10_000_000_000).nullable().default(null),
  validatedOnly: z.boolean().default(false),
  keywords: z.string().max(200).nullable().default(null),
  interpretation: z.string().max(300),
});

export type ParsedQuery = z.infer<typeof parsedQuerySchema>;

export type SmartQueryResult =
  | { ok: true; filters: ParsedQuery }
  | { ok: false; reason: "disabled" | "failed" | "unparsable" };

export async function parseSmartQuery(
  query: string,
  taxonomy: {
    jurisdictions: { code: string; name: string }[];
    categories: { code: string; name: string }[];
  },
): Promise<SmartQueryResult> {
  const anthropic = getClient();
  if (!anthropic) return { ok: false, reason: "disabled" };

  const jurisdictionList = taxonomy.jurisdictions
    .map((j) => `${j.code} (${j.name})`)
    .join(", ");
  const categoryList = taxonomy.categories.map((c) => `${c.code} (${c.name})`).join(", ");

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      // Parsing one sentence into a filter object does not need deep reasoning;
      // low effort keeps the search box responsive.
      output_config: { effort: "low" },
      system: [
        "You convert a plain-English search request into filters for a marketplace of regulated financial companies and licences.",
        "Only use codes from the lists provided. If the request does not mention something, leave that filter empty — never guess.",
        "Amounts are in EUR. Interpret 'under 2m' as priceMax 2000000, 'at least 500k' as priceMin 500000.",
        "'Trading', 'operating' or 'live' means licenceStatuses ACTIVE. 'Shelf', 'clean' or 'dormant' means DORMANT.",
        "Put anything you could not map to a filter into keywords, or null if nothing is left.",
        "interpretation is one short sentence, addressed to the user, describing what you filtered for.",
        `Jurisdiction codes: ${jurisdictionList}`,
        `Licence category codes: ${categoryList}`,
      ].join("\n"),
      tools: [
        {
          name: "apply_filters",
          description: "Apply the filters extracted from the user's request.",
          strict: true,
          input_schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              jurisdictions: { type: "array", items: { type: "string" } },
              categories: { type: "array", items: { type: "string" } },
              businessTypes: {
                type: "array",
                items: { type: "string", enum: [...BUSINESS_TYPES] },
              },
              licenceStatuses: {
                type: "array",
                items: { type: "string", enum: [...LICENCE_STATUSES] },
              },
              priceMin: { type: ["number", "null"] },
              priceMax: { type: ["number", "null"] },
              validatedOnly: { type: "boolean" },
              keywords: { type: ["string", "null"] },
              interpretation: { type: "string" },
            },
            required: [
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
      ],
      tool_choice: { type: "tool", name: "apply_filters" },
      messages: [{ role: "user", content: query }],
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") return { ok: false, reason: "unparsable" };

    const parsed = parsedQuerySchema.safeParse(toolUse.input);
    if (!parsed.success) return { ok: false, reason: "unparsable" };

    // Drop any code the model invented despite the instruction.
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

// ---------------------------------------------------------------------------
// Match rationale
// ---------------------------------------------------------------------------

export type MatchBrief = {
  assetTitle: string;
  jurisdiction: string;
  category: string;
  licenceStatus: string;
  askingPriceEur: number | null;
  summary: string;
};

/**
 * Writes two or three sentences explaining a score the scoring engine already
 * produced, using the buyer's own thesis text — the part a rules engine cannot
 * read. Returns null rather than throwing when AI is unavailable; callers show
 * the deterministic factor breakdown instead.
 */
export async function explainMatch(params: {
  thesis: string;
  match: MatchResult;
  asset: MatchBrief;
}): Promise<string | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      output_config: { effort: "low" },
      system: [
        "You advise a buyer on a fintech M&A marketplace.",
        "You are given a listing, the buyer's investment thesis, and a match score that has ALREADY been calculated. Never recalculate or dispute the score.",
        "Write two or three sentences: what genuinely fits the thesis, then the single most important reservation.",
        "Be concrete and sober. No marketing language, no bullet points, no headings.",
        "If the concerns list is empty, still name the main diligence question a buyer should ask.",
      ].join("\n"),
      messages: [
        {
          role: "user",
          content: [
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
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    return text || null;
  } catch (error) {
    console.error("[ai] explainMatch failed", error);
    return null;
  }
}
