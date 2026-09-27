import { spawn } from "node:child_process";
import { join } from "node:path";

import { applyDatabaseUrlFromEnv } from "./database-url";
import { loadEnvFiles } from "./load-env-files";

loadEnvFiles();
applyDatabaseUrlFromEnv();

const root = process.cwd();

async function main() {
  const ensure = spawn("npm run db:ensure", {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  const code = await new Promise<number>((resolve) => {
    ensure.on("close", resolve);
  });

  if (code !== 0) process.exit(code);

  const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
  const next = spawn(process.execPath, [nextBin, "dev"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: false,
  });

  next.on("close", (c) => process.exit(c ?? 0));
}

main();
