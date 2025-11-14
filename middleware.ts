import createMiddleware from 'next-intl/middleware'
import { locales } from './i18n/request'

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'he',

  // Always use locale prefix for all paths
  localePrefix: 'always',
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(he|ru)/:path*'],
}
