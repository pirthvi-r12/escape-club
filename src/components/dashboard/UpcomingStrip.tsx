import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";
import { BLUR_DATA_URL } from "@/lib/images";
import { formatDateRange } from "@/lib/utils";
import type { TripDTO } from "@/types";

export function UpcomingStrip({ trips }: { trips: TripDTO[] }) {
  const upcoming = trips
    .filter((t) => t.status === "BOOKED" && +new Date(t.startDate) > Date.now())
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));

  if (upcoming.length === 0) return null;

  return (
    <Reveal>
      <section className="glass glass-sheen rounded-2xl p-6">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-[0.6rem]">On the calendar</p>
            <h2 className="font-display mt-2 text-2xl leading-none tracking-[-0.02em] text-bone">
              {upcoming.length} departure{upcoming.length === 1 ? "" : "s"} booked
            </h2>
          </div>
          <Link
            href="/dashboard/itinerary"
            className="text-[0.68rem] tracking-[0.18em] text-mist uppercase transition-colors duration-300 hover:text-champagne"
          >
            Open itinerary
          </Link>
        </header>

        <ul className="hide-scrollbar flex gap-4 overflow-x-auto pb-1">
          {upcoming.map((trip) => {
            const days = Math.max(
              0,
              Math.ceil((+new Date(trip.startDate) - Date.now()) / 86_400_000),
            );
            return (
              <li
                key={trip.id}
                className="w-[17rem] shrink-0 overflow-hidden rounded-xl border border-white/8 bg-ink-850/40"
              >
                <div className="relative h-28">
                  <Image
                    src={trip.destination.image}
                    alt={trip.destination.name}
                    fill
                    quality={72}
                    sizes="17rem"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-3 text-[0.62rem] tracking-[0.16em] text-bone/80 uppercase">
                    {days} days out
                  </p>
                </div>
                <div className="p-4">
                  <p className="eyebrow text-[0.54rem] text-champagne/90">
                    {trip.destination.region}
                  </p>
                  <p className="mt-1.5 font-display text-lg leading-none text-bone">
                    {trip.destination.name}
                  </p>
                  <p className="mt-2 text-[0.72rem] text-mist-dim">
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </Reveal>
  );
}
