import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

// Supported locales
export const locales = ['he', 'ru'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale from the request
  let locale = await requestLocale

  // Ensure that a valid locale is used - fallback to default if undefined or invalid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Asia/Jerusalem',
    now: new Date(),
  }
})
