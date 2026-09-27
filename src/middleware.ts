import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt";

/**
 * Gate the member area at the edge so an unauthenticated request never
 * reaches a dashboard render. Runs on the edge runtime — hence the
 * jose-only token helper rather than anything touching Prisma.
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const claims = await verifySessionToken(token);

  if (!claims) {
    const url = new URL("/join", request.url);
    url.searchParams.set("mode", "signin");
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
