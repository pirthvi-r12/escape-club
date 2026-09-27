import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient | null;
};

/**
 * MySQL (or PostgreSQL) is required for membership and persisted trips. When DATABASE_URL
 * is absent the client is not created and auth/data routes return empty or 503.
 */
export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;

  if (globalForPrisma.prisma === undefined) {
    try {
      globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    } catch {
      globalForPrisma.prisma = null;
    }
  }

  return globalForPrisma.prisma ?? null;
}

export const isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL);
