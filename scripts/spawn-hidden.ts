import { spawn, type SpawnOptions } from "node:child_process";

/** Windows: do not flash a new console window for background Node/Postgres. */
const CREATE_NO_WINDOW = 0x08000000;

export function spawnHidden(
  command: string,
  args: string[],
  options: SpawnOptions = {},
) {
  const win32 =
    process.platform === "win32"
      ? { windowsHide: true, creationFlags: CREATE_NO_WINDOW }
      : {};

  return spawn(command, args, {
    ...options,
    ...win32,
  });
}
