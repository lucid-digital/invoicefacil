import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Check if the request is for an API route (except public, auth, and setup routes)
  if (
    path.startsWith('/api/') && 
    !path.startsWith('/api/public/') && 
    !path.startsWith('/api/auth/') &&
    !path.startsWith('/api/setup')
  ) {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    // If there's no authorization header, return a 401 response
    if (!authHeader) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // For now, we'll just check if the header exists
    // In a real app, you would validate the token here
    
    // Continue with the request
    return NextResponse.next();
  }
  
  // For non-API routes, just continue
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
}; 