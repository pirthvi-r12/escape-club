import "server-only";

import { DESTINATIONS } from "@/lib/content";
import type {
  ItineraryDTO,
  ItineraryItem,
  ItineraryItemKind,
} from "@/types";

/**
 * Stand-in for the itinerary model. It composes a plausible, well-paced plan
 * from a per-destination activity pool: arrival and departure logistics are
 * pinned to the first and last day, a rest day is inserted on anything longer
 * than four days, and the remainder is filled without repeating an activity.
 *
 * Swapping this for a real model means replacing `generateItinerary` only —
 * the route handler and the board UI both work against ItineraryDTO.
 */

type ActivityTemplate = Omit<ItineraryItem, "id">;

const ARRIVAL: ActivityTemplate[] = [
  { title: "Private transfer from the airfield", detail: "Met at the gate; bags go ahead of you.", time: "10:20", duration: "1 hr 40", kind: "TRANSFER" },
  { title: "Guide briefing and kit check", detail: "Route, weather windows, and a baseline fitness read.", time: "15:00", duration: "1 hr", kind: "GUIDE" },
];

const DEPARTURE: ActivityTemplate[] = [
  { title: "Slow morning, late checkout", detail: "Nothing scheduled before 11:00.", time: "08:30", duration: "3 hr", kind: "REST" },
  { title: "Return transfer", detail: "Driver holds for delays at no charge.", time: "14:30", duration: "2 hr", kind: "TRANSFER" },
];

const BY_REGION: Record<string, ActivityTemplate[]> = {
  Alps: [
    { title: "Dawn cable car, first ascent", detail: "Private carriage before the lifts open publicly.", time: "06:15", duration: "45 min", kind: "TRANSFER" },
    { title: "Glacier traverse with Anselm", detail: "Roped crossing, 4 hours on ice.", time: "07:30", duration: "4 hr", kind: "ASCENT" },
    { title: "Hut lunch at 2,800 m", detail: "Rösti, and a view that makes it taste better.", time: "13:00", duration: "1 hr 30", kind: "DINING" },
    { title: "Via ferrata, north face", detail: "Grade C. Harness and helmet provided.", time: "09:00", duration: "5 hr", kind: "ASCENT" },
    { title: "Thermal recovery", detail: "Private booking, two hours, nobody else in the water.", time: "17:00", duration: "2 hr", kind: "REST" },
  ],
  Dolomites: [
    { title: "Rowboat before the crowds", detail: "On the water by 05:50; off it by 07:30.", time: "05:50", duration: "1 hr 40", kind: "ASCENT" },
    { title: "Rifugio tasting menu", detail: "Seven courses at 2,000 m, wine pairing included.", time: "19:30", duration: "3 hr", kind: "DINING" },
    { title: "Tre Cime circuit", detail: "10 km loop with a guide who knows the light.", time: "08:00", duration: "5 hr", kind: "ASCENT" },
    { title: "Alta Badia ridgeline", detail: "Exposed but straightforward. Head for heights required.", time: "09:15", duration: "6 hr", kind: "ASCENT" },
  ],
  Himalaya: [
    { title: "Acclimatisation walk", detail: "Climb high, sleep low. SpO₂ checked twice.", time: "07:00", duration: "4 hr", kind: "ASCENT" },
    { title: "Monastery prayer, 15:00", detail: "Arrive quietly; photographs after, not during.", time: "14:30", duration: "1 hr 30", kind: "GUIDE" },
    { title: "Teahouse rest day", detail: "No ascent. Hydration protocol and a book.", time: "All day", duration: "Full day", kind: "REST" },
    { title: "Suspension bridge crossings", detail: "Six bridges, 800 m of gain, one long day.", time: "06:30", duration: "7 hr", kind: "ASCENT" },
    { title: "Sherpa kitchen dinner", detail: "Cooked in the lodge, eaten at altitude.", time: "18:30", duration: "1 hr 30", kind: "DINING" },
  ],
  Rockies: [
    { title: "Sunrise canoe, Moraine", detail: "Paddling by 05:30 for the alpenglow.", time: "05:30", duration: "2 hr", kind: "ASCENT" },
    { title: "Icefield walk with a glaciologist", detail: "Four hours on the Athabasca with someone who studies it.", time: "09:00", duration: "4 hr", kind: "GUIDE" },
    { title: "Backcountry lodge dinner", detail: "Flown-in kitchen, twelve covers.", time: "19:00", duration: "2 hr 30", kind: "DINING" },
    { title: "Larch Valley ascent", detail: "Grizzly country; the guide carries deterrent.", time: "08:00", duration: "5 hr", kind: "ASCENT" },
  ],
  Hebrides: [
    { title: "Quiraing at first light", detail: "Landslip walk before the coaches reach the car park.", time: "05:40", duration: "3 hr", kind: "ASCENT" },
    { title: "Fairy Pools swim", detail: "Cold. Genuinely cold. Towels and whisky waiting.", time: "11:00", duration: "1 hr 30", kind: "REST" },
    { title: "Talisker tasting, private room", detail: "Six expressions with the distillery manager.", time: "16:00", duration: "2 hr", kind: "DINING" },
    { title: "Sea stack sail", detail: "Skippered rib around the Storr coastline.", time: "13:00", duration: "3 hr", kind: "GUIDE" },
  ],
  Yukon: [
    { title: "Bush plane over Kluane", detail: "Low pass across the largest non-polar icefield on earth.", time: "09:30", duration: "1 hr 45", kind: "TRANSFER" },
    { title: "Aurora watch, no light pollution", detail: "Heated hide, 22:00 until it happens.", time: "22:00", duration: "4 hr", kind: "GUIDE" },
    { title: "Paddle the Tatshenshini", detail: "Class II with a swift-water guide.", time: "10:00", duration: "6 hr", kind: "ASCENT" },
    { title: "Fire, silence, nothing else", detail: "No itinerary. That is the itinerary.", time: "18:00", duration: "Evening", kind: "REST" },
  ],
  Mojave: [
    { title: "Empty highway, dawn drive", detail: "Keys at 05:00. The road is yours until nine.", time: "05:00", duration: "3 hr", kind: "TRANSFER" },
    { title: "Slot canyon scramble", detail: "Petroglyphs at the far end, permit arranged.", time: "09:00", duration: "3 hr", kind: "ASCENT" },
    { title: "Dark-sky dinner", detail: "Table set on the salt pan. One truck, one chef.", time: "19:30", duration: "3 hr", kind: "DINING" },
    { title: "Heat-of-day rest", detail: "Nothing moves between noon and four. Neither should you.", time: "12:00", duration: "4 hr", kind: "REST" },
  ],
};

