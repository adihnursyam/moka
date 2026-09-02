import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Preserve the current voting deadline until the CMS campaign replaces it.
const votingEndTime = new Date("2025-08-09T23:59:59+07:00");

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isVotingActive = new Date() < votingEndTime;

  if (!isVotingActive && !pathname.startsWith("/voting/hasil")) {
    return NextResponse.redirect(new URL("/404", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/voting/:path*",
};
