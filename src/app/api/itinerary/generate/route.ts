import { NextResponse } from "next/server";
import { z } from "zod";

import { generateItinerary } from "@/lib/ai-itinerary";
import { getSessionUser } from "@/lib/auth";
import { DESTINATIONS } from "@/lib/content";
import { saveItinerary } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  destinationSlug: z
    .enum(DESTINATIONS.map((d) => d.slug) as [string, ...string[]])
    .optional(),
  days: z.number().int().min(2).max(9).optional(),
  brief: z.string().max(280).optional(),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    /* An empty body is valid — it means "surprise me". */
  }

  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid brief." },
      { status: 422 },
    );
  }

  const itinerary = generateItinerary(parsed.data);

  /* Simulated model latency so the UI's pending state is actually exercised. */
  await new Promise((resolve) => setTimeout(resolve, 900));

  const saved = await saveItinerary(user.id, itinerary);

  return NextResponse.json({ itinerary: saved });
}
