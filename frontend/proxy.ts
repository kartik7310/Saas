import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const isPublicPath = pathname === '/login' || pathname === '/signup'

  // If user has a cookie and visits login/signup, send them to root
  // AuthContext will redirect them to their role-specific dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // NOTE: We do NOT block dashboard routes here.
  // In production, the token cookie is set by the backend (different domain),
  // so this middleware (running on the frontend domain) can never see it.
  // Dashboard auth is handled client-side by AuthContext via API calls.

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/signup',
  ],
}
