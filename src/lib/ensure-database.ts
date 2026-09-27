import "server-only";

import { execSync } from "node:child_process";

import {
  checkDatabaseConnection,
  invalidateDatabaseReachabilityCache,
} from "@/lib/db";

/** In local dev, try to start embedded PostgreSQL before rejecting sign-in. */
export async function ensureDatabaseForAuth(): Promise<boolean> {
  if (await checkDatabaseConnection()) return true;
  if (process.env.NODE_ENV !== "development") return false;

  try {
    execSync("npm run db:ensure", {
      cwd: process.cwd(),
      stdio: "pipe",
      timeout: 120_000,
      env: process.env,
    });
    invalidateDatabaseReachabilityCache();
    return checkDatabaseConnection(true);
  } catch {
    return false;
  }
}
