import "server-only";

import { destinationImage } from "@/lib/content";
import { runPrismaQuery } from "@/lib/db";
import type {
  FeedItem,
  ItineraryDTO,
  StatsDTO,
  Tier,
  TripDTO,
  TripStatus,
} from "@/types";

function mapTripRow(
  t: {
    id: string;
    title: string;
    status: TripStatus;
    startDate: Date;
    endDate: Date;
    miles: number;
    spend: number;
    rating: number | null;
    destination: {
      slug: string;
      name: string;
      country: string;
      region: string;
      lat: number;
      lng: number;
      heroImage: string;
    };
  },
): TripDTO {
  return {
    id: t.id,
    title: t.title,
    status: t.status,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    miles: t.miles,
    spend: t.spend,
    rating: t.rating,
    destination: {
      slug: t.destination.slug,
      name: t.destination.name,
      country: t.destination.country,
      region: t.destination.region,
      lat: t.destination.lat,
      lng: t.destination.lng,
      image:
        t.destination.heroImage ||
        destinationImage(t.destination.slug, 1200),
    },
  };
}

/* ---------------------------------------------------------------- *
 *  Trips
 * ---------------------------------------------------------------- */

export async function getTrips(userId: string): Promise<TripDTO[]> {
  const rows = await runPrismaQuery(
    (prisma) =>
      prisma.trip.findMany({
        where: { userId },
        include: { destination: true },
        orderBy: { startDate: "asc" },
      }),
    [],
  );

  return rows.map(mapTripRow);
}

export async function createTrip(
  userId: string,
  input: { destinationSlug: string; status?: TripStatus },
): Promise<TripDTO | null> {
  const status = input.status ?? "DREAMING";

  const row = await runPrismaQuery(
    async (prisma) => {
      const destination = await prisma.destination.findUnique({
        where: { slug: input.destinationSlug },
      });
      if (!destination) return null;

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() + (status === "BOOKED" ? 2 : 4));
      startDate.setHours(12, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (status === "DREAMING" ? 5 : 9));

      const existing = await prisma.trip.findFirst({
        where: {
          userId,
          destinationId: destination.id,
          status: { in: ["DREAMING", "BOOKED"] },
        },
      });
      if (existing) return null;

      return prisma.trip.create({
        data: {
          userId,
          destinationId: destination.id,
          title:
            status === "DREAMING"
              ? `On the list · ${destination.name}`
              : `${destination.name} · confirmed`,
          status,
          startDate,
          endDate,
          miles: status === "COMPLETED" ? 3200 : 0,
          spend: Math.round(destination.basePrice * 0.85),
        },
        include: { destination: true },
      });
    },
    null,
  );

  return row ? mapTripRow(row) : null;
}

/* ---------------------------------------------------------------- *
 *  Analytics
 * ---------------------------------------------------------------- */

