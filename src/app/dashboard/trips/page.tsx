import type { Metadata } from "next";
import Image from "next/image";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { TripDiscoveryPanel } from "@/components/dashboard/TripDiscoveryPanel";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getSessionUser } from "@/lib/auth";
import { getDiscoveryDestinations } from "@/lib/dashboard-discovery";
import { BLUR_DATA_URL } from "@/lib/images";
import { getTrips } from "@/lib/repo";
import {
  formatCurrency,
  formatDateRange,
  formatNumber,
} from "@/lib/utils";
import type { TripStatus } from "@/types";

export const metadata: Metadata = { title: "All trips" };
export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<TripStatus, string> = {
  COMPLETED: "border-champagne/25 bg-champagne/10 text-champagne",
  BOOKED: "border-glacier/30 bg-glacier/10 text-glacier",
  DREAMING: "border-white/12 bg-white/[0.04] text-mist",
  CANCELLED: "border-white/10 bg-white/[0.02] text-mist-dim line-through",
};

export default async function TripsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const trips = (await getTrips(user.id)).slice().reverse();
  const discovery = getDiscoveryDestinations();

  return (
    <>
      <PageHeader
        eyebrow="History"
        title="Every departure, in order."
        description={`${trips.length} trips on record, newest first.`}
      />

      {trips.length === 0 ? (
        <TripDiscoveryPanel
          destinations={discovery}
          title="Your archive is waiting"
          subtitle="Choose where you want to go first. Dream trips show on the globe as soft markers; booked trips draw flight arcs."
        />
      ) : (
        <RevealGroup className="space-y-2.5">
          {trips.map((trip) => (
            <RevealItem key={trip.id}>
              <article className="glass group grid grid-cols-[4.5rem_1fr] items-center gap-5 rounded-2xl p-3 transition-colors duration-500 hover:border-white/16 sm:grid-cols-[5.5rem_1fr_auto] sm:gap-6 sm:p-4">
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <Image
                    src={trip.destination.image}
                    alt={trip.destination.name}
                    fill
                    quality={70}
                    sizes="6rem"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-[0.92rem] text-bone">{trip.title}</h2>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[0.55rem] tracking-[0.18em] uppercase ${
                        STATUS_STYLE[trip.status]
                      }`}
                    >
                      {trip.status.toLowerCase()}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[0.75rem] text-mist">
                    {trip.destination.name}, {trip.destination.country} ·{" "}
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </p>

                  <dl className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-[0.68rem] text-mist-dim sm:hidden">
                    <div className="flex gap-1.5">
                      <dt>Miles</dt>
                      <dd className="text-bone-dim tabular-nums">
                        {formatNumber(trip.miles)}
                      </dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt>Spend</dt>
                      <dd className="text-bone-dim tabular-nums">
                        {formatCurrency(trip.spend)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <dl className="hidden items-center gap-10 pr-3 sm:flex">
                  <div className="text-right">
                    <dt className="text-[0.55rem] tracking-[0.18em] text-mist-dim uppercase">
                      Miles
                    </dt>
                    <dd className="mt-1 text-[0.85rem] text-bone tabular-nums">
                      {formatNumber(trip.miles)}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-[0.55rem] tracking-[0.18em] text-mist-dim uppercase">
                      Spend
                    </dt>
                    <dd className="mt-1 text-[0.85rem] text-bone tabular-nums">
                      {formatCurrency(trip.spend)}
                    </dd>
                  </div>
                  <div className="w-14 text-right">
                    <dt className="text-[0.55rem] tracking-[0.18em] text-mist-dim uppercase">
                      Rating
                    </dt>
                    <dd className="mt-1 text-[0.85rem] text-champagne">
                      {trip.rating ? `${trip.rating}.0` : "—"}
                    </dd>
                  </div>
                </dl>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </>
  );
}
