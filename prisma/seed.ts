import { PrismaClient, type Tier } from "@prisma/client";

import { DESTINATIONS, destinationImage } from "@/lib/content";

const prisma = new PrismaClient();

const FIRST_NAMES = [
  "Aurélie", "Daniel", "Mira", "Kenji", "Sofia", "Tomas", "Noor", "Halvard",
  "Ingrid", "Rafael", "Amara", "Lucas", "Yuki", "Priya", "Mathis", "Freya",
];
const TIERS: Tier[] = ["EXPLORER", "VOYAGER", "OBSIDIAN"];

async function main() {
  console.log("Seeding Escape Club…");

  for (const d of DESTINATIONS) {
    await prisma.destination.upsert({
      where: { slug: d.slug },
      create: {
        slug: d.slug,
        name: d.name,
        country: d.country,
        region: d.region,
        lat: d.lat,
        lng: d.lng,
        heroImage: destinationImage(d.slug, 1600),
        tagline: d.tagline,
        basePrice: d.basePrice,
      },
      update: {
        name: d.name,
        country: d.country,
        region: d.region,
        lat: d.lat,
        lng: d.lng,
        heroImage: destinationImage(d.slug, 1600),
        tagline: d.tagline,
        basePrice: d.basePrice,
      },
    });
  }
  console.log(`  ✓ ${DESTINATIONS.length} destinations`);

  const events = await prisma.bookingEvent.count();
  if (events === 0) {
    await prisma.bookingEvent.createMany({
      data: Array.from({ length: 24 }, (_, i) => {
        const dest = DESTINATIONS[i % DESTINATIONS.length];
        const nights = 4 + ((i * 3) % 14);
        return {
          memberName: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${String.fromCharCode(
            65 + (i % 26),
          )}.`,
          memberTier: TIERS[i % TIERS.length],
          destination: dest.name,
          country: dest.country,
          amount: Math.round((dest.basePrice * nights) / 7 / 100) * 100,
          createdAt: new Date(Date.now() - i * 1000 * 60 * (3 + (i % 11))),
        };
      }),
    });
    console.log("  ✓ 24 booking events");
  } else {
    console.log(`  ✓ booking feed (${events} events, skipped)`);
  }

  console.log("\nDone. Register at /join to create your member account.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
