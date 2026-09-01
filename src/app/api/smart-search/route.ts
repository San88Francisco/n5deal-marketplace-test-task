import { NextResponse } from "next/server";

import { smartQuerySchema } from "@/lib/validation";
import { getTaxonomy } from "@/server/assets/queries";
import { parseSmartQuery } from "@/server/matching/ai";
import { getCurrentUser } from "@/server/auth/session";
import { safeJsonParse } from "@/utils/json";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: "unauthorised" }, { status: 401 });
  }

  const payload = safeJsonParse(await request.text());

  const parsed = smartQuerySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "unparsable" }, { status: 400 });
  }

  const taxonomy = await getTaxonomy();
  const result = await parseSmartQuery(parsed.data.query, taxonomy);

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 200 });
  }

  return NextResponse.json({ ok: true, filters: result.filters });
}
