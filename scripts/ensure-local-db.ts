import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import net from "node:net";

import { PrismaClient } from "@prisma/client";

import {
  applyDatabaseUrlFromEnv,
  isCloudDatabaseHost,
  isMysqlDatabaseUrl,
} from "./database-url";
import { loadEnvFiles } from "./load-env-files";
import { spawnHidden } from "./spawn-hidden";

loadEnvFiles();
applyDatabaseUrlFromEnv();

const root = process.cwd();
const pgPort = 5432;
const pidFile = join(root, ".data", "postgres-server.pid");

function isPortOpen(host: string, p: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port: p });
    socket.setTimeout(1500);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(false));
  });
}

function isProcessRunning(pid: number): boolean {
  if (!pid || Number.isNaN(pid)) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code === "EPERM";
  }
}

function readSavedPostgresPid(): number | null {
  if (!existsSync(pidFile)) return null;
  const pid = Number.parseInt(readFileSync(pidFile, "utf8").trim(), 10);
  return Number.isFinite(pid) ? pid : null;
}

async function canUseAppDatabase(): Promise<boolean> {
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function waitForDatabase(maxAttempts = 45): Promise<boolean> {
  for (let i = 1; i <= maxAttempts; i += 1) {
    if (await canUseAppDatabase()) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

function startEmbeddedServerDetached() {
  const savedPid = readSavedPostgresPid();
  if (savedPid && isProcessRunning(savedPid)) {
    return;
  }

  const tsx = join(root, "node_modules", "tsx", "dist", "cli.mjs");
  const script = join(root, "scripts", "embedded-postgres-server.ts");
  const child = spawnHidden(process.execPath, [tsx, script], {
    cwd: root,
    detached: true,
    stdio: "ignore",
    env: process.env,
  });
  child.unref();
  if (child.pid) {
    mkdirSync(join(root, ".data"), { recursive: true });
    writeFileSync(pidFile, String(child.pid), "utf8");
  }
}

async function needsSchema(): Promise<boolean> {
  const prisma = new PrismaClient();
  try {
    await prisma.destination.findFirst({ select: { id: true } });
    return false;
  } catch {
    return true;
  } finally {
    await prisma.$disconnect();
  }
}

async function needsSeedData(): Promise<boolean> {
  const prisma = new PrismaClient();
  try {
    const destinations = await prisma.destination.count();
    return destinations === 0;
  } catch {
    return true;
  } finally {
    await prisma.$disconnect();
  }
}

async function ensurePostgresEmbedded() {
  if (await canUseAppDatabase()) {
    console.log("[db] PostgreSQL already running.");
    return;
  }
  if (!(await isPortOpen("127.0.0.1", pgPort))) {
    console.log("[db] Starting embedded PostgreSQL (background) …");
    startEmbeddedServerDetached();
    return;
  }
  console.log(
    "[db] Port 5432 is in use but DATABASE_URL failed. Check .env credentials.",
  );
  process.exit(1);
}

async function ensureMysql() {
  const host = process.env.DB_HOST ?? "127.0.0.1";
  const port = Number(process.env.DB_PORT ?? 3306);

  if (isCloudDatabaseHost(host)) {
    if (await canUseAppDatabase()) {
      console.log("[db] Cloud MySQL (TiDB) connection OK.");
      return;
    }
    console.error(
      `[db] Cannot reach TiDB at ${host}:${port}. Check .env.local credentials and SSL.`,
    );
    process.exit(1);
  }

  if (await canUseAppDatabase()) {
    console.log("[db] MySQL connection OK.");
    return;
  }
  if (!(await isPortOpen(host, port))) {
    console.error(
      `[db] MySQL is not running on ${host}:${port}. Start MySQL and create database "${process.env.DB_NAME}".`,
    );
    process.exit(1);
  }
  console.error(
    "[db] MySQL is listening but login failed. Check DB_USER, DB_PASSWORD, DB_NAME in .env.",
  );
  process.exit(1);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("[db] Set DATABASE_URL or DB_* variables in .env");
    process.exit(1);
  }

  if (isMysqlDatabaseUrl()) {
    await ensureMysql();
  } else {
    await ensurePostgresEmbedded();
  }

  const ready = await waitForDatabase();
  if (!ready) {
    console.error("[db] Database did not become ready.");
    process.exit(1);
  }

  if (await needsSchema()) {
    console.log("[db] Applying database/escape-club.sql …");
    try {
      execSync("npm run db:apply-sql", { stdio: "inherit", cwd: root });
    } catch {
      /* tables may already exist */
    }
  }

  if (await needsSeedData()) {
    console.log("[db] Seeding destinations & feed …");
    execSync("npm run db:seed", { stdio: "inherit", cwd: root });
  }

  console.log("[db] Ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
