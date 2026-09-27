import { NextResponse } from "next/server";

import {
  DATABASE_REQUIRED,
  createUser,
  findUserByEmail,
  isDatabaseReady,
  registerSchema,
  startSession,
  toSessionUser,
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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check your details." },
      { status: 422 },
    );
  }

  if (await findUserByEmail(parsed.data.email)) {
    return NextResponse.json(
      { error: "There is already an application against that address." },
      { status: 409 },
    );
  }

  const user = await createUser(parsed.data);
  await startSession(user);

  return NextResponse.json({ user: toSessionUser(user) }, { status: 201 });
}
