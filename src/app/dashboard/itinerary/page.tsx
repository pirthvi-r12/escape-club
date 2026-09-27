import type { Metadata } from "next";

import { ItineraryBoard } from "@/components/dashboard/ItineraryBoard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { generateItinerary } from "@/lib/ai-itinerary";
import { getSessionUser } from "@/lib/auth";
import { getItinerary, saveItinerary } from "@/lib/repo";

export const metadata: Metadata = { title: "Itinerary studio" };
export const dynamic = "force-dynamic";

export default async function ItineraryPage() {
  const user = await getSessionUser();
  if (!user) return null;

  let itinerary = await getItinerary(user.id);
  if (!itinerary) {
    itinerary = generateItinerary({ destinationSlug: "khumbu", days: 5 });
    itinerary = await saveItinerary(user.id, itinerary);
  }

  return (
    <>
      <PageHeader
        eyebrow="Itinerary studio"
        title="Move anything. We will re-time the rest."
        description="Every card is draggable. The plan is generated, then it is yours to argue with."
      />

      <ItineraryBoard initial={itinerary} />
    </>
  );
}
