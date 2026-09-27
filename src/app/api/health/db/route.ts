import { NextResponse } from "next/server";

import { getDatabaseStatus } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getDatabaseStatus();

  if (status === "not_configured") {
    return NextResponse.json(
      {
        ok: false,
        status,
        configured: false,
        message: "DATABASE_URL is not set.",
      },
      { status: 503 },
    );
  }

  const connected = status === "ready";

  return NextResponse.json(
    {
      ok: connected,
      status,
      configured: true,
      message: connected
        ? "Database connection is healthy."
        : "Cannot reach the configured database. Check TiDB / DATABASE_URL on the server.",
      setupUrl: "/setup/database",
    },
    { status: connected ? 200 : 503 },
  );
}
