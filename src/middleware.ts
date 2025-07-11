// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Set the same cutoff time as the navigation component
const votingEndTime = new Date('2025-07-11T23:59:59+07:00');

export function middleware(request: NextRequest) {
  // Check if the request is for the voting page
  if (request.nextUrl.pathname.startsWith('/voting')) {
    const isVotingActive = new Date() < votingEndTime;

    // If voting is no longer active, redirect them
    if (!isVotingActive) {
      // Redirect to the homepage or a "voting closed" page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Allow the request to proceed if voting is active
  return NextResponse.next();
}

// Specify that this middleware should only run for the voting route
export const config = {
  matcher: '/voting/:path*',
};
