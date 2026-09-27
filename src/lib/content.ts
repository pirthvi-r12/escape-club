import { photo, type PhotoKey } from "@/lib/images";

export type DestinationSeed = {
  slug: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  photoKey: PhotoKey;
  tagline: string;
  basePrice: number;
  /** Editorial metadata surfaced on the landing rail. */
  elevation: string;
  season: string;
};

export const DESTINATIONS: DestinationSeed[] = [
  {
    slug: "zermatt",
    name: "Zermatt",
    country: "Switzerland",
    region: "Alps",
    lat: 46.0207,
    lng: 7.7491,
    photoKey: "alpineCloudSea",
    tagline: "Wake above the weather.",
    basePrice: 8400,
    elevation: "4,478 m",
    season: "Dec — Apr",
  },
  {
    slug: "moraine-lake",
    name: "Moraine Lake",
    country: "Canada",
    region: "Rockies",
    lat: 51.3217,
    lng: -116.1860,
    photoKey: "glacialLake",
    tagline: "Ten peaks, one mirror.",
    basePrice: 6200,
    elevation: "1,885 m",
    season: "Jun — Sep",
  },
  {
    slug: "pragser-wildsee",
    name: "Pragser Wildsee",
    country: "Italy",
    region: "Dolomites",
    lat: 46.6947,
    lng: 12.0847,
    photoKey: "turquoiseBasin",
    tagline: "Glacier water, rowed slowly.",
    basePrice: 5400,
    elevation: "1,496 m",
    season: "May — Oct",
  },
  {
    slug: "isle-of-skye",
    name: "Isle of Skye",
    country: "Scotland",
    region: "Hebrides",
    lat: 57.4125,
    lng: -6.1930,
    photoKey: "highlandRidge",
    tagline: "Weather as a main character.",
    basePrice: 4100,
    elevation: "992 m",
    season: "Apr — Sep",
  },
  {
    slug: "khumbu",
    name: "Khumbu",
    country: "Nepal",
    region: "Himalaya",
    lat: 27.9881,
    lng: 86.9250,
    photoKey: "himalayanSpine",
    tagline: "The long walk upward.",
    basePrice: 12800,
    elevation: "5,364 m",
    season: "Mar — May",
  },
  {
    slug: "annapurna",
    name: "Annapurna",
    country: "Nepal",
    region: "Himalaya",
    lat: 28.5961,
    lng: 83.8203,
    photoKey: "moonlitRidge",
    tagline: "Moonlight on a sleeping giant.",
    basePrice: 9600,
    elevation: "8,091 m",
    season: "Oct — Nov",
  },
  {
    slug: "kluane",
    name: "Kluane",
    country: "Canada",
    region: "Yukon",
    lat: 60.7522,
    lng: -137.5108,
    photoKey: "borealValley",
    tagline: "Nobody for a hundred miles.",
    basePrice: 7300,
    elevation: "5,959 m",
    season: "Jun — Aug",
  },
  {
    slug: "valley-of-fire",
    name: "Valley of Fire",
    country: "United States",
    region: "Mojave",
    lat: 36.4816,
    lng: -114.5250,
    photoKey: "desertRoad",
    tagline: "An empty road and a full tank.",
    basePrice: 3900,
    elevation: "610 m",
    season: "Nov — Mar",
  },
];

export const destinationImage = (slug: string, width = 1600) => {
  const found = DESTINATIONS.find((d) => d.slug === slug);
  return photo(found?.photoKey ?? "alpineCloudSea", { w: width });
};

/** Copy blocks for the pinned "zoom through the camera" scroll sequence. */
export const STORY_CHAPTERS = [
  {
    word: "ALTITUDE",
    photoKey: "alpineCloudSea" as PhotoKey,
    caption: "Above 3,000 metres the noise simply stops.",
  },
  {
    word: "SILENCE",
    photoKey: "moonlitRidge" as PhotoKey,
    caption: "No signal. No schedule. No small talk.",
  },
  {
    word: "DISTANCE",
    photoKey: "starlitPeaks" as PhotoKey,
    caption: "Far enough that yesterday loses its grip.",
  },
  {
    word: "RETURN",
    photoKey: "silentWater" as PhotoKey,
    caption: "You come back as a slightly different person.",
  },
];

export const MANIFESTO =
  "We do not sell holidays. We arrange the specific, expensive, difficult silence that only exists at the edge of a map — then we get out of your way.";

export const EXPERIENCES = [
  {
    title: "Heli-drop bivouacs",
    body: "Flown to a ridge at dusk, collected at first light. Two people, one tent, zero witnesses.",
    photoKey: "starlitPines" as PhotoKey,
    tag: "Alps · Andes · Yukon",
  },
  {
    title: "Private glacier traverse",
    body: "A certified guide, a rope, and a body of ice older than every language you speak.",
    photoKey: "glacialLake" as PhotoKey,
    tag: "Rockies · Patagonia",
  },
  {
    title: "Dawn water, no engine",
    body: "A wooden boat on glacial melt before the first coach party reaches the car park.",
    photoKey: "silentWater" as PhotoKey,
    tag: "Dolomites",
  },
  {
    title: "The long ascent",
    body: "Eighteen days of walking to stand somewhere that took a continent to build.",
    photoKey: "himalayanSpine" as PhotoKey,
    tag: "Himalaya",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "I have booked with every concierge worth the name. Escape Club is the only one that has ever told me my plan was bad and then fixed it.",
    name: "Aurélie Vasseur",
    role: "Obsidian member · 31 countries",
  },
  {
    quote:
      "Four hours after I landed I was on a glacier with a guide who knew my coffee order. That is the whole product.",
    name: "Daniel Okonjo",
    role: "Voyager member · 19 countries",
  },
  {
    quote:
      "The itinerary tool rebuilt eleven days around one weather window. It was better than what I had spent a month planning.",
    name: "Mira Halvorsen",
    role: "Obsidian member · 44 countries",
  },
];

export const CLUB_STATS = [
  { label: "Members", value: 2480, suffix: "" },
  { label: "Countries covered", value: 97, suffix: "" },
  { label: "Guides on retainer", value: 310, suffix: "" },
  { label: "Average member rating", value: 4.9, suffix: "/5" },
];
