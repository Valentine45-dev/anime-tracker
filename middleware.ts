import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for an API route that requires authentication
  if (request.nextUrl.pathname.startsWith('/api/user/') || 
      request.nextUrl.pathname.startsWith('/api/anime-list/')) {
    
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/user/:path*',
    '/api/anime-list/:path*',
  ],
}
