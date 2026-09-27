import { jwtVerify, SignJWT, type JWTPayload } from "jose";

/**
 * Edge-safe token helpers. Deliberately free of Prisma and bcrypt imports so
 * middleware can verify a session without pulling a Node runtime into scope.
 */

export const SESSION_COOKIE = "ec_session";
const ISSUER = "escape-club";
const AUDIENCE = "escape-club-members";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionClaims = {
  sub: string;
  email: string;
  name: string;
};

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be set to a string of at least 32 characters.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({ email: claims.email, name: claims.name } as JWTPayload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
} as const;
