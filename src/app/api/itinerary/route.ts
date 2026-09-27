import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { getItinerary, saveItinerary } from "@/lib/repo";
import type { ItineraryDTO } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const itemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(160),
  detail: z.string().max(400),
  time: z.string().max(40),
  duration: z.string().max(40),
  kind: z.enum(["TRANSFER", "STAY", "ASCENT", "DINING", "GUIDE", "REST"]),
});

const itinerarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  summary: z.string().max(800),
  days: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().max(40),
        subtitle: z.string().max(80),
        items: z.array(itemSchema).max(20),
      }),
    )
    .max(14),
  backlog: z.array(itemSchema).max(20),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  return NextResponse.json({ itinerary: await getItinerary(user.id) });
}

/** Persists the board after a drag. */
export async function PUT(request: Request) {
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

  const parsed = itinerarySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid itinerary." },
      { status: 422 },
    );
  }

  const saved = await saveItinerary(user.id, parsed.data as ItineraryDTO);
  return NextResponse.json({ itinerary: saved });
}
