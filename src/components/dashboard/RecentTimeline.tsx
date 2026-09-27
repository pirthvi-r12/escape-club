import Image from "next/image";
import Link from "next/link";

import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { BLUR_DATA_URL } from "@/lib/images";
import { formatDateRange, formatNumber } from "@/lib/utils";
import type { TripDTO } from "@/types";

export function RecentTimeline({ trips }: { trips: TripDTO[] }) {
  const recent = trips
    .filter((t) => t.status === "COMPLETED")
    .sort((a, b) => +new Date(b.endDate) - +new Date(a.endDate))
    .slice(0, 5);

  const pipeline = trips.filter((t) =>
    ["BOOKED", "DREAMING"].includes(t.status),
  );

  return (
    <section className="glass glass-sheen rounded-2xl p-6">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[0.6rem]">Recent</p>
          <h2 className="font-display mt-2 text-2xl leading-none tracking-[-0.02em] text-bone">
            {recent.length > 0 ? "Last five returns" : "Your timeline"}
          </h2>
        </div>
        <Link
          href="/dashboard/trips"
          className="text-[0.68rem] tracking-[0.18em] text-mist uppercase transition-colors duration-300 hover:text-champagne"
        >
          All trips
        </Link>
      </header>

      {recent.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/12 px-5 py-8">
          <p className="text-[0.82rem] leading-relaxed text-mist-dim">
            Completed departures will stack here with photos and miles logged.
          </p>
          {pipeline.length > 0 && (
            <ul className="mt-5 space-y-3">
              {pipeline.slice(0, 3).map((trip) => (
                <li
                  key={trip.id}
                  className="flex items-center gap-3 text-[0.78rem] text-mist"
                >
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={trip.destination.image}
                      alt=""
                      fill
                      sizes="40px"
                      quality={60}
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover"
                    />
                  </span>
                  <span>
                    <span className="text-bone">{trip.destination.name}</span> ·{" "}
                    {trip.status.toLowerCase()} ·{" "}
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <RevealGroup className="relative space-y-0">
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-[1.35rem] w-px bg-white/10"
          />
          {recent.map((trip) => (
            <RevealItem key={trip.id}>
              <article className="relative grid grid-cols-[2.75rem_1fr] gap-4 py-3">
                <span className="relative z-10 mt-1 flex h-3 w-3 items-center justify-center rounded-full border border-champagne/50 bg-ink-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
                </span>

                <div className="grid gap-4 sm:grid-cols-[4rem_1fr_auto] sm:items-center">
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={trip.destination.image}
                      alt={trip.destination.name}
                      fill
                      quality={68}
                      sizes="4rem"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[0.85rem] text-bone">{trip.title}</p>
                    <p className="mt-1 text-[0.72rem] text-mist-dim">
                      {trip.destination.name}, {trip.destination.country}
                    </p>
                    <p className="mt-1 text-[0.68rem] text-mist">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                  </div>
                  <dl className="text-right text-[0.72rem]">
                    <dt className="text-mist-dim">Miles</dt>
                    <dd className="mt-0.5 text-bone tabular-nums">
                      {formatNumber(trip.miles)}
                    </dd>
                    {trip.rating && (
                      <>
                        <dt className="mt-2 text-mist-dim">Rating</dt>
                        <dd className="mt-0.5 text-champagne">{trip.rating}.0</dd>
                      </>
                    )}
                  </dl>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </section>
  );
}
