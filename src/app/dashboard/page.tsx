import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { DashboardAtmosphere } from "@/components/dashboard/DashboardAtmosphere";
import { DreamBoard } from "@/components/dashboard/DreamBoard";
import { LiveBookingFeed } from "@/components/dashboard/LiveBookingFeed";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTimeline } from "@/components/dashboard/RecentTimeline";
import { StatTiles, TierProgress } from "@/components/dashboard/StatTiles";
import { TravelInsights } from "@/components/dashboard/TravelInsights";
import {
  MilesChart,
  RegionChart,
  SpendChart,
} from "@/components/dashboard/TravelCharts";
import { TripDiscoveryPanel } from "@/components/dashboard/TripDiscoveryPanel";
import { UpcomingStrip } from "@/components/dashboard/UpcomingStrip";
import { Reveal } from "@/components/ui/Reveal";
import { getSessionUser } from "@/lib/auth";
import {
  getAtmosphereSlides,
  getDiscoveryDestinations,
} from "@/lib/dashboard-discovery";
import { BLUR_DATA_URL } from "@/lib/images";
import { getBookingFeed, getStats, getTrips } from "@/lib/repo";
import { formatDateRange } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

function greeting() {
  const hour = new Date().getUTCHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardOverview() {
  const user = await getSessionUser();
  if (!user) return null;

  const [trips, stats, feed] = await Promise.all([
    getTrips(user.id),
    getStats(user.id, user.tier),
    getBookingFeed(7),
  ]);

  const hasTripData = trips.length > 0;
  const bookedCount = trips.filter((t) => t.status === "BOOKED").length;
  const dreamingCount = trips.filter((t) => t.status === "DREAMING").length;

  const upcoming = trips
    .filter((t) => t.status === "BOOKED" && +new Date(t.startDate) > Date.now())
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))[0];

  const daysAway = upcoming
    ? Math.max(
        0,
        Math.ceil((+new Date(upcoming.startDate) - Date.now()) / 86_400_000),
      )
    : null;

  const pipeline =
    bookedCount + dreamingCount > 0
      ? `${bookedCount} booked · ${dreamingCount} on the list`
      : "Nothing on the books yet — add a destination below";

  const discovery = getDiscoveryDestinations();

  return (
    <>
      <PageHeader
        eyebrow={greeting()}
        title={`${user.name.split(" ")[0]}, here is your year.`}
        description={`${stats.totals.trips} completed departures, ${stats.totals.nights} nights away, ${stats.totals.countries} countries. ${pipeline}.`}
      />

      <DashboardAtmosphere slides={getAtmosphereSlides()} />

      <div className="mb-4">
        <QuickActions />
      </div>

      <StatTiles stats={stats} />

      {!hasTripData && (
        <div className="mt-4">
          <TripDiscoveryPanel destinations={discovery} />
        </div>
      )}

      <div className="mt-4 space-y-4">
        <UpcomingStrip trips={trips} />

        <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
          <div className="space-y-4">
            <MilesChart stats={stats} hasTripData={hasTripData} />

            <div className="grid gap-4 md:grid-cols-2">
              <RegionChart stats={stats} hasTripData={hasTripData} />
              <SpendChart stats={stats} hasTripData={hasTripData} />
            </div>

            <RecentTimeline trips={trips} />
          </div>

          <div className="space-y-4">
            {upcoming && (
              <Reveal>
                <article className="glass glass-sheen relative overflow-hidden rounded-2xl">
                  <div className="relative h-44">
                    <Image
                      src={upcoming.destination.image}
                      alt={upcoming.destination.name}
                      fill
                      quality={78}
                      sizes="(max-width: 1280px) 100vw, 26rem"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/35 to-transparent" />
                    <p className="eyebrow absolute top-5 left-5 text-[0.56rem] text-bone/75">
                      Next departure
                    </p>
                  </div>

                  <div className="p-6 pt-4">
                    <p className="eyebrow text-[0.56rem] text-champagne/90">
                      {upcoming.destination.region} ·{" "}
                      {upcoming.destination.country}
                    </p>
                    <h2 className="font-display mt-2.5 text-2xl leading-none tracking-[-0.02em] text-bone">
                      {upcoming.destination.name}
                    </h2>
                    <p className="mt-2.5 text-[0.82rem] text-bone-dim">
                      {upcoming.title}
                    </p>

                    <dl className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                      <div>
                        <dt className="text-[0.6rem] tracking-[0.18em] text-mist-dim uppercase">
                          Dates
                        </dt>
                        <dd className="mt-1.5 text-[0.82rem] text-bone">
                          {formatDateRange(upcoming.startDate, upcoming.endDate)}
                        </dd>
                      </div>
                      <div className="text-right">
                        <dt className="text-[0.6rem] tracking-[0.18em] text-mist-dim uppercase">
                          Countdown
                        </dt>
                        <dd className="font-display mt-0.5 text-3xl leading-none text-champagne tabular-nums">
                          {daysAway}
                          <span className="ml-1 text-xs tracking-[0.1em] text-mist">
                            days
                          </span>
                        </dd>
                      </div>
                    </dl>

                    <Link
                      href="/dashboard/itinerary"
                      className="mt-6 flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-[0.7rem] tracking-[0.18em] text-mist uppercase transition-colors duration-400 hover:border-champagne/40 hover:text-champagne"
                    >
                      Open the itinerary
                      <svg viewBox="0 0 14 14" className="h-2.5 w-2.5">
                        <path
                          d="M1 7h11M7.5 2.5 12 7l-4.5 4.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>
                </article>
              </Reveal>
            )}

            <TravelInsights stats={stats} trips={trips} />

            <Reveal delay={0.08}>
              <TierProgress stats={stats} />
            </Reveal>

            <DreamBoard trips={trips} />

            <Reveal delay={0.16}>
              <LiveBookingFeed initial={feed} />
            </Reveal>
          </div>
        </div>
      </div>

      {hasTripData && (
        <Reveal className="mt-4">
          <TripDiscoveryPanel
            destinations={discovery.slice(0, 2)}
            variant="compact"
            title="Add another chapter"
            subtitle="Two more slots on the roster — dream it or book it."
          />
        </Reveal>
      )}

      <Reveal className="mt-4">
        <Link
          href="/dashboard/globe"
          className="glass glass-sheen group flex flex-wrap items-center justify-between gap-6 rounded-2xl p-6 transition-colors duration-500 hover:border-champagne/30"
        >
          <div>
            <p className="eyebrow text-[0.6rem]">Visualisation</p>
            <h2 className="font-display mt-3 text-2xl leading-none tracking-[-0.02em] text-bone">
              See {trips.length > 0 ? `all ${trips.length} trips` : "the world map"}
            </h2>
            <p className="mt-2.5 text-[0.82rem] text-mist">
              Every marker, every flight path, rotatable.
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 text-bone transition-all duration-500 group-hover:border-champagne/50 group-hover:text-champagne">
            <svg viewBox="0 0 14 14" className="h-3 w-3">
              <path
                d="M1 7h11M7.5 2.5 12 7l-4.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      </Reveal>
    </>
  );
}
