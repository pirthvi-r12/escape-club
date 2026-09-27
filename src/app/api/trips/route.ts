import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { DESTINATIONS } from "@/lib/content";
import { createTrip, getTrips } from "@/lib/repo";
import type { TripStatus } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: TripStatus[] = ["DREAMING", "BOOKED", "COMPLETED", "CANCELLED"];

const createSchema = z.object({
  destinationSlug: z.enum(
    DESTINATIONS.map((d) => d.slug) as [string, ...string[]],
  ),
  status: z.enum(["DREAMING", "BOOKED"]).optional(),
});

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const status = new URL(request.url).searchParams.get("status");
  const trips = await getTrips(user.id);

  const filtered =
    status && STATUSES.includes(status as TripStatus)
      ? trips.filter((t) => t.status === status)
      : trips;

  return NextResponse.json({ trips: filtered });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid trip." },
      { status: 422 },
    );
  }

  const trip = await createTrip(user.id, parsed.data);
  if (!trip) {
    return NextResponse.json(
      { error: "Destination not found or already on your list." },
      { status: 409 },
    );
  }

  return NextResponse.json({ trip }, { status: 201 });
}
