import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";
import { getBuyerProfile, toMatchableBuyer } from "@/server/buyers/queries";
import { explainMatch } from "@/server/matching/ai";
import { scoreMatch } from "@/server/matching/score";
import { LICENCE_STATUS_LABEL, humanise } from "@/lib/format";

const bodySchema = z.object({ assetId: z.string().trim().min(1).max(40) });

/**
 * Writes a short rationale for one listing against the signed-in buyer's
 * thesis. The score itself is computed here, deterministically — the model is
 * only handed the result to describe.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "BUYER") {
    return NextResponse.json({ ok: false, reason: "unauthorised" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const [profile, asset] = await Promise.all([
    getBuyerProfile(user.id),
    prisma.asset.findUnique({
      where: { id: parsed.data.assetId },
      include: { jurisdiction: true, category: true, seller: { select: { status: true } } },
    }),
  ]);

  if (!profile?.investmentThesis || !asset) {
    return NextResponse.json({ ok: false, reason: "not_available" }, { status: 200 });
  }

  // Do not explain a listing the buyer is not allowed to see.
  if (asset.seller.status !== "ACTIVE" || !["PUBLISHED", "UNDER_OFFER", "SOLD"].includes(asset.status)) {
    return NextResponse.json({ ok: false, reason: "not_available" }, { status: 200 });
  }

  const match = scoreMatch(toMatchableBuyer(profile), {
    jurisdictionCode: asset.jurisdictionCode,
    categoryCode: asset.categoryCode,
    businessType: asset.businessType,
    askingPriceEur: asset.askingPriceEur ? Number(asset.askingPriceEur) : null,
    licenceStatus: asset.licenceStatus,
    isValidated: asset.isValidated,
  });

  const explanation = await explainMatch({
    thesis: profile.investmentThesis,
    match,
    asset: {
      assetTitle: asset.title,
      jurisdiction: asset.jurisdiction.name,
      category: `${asset.category.name} (${asset.category.code})`,
      licenceStatus: LICENCE_STATUS_LABEL[asset.licenceStatus] ?? humanise(asset.licenceStatus),
      askingPriceEur: asset.askingPriceEur ? Number(asset.askingPriceEur) : null,
      summary: asset.summary,
    },
  });

  if (!explanation) {
    return NextResponse.json({ ok: false, reason: "unavailable" }, { status: 200 });
  }

  return NextResponse.json({ ok: true, explanation });
}
