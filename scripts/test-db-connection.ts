import { PrismaClient } from "@prisma/client";

import { applyDatabaseUrlFromEnv } from "./database-url";
import { loadEnvFiles } from "./load-env-files";

loadEnvFiles();

const url = applyDatabaseUrlFromEnv();
if (!url) {
  console.error("DATABASE_URL / DB_* not configured.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to TiDB / MySQL…");
  await prisma.$queryRaw`SELECT 1`;
  console.log("✓ Connection OK\n");

  const tables = ["User", "Destination", "Trip", "Itinerary", "BookingEvent"] as const;
  for (const table of tables) {
    try {
      const result = await prisma.$queryRawUnsafe<{ c: bigint }[]>(
        `SELECT COUNT(*) AS c FROM \`${table}\``,
      );
      const count = Number(result[0]?.c ?? 0);
      console.log(`  ${table}: ${count} rows`);
    } catch (error) {
      console.log(`  ${table}: missing or inaccessible (${(error as Error).message})`);
    }
  }

  const destinations = await prisma.destination.findMany({
    select: { slug: true, name: true },
    orderBy: { slug: "asc" },
  });
  console.log(`\n✓ Destinations: ${destinations.length} / 8 expected`);
  for (const d of destinations) {
    console.log(`    · ${d.slug} (${d.name})`);
  }

  if (destinations.length < 8) {
    console.log("\nRun: npm run db:apply-sql && npm run db:seed");
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error("Connection failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
