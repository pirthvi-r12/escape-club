export type Tier = "EXPLORER" | "VOYAGER" | "OBSIDIAN";

export type TripStatus = "DREAMING" | "BOOKED" | "COMPLETED" | "CANCELLED";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  tier: Tier;
  homeCity: string | null;
  avatarUrl: string | null;
};

export type TripDestination = {
  slug: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  image: string;
};

export type TripDTO = {
  id: string;
  title: string;
  status: TripStatus;
  /** ISO 8601 — dates cross the network as strings. */
  startDate: string;
  endDate: string;
  miles: number;
  spend: number;
  rating: number | null;
  destination: TripDestination;
};

export type StatsDTO = {
  totals: {
    trips: number;
    miles: number;
    countries: number;
    nights: number;
    spend: number;
    avgRating: number;
  };
  milesByMonth: { month: string; miles: number; trips: number }[];
  byRegion: { region: string; trips: number; miles: number }[];
  spendByQuarter: { quarter: string; spend: number; budget: number }[];
  tier: {
    current: Tier;
    next: Tier | null;
    milesToNext: number;
    progress: number;
  };
};

export type FeedItem = {
  id: string;
  memberName: string;
  memberTier: Tier;
  destination: string;
  country: string;
  amount: number;
  createdAt: string;
};

export type ItineraryItemKind =
  | "TRANSFER"
  | "STAY"
  | "ASCENT"
  | "DINING"
  | "GUIDE"
  | "REST";

export type ItineraryItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  duration: string;
  kind: ItineraryItemKind;
};

export type ItineraryDay = {
  id: string;
  label: string;
  subtitle: string;
  items: ItineraryItem[];
};

export type ItineraryDTO = {
  id: string;
  title: string;
  summary: string;
  days: ItineraryDay[];
  /** Ideas the AI suggested but did not schedule. */
  backlog: ItineraryItem[];
};
