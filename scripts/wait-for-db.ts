import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const maxAttempts = 30;
const delayMs = 2000;

async function main() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("Database is ready.");
      return;
    } catch {
      console.log(`Waiting for database (${attempt}/${maxAttempts})…`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  console.error("Database did not become ready in time.");
  process.exit(1);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
