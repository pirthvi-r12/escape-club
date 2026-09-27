import { existsSync } from "node:fs";
import { join } from "node:path";

import EmbeddedPostgres from "embedded-postgres";

const root = process.cwd();
const dataDir = join(root, ".data", "postgres");
const port = Number(process.env.PGPORT ?? 5432);
const user = process.env.PGUSER ?? "postgres";
const password = process.env.PGPASSWORD ?? "postgres";
const dbName = process.env.PGDATABASE ?? "escape_club";

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user,
  password,
  port,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

async function main() {
  const initialised = existsSync(join(dataDir, "PG_VERSION"));

  if (!initialised) {
    console.log("[postgres] Initialising cluster in .data/postgres …");
    await pg.initialise();
  }

  console.log(`[postgres] Starting on localhost:${port} …`);
  await pg.start();

  if (!initialised) {
    console.log(`[postgres] Creating database "${dbName}" …`);
    await pg.createDatabase(dbName);
  }

  console.log("[postgres] Ready. Press Ctrl+C to stop.");

  const shutdown = async () => {
    console.log("\n[postgres] Stopping …");
    await pg.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[postgres] Failed:", err);
  process.exit(1);
});
