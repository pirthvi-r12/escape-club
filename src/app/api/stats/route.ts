import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { getStats } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  return NextResponse.json({ stats: await getStats(user.id, user.tier) });
}
