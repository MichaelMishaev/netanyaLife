import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  // Add pathname header for layout detection
  const pathname = request.nextUrl.pathname
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  // Create a new request with the updated headers
  const modifiedRequest = new NextRequest(request, {
    headers: requestHeaders,
  })

  // Run i18n middleware with modified request
  return intlMiddleware(modifiedRequest)
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(he|ru)/:path*'],
}
