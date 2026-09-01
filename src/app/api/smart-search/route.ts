import { NextResponse } from "next/server";

import { smartQuerySchema } from "@/lib/validation";
import { getTaxonomy } from "@/server/assets/queries";
import { parseSmartQuery } from "@/server/matching/ai";
import { getCurrentUser } from "@/server/auth/session";

/**
 * The one place this app exposes a JSON endpoint rather than a Server Action:
 * the client needs the parsed filters back in order to rewrite the URL, and it
 * is called on demand rather than as part of a form submission.
 *
 * Signed-in users only — this endpoint costs money per call, so it is not left
 * open to anonymous traffic.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: "unauthorised" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "unparsable" }, { status: 400 });
  }

  const parsed = smartQuerySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "unparsable" }, { status: 400 });
  }

  const taxonomy = await getTaxonomy();
  const result = await parseSmartQuery(parsed.data.query, taxonomy);

  if (!result.ok) {
    // Not a server error — the caller falls back to keyword search.
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 200 });
  }

  return NextResponse.json({ ok: true, filters: result.filters });
}
