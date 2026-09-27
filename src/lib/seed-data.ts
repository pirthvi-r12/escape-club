import { DESTINATIONS, destinationImage } from "@/lib/content";
import type { ItineraryDTO, TripDTO, TripStatus } from "@/types";

const HOME = { lat: 51.5072, lng: -0.1276 };

function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

type TripBlueprint = {
  slug: string;
  title: string;
  status: TripStatus;
  start: string;
  end: string;
  rating: number | null;
  spendMultiplier: number;
};

const TRIP_BLUEPRINTS: TripBlueprint[] = [
  { slug: "isle-of-skye", title: "Hebridean Reset", status: "COMPLETED", start: "2025-04-11", end: "2025-04-17", rating: 5, spendMultiplier: 1.0 },
  { slug: "pragser-wildsee", title: "Dolomite Dawn Water", status: "COMPLETED", start: "2025-06-02", end: "2025-06-09", rating: 5, spendMultiplier: 1.15 },
  { slug: "moraine-lake", title: "Ten Peaks Traverse", status: "COMPLETED", start: "2025-07-19", end: "2025-07-30", rating: 4, spendMultiplier: 1.3 },
  { slug: "kluane", title: "Yukon Silence Expedition", status: "COMPLETED", start: "2025-08-14", end: "2025-08-26", rating: 5, spendMultiplier: 1.45 },
  { slug: "annapurna", title: "Annapurna Moonlight", status: "COMPLETED", start: "2025-10-08", end: "2025-10-24", rating: 5, spendMultiplier: 1.2 },
  { slug: "valley-of-fire", title: "Mojave Solo Drive", status: "COMPLETED", start: "2025-11-21", end: "2025-11-27", rating: 4, spendMultiplier: 0.9 },
  { slug: "zermatt", title: "Above The Weather", status: "COMPLETED", start: "2026-01-16", end: "2026-01-24", rating: 5, spendMultiplier: 1.35 },
  { slug: "isle-of-skye", title: "Quiraing, Again", status: "COMPLETED", start: "2026-03-06", end: "2026-03-11", rating: 4, spendMultiplier: 0.8 },
  { slug: "pragser-wildsee", title: "Alta Badia Ridgeline", status: "COMPLETED", start: "2026-05-22", end: "2026-05-29", rating: 5, spendMultiplier: 1.1 },
  { slug: "moraine-lake", title: "Rockies Glacier Week", status: "COMPLETED", start: "2026-07-03", end: "2026-07-12", rating: 5, spendMultiplier: 1.25 },
  { slug: "khumbu", title: "The Long Ascent", status: "BOOKED", start: "2026-10-02", end: "2026-10-21", rating: null, spendMultiplier: 1.6 },
  { slug: "zermatt", title: "Winter Bivouac", status: "BOOKED", start: "2026-12-18", end: "2026-12-27", rating: null, spendMultiplier: 1.4 },
  { slug: "kluane", title: "Aurora Basecamp", status: "DREAMING", start: "2027-02-11", end: "2027-02-20", rating: null, spendMultiplier: 1.5 },
  { slug: "annapurna", title: "Sanctuary Circuit", status: "DREAMING", start: "2027-04-09", end: "2027-04-28", rating: null, spendMultiplier: 1.3 },
];

export function buildSeedTrips(userId: string): TripDTO[] {
  return TRIP_BLUEPRINTS.map((bp, index) => {
    const dest = DESTINATIONS.find((d) => d.slug === bp.slug)!;
    const miles = haversineMiles(HOME, dest) * 2;
    const nights = Math.round(
      (new Date(bp.end).getTime() - new Date(bp.start).getTime()) / 86_400_000,
    );
    return {
      id: `${userId}-trip-${index + 1}`,
      title: bp.title,
      status: bp.status,
      startDate: new Date(`${bp.start}T09:00:00.000Z`).toISOString(),
      endDate: new Date(`${bp.end}T18:00:00.000Z`).toISOString(),
      miles,
      spend: Math.round((dest.basePrice * bp.spendMultiplier * nights) / 7 / 50) * 50,
      rating: bp.rating,
      destination: {
        slug: dest.slug,
        name: dest.name,
        country: dest.country,
        region: dest.region,
        lat: dest.lat,
        lng: dest.lng,
        image: destinationImage(dest.slug, 1200),
      },
    } satisfies TripDTO;
  });
}

export function buildSeedItinerary(userId: string): ItineraryDTO {
  return {
    id: `${userId}-itinerary-1`,
    title: "The Long Ascent — Khumbu, Nepal",
    summary:
      "Nineteen days shaped around the October weather window, front-loaded with acclimatisation so the summit push lands on the clearest forecast day.",
    days: [
      {
        id: "day-1",
        label: "Day 01",
        subtitle: "Kathmandu → Lukla",
        items: [
          { id: "i-1", title: "Private charter to Lukla", detail: "Dawn slot to beat the valley crosswinds.", time: "05:40", duration: "35 min", kind: "TRANSFER" },
          { id: "i-2", title: "Meet Pemba, lead guide", detail: "Kit check, route briefing, oxygen saturation baseline.", time: "07:15", duration: "1 hr", kind: "GUIDE" },
          { id: "i-3", title: "Phakding teahouse", detail: "Private wing, 2,610 m. Early night.", time: "16:00", duration: "Overnight", kind: "STAY" },
        ],
      },
      {
        id: "day-2",
        label: "Day 02",
        subtitle: "Phakding → Namche",
        items: [
          { id: "i-4", title: "Dudh Koshi suspension crossings", detail: "Six bridges, 800 m of gain.", time: "06:30", duration: "7 hr", kind: "ASCENT" },
          { id: "i-5", title: "Namche Bazaar lodge", detail: "3,440 m. Two nights for acclimatisation.", time: "15:30", duration: "Overnight", kind: "STAY" },
        ],
      },
      {
        id: "day-3",
        label: "Day 03",
        subtitle: "Acclimatisation",
        items: [
          { id: "i-6", title: "Rest and hydration protocol", detail: "No ascent. Guide monitors SpO₂ twice.", time: "08:00", duration: "All day", kind: "REST" },
          { id: "i-7", title: "Everest View sunset", detail: "Short walk up to 3,880 m, back down to sleep low.", time: "16:00", duration: "3 hr", kind: "ASCENT" },
        ],
      },
      {
        id: "day-4",
        label: "Day 04",
        subtitle: "Namche → Tengboche",
        items: [
          { id: "i-8", title: "Tengboche monastery", detail: "Arrive for the 15:00 prayer.", time: "13:00", duration: "2 hr", kind: "GUIDE" },
          { id: "i-9", title: "Ama Dablam dinner", detail: "Chef-prepared, carb-loaded, 3,860 m.", time: "18:30", duration: "1.5 hr", kind: "DINING" },
        ],
      },
    ],
    backlog: [
      { id: "b-1", title: "Khumjung school visit", detail: "Club foundation project — 90 minutes, flexible day.", time: "Flexible", duration: "1.5 hr", kind: "GUIDE" },
      { id: "b-2", title: "Helicopter weather bail-out", detail: "Held slot in case the window closes early.", time: "On call", duration: "45 min", kind: "TRANSFER" },
      { id: "b-3", title: "Sherpa kitchen masterclass", detail: "Two hours in the Namche lodge kitchen.", time: "Flexible", duration: "2 hr", kind: "DINING" },
      { id: "b-4", title: "Cold-water recovery", detail: "Glacial plunge and sauna cycle after descent.", time: "Flexible", duration: "1 hr", kind: "REST" },
    ],
  };
}