const TIER_THRESHOLDS: { tier: Tier; miles: number }[] = [
  { tier: "EXPLORER", miles: 0 },
  { tier: "VOYAGER", miles: 40_000 },
  { tier: "OBSIDIAN", miles: 120_000 },
];

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Derives every dashboard chart from the member's trip history. */
export function computeStats(trips: TripDTO[], tier: Tier): StatsDTO {
  const completed = trips.filter((t) => t.status === "COMPLETED");
  const counted = trips.filter((t) => t.status !== "CANCELLED");

  const miles = completed.reduce((sum, t) => sum + t.miles, 0);
  const spend = counted.reduce((sum, t) => sum + t.spend, 0);
  const countries = new Set(completed.map((t) => t.destination.country)).size;
  const nights = completed.reduce(
    (sum, t) =>
      sum +
      Math.max(
        1,
        Math.round(
          (+new Date(t.endDate) - +new Date(t.startDate)) / 86_400_000,
        ),
      ),
    0,
  );
  const rated = completed.filter((t) => typeof t.rating === "number");
  const avgRating = rated.length
    ? Number(
        (
          rated.reduce((sum, t) => sum + (t.rating ?? 0), 0) / rated.length
        ).toFixed(1),
      )
    : 0;

  const anchor = completed.length
    ? new Date(completed[completed.length - 1].endDate)
    : new Date();

  const milesByMonth = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - (11 - i), 1);
    const inMonth = completed.filter((t) => {
      const s = new Date(t.startDate);
      return s.getFullYear() === d.getFullYear() && s.getMonth() === d.getMonth();
    });
    return {
      month: MONTH_LABELS[d.getMonth()],
      miles: inMonth.reduce((sum, t) => sum + t.miles, 0),
      trips: inMonth.length,
    };
  });

  const regionMap = new Map<string, { trips: number; miles: number }>();
  for (const t of counted) {
    const key = t.destination.region;
    const current = regionMap.get(key) ?? { trips: 0, miles: 0 };
    regionMap.set(key, {
      trips: current.trips + 1,
      miles: current.miles + t.miles,
    });
  }
  const byRegion = [...regionMap.entries()]
    .map(([region, v]) => ({ region, ...v }))
    .sort((a, b) => b.miles - a.miles);

  const quarterMap = new Map<string, number>();
  for (const t of counted) {
    const d = new Date(t.startDate);
    const key = `Q${Math.floor(d.getMonth() / 3) + 1} '${String(
      d.getFullYear(),
    ).slice(2)}`;
    quarterMap.set(key, (quarterMap.get(key) ?? 0) + t.spend);
  }
  const spendByQuarter = [...quarterMap.entries()]
    .slice(-6)
    .map(([quarter, value]) => ({
      quarter,
      spend: value,
      budget: Math.round((value * 1.18) / 100) * 100,
    }));

  const currentIndex = TIER_THRESHOLDS.findIndex((t) => t.tier === tier);
  const next = TIER_THRESHOLDS[currentIndex + 1] ?? null;
  const floor = TIER_THRESHOLDS[currentIndex]?.miles ?? 0;
  const progress = next
    ? Math.min(100, Math.round(((miles - floor) / (next.miles - floor)) * 100))
    : 100;

  return {
    totals: { trips: completed.length, miles, countries, nights, spend, avgRating },
    milesByMonth,
    byRegion,
    spendByQuarter,
    tier: {
      current: tier,
      next: next?.tier ?? null,
      milesToNext: next ? Math.max(0, next.miles - miles) : 0,
      progress: Math.max(4, progress),
    },
  };
}

export async function getStats(userId: string, tier: Tier): Promise<StatsDTO> {
  return computeStats(await getTrips(userId), tier);
}

/* ---------------------------------------------------------------- *
 *  Live booking feed
 * ---------------------------------------------------------------- */

export async function getBookingFeed(limit = 14): Promise<FeedItem[]> {
  const rows = await runPrismaQuery(
    (prisma) =>
      prisma.bookingEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    [],
  );

  return rows.map((r) => ({
    id: r.id,
    memberName: r.memberName,
    memberTier: r.memberTier,
    destination: r.destination,
    country: r.country,
    amount: r.amount,
    createdAt: r.createdAt.toISOString(),
  }));
}

/* ---------------------------------------------------------------- *
 *  Itinerary
 * ---------------------------------------------------------------- */

export async function getItinerary(userId: string): Promise<ItineraryDTO | null> {
  const row = await runPrismaQuery(
    (prisma) =>
      prisma.itinerary.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
    null,
  );
  if (!row) return null;

  const payload = row.days as unknown as Pick<ItineraryDTO, "days" | "backlog">;
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    days: payload.days ?? [],
    backlog: payload.backlog ?? [],
  };
}

export async function saveItinerary(userId: string, itinerary: ItineraryDTO) {
  const saved = await runPrismaQuery(
    (prisma) =>
      prisma.itinerary.upsert({
        where: { id: itinerary.id },
        create: {
          id: itinerary.id,
          userId,
          title: itinerary.title,
          summary: itinerary.summary,
          days: { days: itinerary.days, backlog: itinerary.backlog },
        },
        update: {
          title: itinerary.title,
          summary: itinerary.summary,
          days: { days: itinerary.days, backlog: itinerary.backlog },
        },
      }),
    null,
  );

  if (!saved) return itinerary;

  return { ...itinerary, id: saved.id };
}