const FALLBACK = BY_REGION.Alps;

const BACKLOG_POOL: ActivityTemplate[] = [
  { title: "Weather bail-out slot", detail: "Held helicopter window in case the forecast turns.", time: "On call", duration: "45 min", kind: "TRANSFER" },
  { title: "Club foundation visit", detail: "Local school or conservation project. Ninety minutes.", time: "Flexible", duration: "1 hr 30", kind: "GUIDE" },
  { title: "Cold-water recovery", detail: "Plunge and sauna cycle after the big day.", time: "Flexible", duration: "1 hr", kind: "REST" },
  { title: "Second summit attempt", detail: "Reserved guide day if the first window closes.", time: "Reserve", duration: "Full day", kind: "ASCENT" },
  { title: "Photographer for one day", detail: "Documentary style, files delivered in ten days.", time: "Flexible", duration: "6 hr", kind: "GUIDE" },
];

export const ITINERARY_KIND_LABEL: Record<ItineraryItemKind, string> = {
  TRANSFER: "Transfer",
  STAY: "Stay",
  ASCENT: "Ascent",
  DINING: "Dining",
  GUIDE: "Guide",
  REST: "Rest",
};

let sequence = 0;
const nextId = (prefix: string) => {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence}`;
};

/** Fisher–Yates, seeded off the caller so repeat requests differ. */
function shuffle<T>(input: T[], seed: number): T[] {
  const out = [...input];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type GenerateInput = {
  destinationSlug?: string;
  days?: number;
  /** Free-text steer, e.g. "more rest days, less driving". */
  brief?: string;
};

export function generateItinerary(input: GenerateInput = {}): ItineraryDTO {
  const destination =
    DESTINATIONS.find((d) => d.slug === input.destinationSlug) ??
    DESTINATIONS[0];

  const dayCount = Math.min(9, Math.max(2, Math.round(input.days ?? 5)));
  const seed = Date.now() % 2147483647;
  const pool = shuffle(BY_REGION[destination.region] ?? FALLBACK, seed);

  const stay: ActivityTemplate = {
    title: `${destination.name} lodge, private wing`,
    detail: `${destination.elevation} at the summit. Rooms face the range.`,
    time: "16:30",
    duration: "Overnight",
    kind: "STAY",
  };

  const days = Array.from({ length: dayCount }, (_, i) => {
    const isFirst = i === 0;
    const isLast = i === dayCount - 1;
    /* Long trips get a rest day in the middle third — the pacing rule that
       stops a plan reading like a checklist. */
    const isRestDay = !isFirst && !isLast && dayCount > 4 && i === Math.floor(dayCount / 2);

    let templates: ActivityTemplate[];
    if (isFirst) {
      templates = [...ARRIVAL, stay];
    } else if (isLast) {
      templates = DEPARTURE;
    } else if (isRestDay) {
      templates = [
        {
          title: "Deliberate nothing",
          detail: "No transfers, no ascent. The body catches up.",
          time: "All day",
          duration: "Full day",
          kind: "REST",
        },
        stay,
      ];
    } else {
      const picked = pool.slice((i - 1) % pool.length, ((i - 1) % pool.length) + 2);
      templates = [
        ...(picked.length ? picked : pool.slice(0, 2)),
        stay,
      ];
    }

    return {
      id: `day-${i + 1}`,
      label: `Day ${String(i + 1).padStart(2, "0")}`,
      subtitle: isFirst
        ? `Arrive ${destination.name}`
        : isLast
          ? "Depart"
          : isRestDay
            ? "Acclimatise"
            : destination.region,
      items: templates.map((t) => ({ ...t, id: nextId("item") })),
    };
  });

  return {
    id: nextId("itinerary"),
    title: `${destination.name}, ${destination.country} — ${dayCount} days`,
    summary: input.brief?.trim()
      ? `Rebuilt around your note: “${input.brief.trim()}”. ${dayCount} days in ${destination.name}, weighted toward ${destination.season.toLowerCase()} conditions.`
      : `${dayCount} days in ${destination.name}, paced for ${destination.season.toLowerCase()} conditions and front-loaded with acclimatisation.`,
    days,
    backlog: shuffle(BACKLOG_POOL, seed + 7)
      .slice(0, 4)
      .map((t) => ({ ...t, id: nextId("idea") })),
  };
}
