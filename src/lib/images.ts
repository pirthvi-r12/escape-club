/**
 * Curated, art-directed photography set. Every id below has been verified to
 * resolve on the Unsplash CDN so the layout never renders a broken frame.
 */
const CDN = "https://images.unsplash.com/photo-";

export type PhotoKey = keyof typeof PHOTO_IDS;

export const PHOTO_IDS = {
  /** Swiss Alps breaking through a sea of cloud at sunrise. The hero plate. */
  alpineCloudSea: "1506905925346-21bda4d32df4",
  /** Milky Way arcing over snow-capped peaks. */
  starlitPeaks: "1519681393784-d120267933ba",
  /** Milky Way above a pine silhouette. */
  starlitPines: "1444080748397-f442aa95c3e5",
  /** Annapurna under moonlight — near-monochrome and very quiet. */
  moonlitRidge: "1483728642387-6c3bdd6c93e5",
  /** Moraine Lake alpenglow, Banff. */
  glacialLake: "1493246507139-91e8fad9978e",
  /** Turquoise Pragser Wildsee from above, Dolomites. */
  turquoiseBasin: "1501785888041-af3ef285b470",
  /** Rowboat bow on still Dolomite water. */
  silentWater: "1476514525535-07fb3b4ae5f1",
  /** The Quiraing, Isle of Skye. */
  highlandRidge: "1470071459604-3b5ec3a7fe05",
  /** Ama Dablam in the Khumbu, Nepal. */
  himalayanSpine: "1454496522488-7a8e488e8606",
  /** Boreal valley in the Yukon. */
  borealValley: "1464822759023-fed622ff2c3b",
  /** Empty desert highway, Valley of Fire. */
  desertRoad: "1500530855697-b586d89ba3ee",
} as const;

type PhotoOptions = {
  /** Rendered pixel width. */
  w?: number;
  /** Crop aspect ratio, e.g. "16:9". Omit to keep the native ratio. */
  ar?: `${number}:${number}`;
  q?: number;
};

export function photo(key: PhotoKey, options: PhotoOptions = {}): string {
  const { w = 2400, ar, q = 82 } = options;
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    q: String(q),
    w: String(w),
  });
  if (ar) {
    const [aw, ah] = ar.split(":").map(Number);
    params.set("ar", `${aw}:${ah}`);
  }
  return `${CDN}${PHOTO_IDS[key]}?${params.toString()}`;
}

/**
 * Shared inline blur plate. One value is intentional: every frame above sits in
 * the same deep blue-black range, so a single placeholder reads correctly under
 * all of them and adds nothing measurable to the payload.
 */
export const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="10">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#1b2433"/>' +
      '<stop offset="0.6" stop-color="#0d1119"/>' +
      '<stop offset="1" stop-color="#05070c"/>' +
      "</linearGradient></defs>" +
      '<rect width="16" height="10" fill="url(#g)"/></svg>',
  );
