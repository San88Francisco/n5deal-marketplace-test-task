import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";
import { getBuyerProfile, toMatchableBuyer } from "@/server/buyers/queries";
import { explainMatch } from "@/server/matching/ai";
import { scoreMatch } from "@/server/matching/score";
import { LICENCE_STATUS_LABEL, USER_ROLE } from "@/constants";
import { humanise } from "@/utils/format";
import { safeJsonParse } from "@/utils/json";
import { isActive, isPublicAssetStatus } from "@/utils/domain";

const bodySchema = z.object({ assetId: z.string().trim().min(1).max(40) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== USER_ROLE.BUYER) {
    return NextResponse.json({ ok: false, reason: "unauthorised" }, { status: 401 });
  }

  const payload = safeJsonParse(await request.text());

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

  if (!isActive(asset.seller.status) || !isPublicAssetStatus(asset.status)) {
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
