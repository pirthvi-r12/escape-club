import { execSync } from "node:child_process";
import { existsSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { applyDatabaseUrlFromEnv, isMysqlDatabaseUrl } from "./database-url";
import { loadEnvFiles } from "./load-env-files";

loadEnvFiles();
applyDatabaseUrlFromEnv();

const root = process.cwd();
const sqlDir = join(root, "database");
const mainFile = "escape-club.sql";
const schemaPath = join(root, "prisma", "schema.prisma");

const RESET_SQL_MYSQL = `
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS \`Itinerary\`;
DROP TABLE IF EXISTS \`Trip\`;
DROP TABLE IF EXISTS \`BookingEvent\`;
DROP TABLE IF EXISTS \`Destination\`;
DROP TABLE IF EXISTS \`User\`;
SET FOREIGN_KEY_CHECKS = 1;
`.trim();

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL or DB_HOST/DB_USER/DB_NAME is not set. Copy .env.example to .env.",
  );
  process.exit(1);
}

const mode = process.argv[2] ?? "apply";

function runFile(path: string, label: string) {
  console.log(`→ ${label}`);
  execSync(
    `npx prisma db execute --file "${path}" --schema "${schemaPath}"`,
    { stdio: "inherit", env: process.env },
  );
}

const mainPath = join(sqlDir, mainFile);
if (!existsSync(mainPath)) {
  console.error(`Missing ${mainPath}`);
  process.exit(1);
}

if (mode === "reset") {
  if (!isMysqlDatabaseUrl()) {
    console.error("db:reset is configured for MySQL only.");
    process.exit(1);
  }
  const resetPath = join(tmpdir(), "escape-club-reset.sql");
  writeFileSync(resetPath, RESET_SQL_MYSQL, "utf8");
  try {
    runFile(resetPath, "reset (drop tables)");
  } finally {
    unlinkSync(resetPath);
  }
}

runFile(mainPath, mainFile);

console.log("\nSQL apply complete.");
