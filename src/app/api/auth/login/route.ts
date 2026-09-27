import { NextResponse } from "next/server";

import {
  DATABASE_REQUIRED,
  credentialsSchema,
  findUserByEmail,
  isDatabaseReady,
  startSession,
  toSessionUser,
  verifyPassword,
} from "@/lib/auth";
import { ensureDatabaseForAuth } from "@/lib/ensure-database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!(await isDatabaseReady())) {
    await ensureDatabaseForAuth();
  }
  if (!(await isDatabaseReady())) {
    return NextResponse.json({ error: DATABASE_REQUIRED }, { status: 503 });
  }

  const parsed = credentialsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check your details." },
      { status: 422 },
    );
  }

  const user = await findUserByEmail(parsed.data.email);

  /* One message for "no such account" and "wrong password" alike, so the
     endpoint cannot be used to enumerate members. */
  const ok = user && (await verifyPassword(parsed.data.password, user.passwordHash));
  if (!user || !ok) {
    return NextResponse.json(
      { error: "Those details did not match our records." },
      { status: 401 },
    );
  }

  await startSession(user);

  return NextResponse.json({ user: toSessionUser(user) });
}
