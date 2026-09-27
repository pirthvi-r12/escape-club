import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { TripDiscoveryPanel } from "@/components/dashboard/TripDiscoveryPanel";
import { TripGlobe } from "@/components/dashboard/TripGlobe";
import { getDiscoveryDestinations } from "@/lib/dashboard-discovery";
import { Reveal } from "@/components/ui/Reveal";
import { getSessionUser } from "@/lib/auth";
import { getTrips } from "@/lib/repo";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "The world map" };
export const dynamic = "force-dynamic";

export default async function GlobePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const trips = await getTrips(user.id);

  const completed = trips.filter((t) => t.status === "COMPLETED");
  const booked = trips.filter((t) => t.status === "BOOKED");
  const dreaming = trips.filter((t) => t.status === "DREAMING");
  const totalMiles = completed.reduce((sum, t) => sum + t.miles, 0);

  return (
    <>
      <PageHeader
        eyebrow="Visualisation"
        title="Everywhere you have been, and where you are going."
        description={`${formatNumber(totalMiles)} miles flown from ${
          user.homeCity ?? "home"
        }. Dashed arcs are upcoming departures.`}
      />

      {trips.length === 0 && (
        <div className="mb-4">
          <TripDiscoveryPanel
            destinations={getDiscoveryDestinations().slice(0, 3)}
            variant="compact"
            title="Plot your first marker"
            subtitle="Add a trip and return here — the globe will draw arcs between home and each destination."
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_17rem]">
        <TripGlobe trips={trips} height={620} />

        <Reveal delay={0.1} className="space-y-4">
          {(
            [
              ["Been", completed, "text-champagne"],
              ["Booked", booked, "text-glacier"],
              ["On the list", dreaming, "text-champagne-deep"],
            ] as const
          ).map(([label, group, tone]) => (
            <article key={label} className="glass glass-sheen rounded-2xl p-5">
              <div className="flex items-baseline justify-between">
                <p className="eyebrow text-[0.58rem]">{label}</p>
                <p className={`font-display text-2xl leading-none ${tone}`}>
                  {group.length}
                </p>
              </div>

              <ul className="mt-4 space-y-2.5 border-t border-white/8 pt-4">
                {group.slice(0, 5).map((trip) => (
                  <li
                    key={trip.id}
                    className="flex items-baseline justify-between gap-3 text-[0.75rem]"
                  >
                    <span className="truncate text-bone-dim">
                      {trip.destination.name}
                    </span>
                    <span className="shrink-0 text-mist-dim tabular-nums">
                      {new Date(trip.startDate).getFullYear()}
                    </span>
                  </li>
                ))}
                {group.length === 0 && (
                  <li className="text-[0.75rem] text-mist-dim">Nothing yet.</li>
                )}
              </ul>
            </article>
          ))}
        </Reveal>
      </div>
    </>
  );
}
