import "server-only";

import { DESTINATIONS, destinationImage } from "@/lib/content";
export type DiscoveryDestination = {
  slug: string;
  name: string;
  country: string;
  region: string;
  tagline: string;
  image: string;
};

/** Curated picks for empty-state discovery panels. */
export function getDiscoveryDestinations(
  slugs = ["annapurna", "zermatt", "moraine-lake", "isle-of-skye"],
): DiscoveryDestination[] {
  return slugs
    .map((slug) => DESTINATIONS.find((d) => d.slug === slug))
    .filter(Boolean)
    .map((d) => ({
      slug: d!.slug,
      name: d!.name,
      country: d!.country,
      region: d!.region,
      tagline: d!.tagline,
      image: destinationImage(d!.slug, 1200),
    }));
}

export function getAtmosphereSlides() {
  const picks = ["annapurna", "zermatt", "pragser-wildsee"] as const;
  return picks.map((slug) => {
    const d = DESTINATIONS.find((x) => x.slug === slug)!;
    return {
      src: destinationImage(slug, 1600),
      label: d.name,
      meta: d.region,
    };
  });
}
