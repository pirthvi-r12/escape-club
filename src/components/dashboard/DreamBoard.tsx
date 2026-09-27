import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";
import { formatDateRange } from "@/lib/utils";
import type { TripDTO } from "@/types";

export function DreamBoard({ trips }: { trips: TripDTO[] }) {
  const dreams = trips
    .filter((t) => t.status === "DREAMING")
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));

  return (
    <Reveal delay={0.08}>
      <section className="glass glass-sheen rounded-2xl p-6">
        <header className="mb-5">
          <p className="eyebrow text-[0.6rem]">On the list</p>
          <h2 className="font-display mt-2 text-2xl leading-none tracking-[-0.02em] text-bone">
            Places you are still thinking about
          </h2>
        </header>

        {dreams.length === 0 ? (
          <p className="text-[0.82rem] leading-relaxed text-mist-dim">
            Nothing saved yet. Pick a destination below or on{" "}
            <Link href="/dashboard/trips" className="text-champagne underline">
              All trips
            </Link>{" "}
            to start a dream list.
          </p>
        ) : (
          <ul className="space-y-3">
            {dreams.map((trip) => (
              <li
                key={trip.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-white/12 px-4 py-3.5 transition-colors duration-300 hover:border-champagne/35"
              >
                <div>
                  <p className="text-[0.85rem] text-bone">{trip.destination.name}</p>
                  <p className="mt-1 text-[0.72rem] text-mist-dim">
                    {trip.title} · {trip.destination.country}
                  </p>
                </div>
                <p className="text-[0.72rem] text-mist tabular-nums">
                  {formatDateRange(trip.startDate, trip.endDate)}
                </p>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/dashboard/itinerary"
          className="mt-5 inline-flex text-[0.68rem] tracking-[0.18em] text-mist uppercase transition-colors duration-300 hover:text-champagne"
        >
          Open itinerary studio →
        </Link>
      </section>
    </Reveal>
  );
}
