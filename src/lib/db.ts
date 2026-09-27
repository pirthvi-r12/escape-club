import "server-only";

import type { PrismaClient } from "@prisma/client";

import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";

const REACHABILITY_TTL_MS = 8_000;

let reachabilityCache: { ok: boolean; checkedAt: number } | null = null;

export function isPrismaConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const e = error as { code?: string; name?: string; message?: string };

  if (e.name === "PrismaClientInitializationError") return true;
  if (e.code === "P1001" || e.code === "P1008" || e.code === "P1017") return true;

  const message = e.message ?? "";
  return (
    message.includes("Can't reach database server") ||
    message.includes("Connection refused") ||
    message.includes("ECONNREFUSED")
  );
}

function setReachability(ok: boolean) {
  reachabilityCache = { ok, checkedAt: Date.now() };
}

/** Clears cached reachability (e.g. after `npm run db:up`). */
export function invalidateDatabaseReachabilityCache() {
  reachabilityCache = null;
}

/** Lightweight connectivity check for API routes and server components. */
export async function checkDatabaseConnection(
  force = false,
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;

  if (
    !force &&
    reachabilityCache &&
    Date.now() - reachabilityCache.checkedAt < REACHABILITY_TTL_MS
  ) {
    return reachabilityCache.ok;
  }

  const prisma = getPrisma();
  if (!prisma) {
    setReachability(false);
    return false;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    setReachability(true);
    return true;
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      setReachability(false);
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[escape-club/db] PostgreSQL is not running. Start it with npm run db:up or install PostgreSQL locally.",
        );
      }
      return false;
    }
    throw error;
  }
}

export type DatabaseStatus = "not_configured" | "unreachable" | "ready";

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  if (!isDatabaseConfigured()) return "not_configured";
  return (await checkDatabaseConnection()) ? "ready" : "unreachable";
}

/**
 * Runs a Prisma query and returns `fallback` when the database is down,
 * instead of crashing the page with PrismaClientInitializationError.
 */
export async function runPrismaQuery<T>(
  fn: (prisma: PrismaClient) => Promise<T>,
  fallback: T,
): Promise<T> {
  const prisma = getPrisma();
  if (!prisma) return fallback;

  try {
    const result = await fn(prisma);
    setReachability(true);
    return result;
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      setReachability(false);
      return fallback;
    }
    throw error;
  }
}
