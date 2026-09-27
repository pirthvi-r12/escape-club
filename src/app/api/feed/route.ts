import { NextResponse } from "next/server";

import { getBookingFeed } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Platform-wide booking activity. Public by design — it is the same social
 * proof shown on the landing page — and explicitly uncached so the dashboard
 * feed keeps moving.
 */
export async function GET(request: Request) {
  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = Math.min(30, Math.max(1, Number(limitParam) || 14));

  return NextResponse.json(
    { events: await getBookingFeed(limit) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
