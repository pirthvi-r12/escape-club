import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";

import { checkDatabaseConnection, runPrismaQuery } from "@/lib/db";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
} from "@/lib/jwt";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import type { SessionUser, Tier } from "@/types";

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2, "Tell us your name.").max(60),
});

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const DATABASE_REQUIRED =
  "PostgreSQL is not running. In the project folder run npm run db:ensure, then try again (or restart with npm run dev).";

export const DATABASE_NOT_CONFIGURED =
  "Set DATABASE_URL in .env, then run npm run db:setup (Docker) or npm run db:apply-sql && npm run db:seed.";

type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  tier: Tier;
  homeCity: string | null;
  avatarUrl: string | null;
};

const toSessionUser = (u: StoredUser): SessionUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  tier: u.tier,
  homeCity: u.homeCity,
  avatarUrl: u.avatarUrl,
});

/** True when DATABASE_URL is set (does not verify the server is running). */
export function isDatabaseConfiguredForAuth() {
  return isDatabaseConfigured();
}

/** True when PostgreSQL accepts connections. */
export async function isDatabaseReady() {
  return checkDatabaseConnection();
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  return runPrismaQuery(
    (prisma) =>
      prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      }) as Promise<StoredUser | null>,
    null,
  );
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  return runPrismaQuery(
    (prisma) =>
      prisma.user.findUnique({ where: { id } }) as Promise<StoredUser | null>,
    null,
  );
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<StoredUser> {
  const prisma = getPrisma();
  if (!prisma) {
    throw new Error(DATABASE_NOT_CONFIGURED);
  }

  const reachable = await checkDatabaseConnection(true);
  if (!reachable) {
    throw new Error(DATABASE_REQUIRED);
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
    },
  });
  return user as StoredUser;
}

export async function startSession(user: StoredUser) {
  const token = await signSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Resolves the signed-in member, or null. Safe to call from any server file. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const claims = await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!claims) return null;

  const user = await findUserById(claims.sub);
  return user ? toSessionUser(user) : null;
}

export { toSessionUser };
