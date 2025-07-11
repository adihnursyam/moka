// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// The deadline remains the same
const votingEndTime = new Date('2025-07-11T23:59:59+07:00');

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isVotingActive = new Date() < votingEndTime;

  // If voting has ended AND the path is NOT for the results page
  if (!isVotingActive && !pathname.startsWith('/voting/hasil')) {
    // Redirect them from any other /voting/* path
    return NextResponse.redirect(new URL('/404', request.url));
  }

  // Otherwise, allow the request to proceed
  return NextResponse.next();
}

// The matcher remains the same, as it needs to run for all /voting routes
export const config = {
  matcher: '/voting/:path*',
};